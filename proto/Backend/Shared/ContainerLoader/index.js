/**
 * @param {Object} container the container that s to be placed
 * @param {Object} container_hold the entity that will hold the container
 * @param {int} container_hold.x the x dimension of the container hold entity
 * @param {int} container_hold.y the y dimension of the container hold entity
 * @param {int} container_hold.z the z dimension of the container hold entity
 * @param {Array} container_hold.containers_current the array of the containers currently located in the container hold
 * @param {Function} load_method the algorthm used to allocate the containers
 * @returns {Object} returns the object with x, y and z coordinates for the container
 */
module.exports.calculateLocation = (container, container_hold, load_method) => {
    container_hold.containers_in = container_hold.containers_current.slice();
    // console.log(container_hold.containers_in)
    let loc = load_method(container, container_hold);
    // console.log(loc);
    return loc;

}


/**
 * the simplest method of spreading -> puts the containers one by one from 0;0;0 to x;y;z in a linear manner
 */
module.exports.linearLoad = (container, container_hold) => {

    let counter = container_hold.containers_in.length;
    let x = counter % container_hold.x;
    let y = 0;
    let z = 0;
    // could be a nice recursive function instead... 
    counter = Math.floor(counter / container_hold.x);
    if (counter > 0) {
        y = counter % container_hold.y;
        counter = Math.floor(counter / container_hold.y);
        if (counter > 0) {
            z = counter % container_hold.z;
        }
    }
    return { x: x, y: y, z: z };
};


/**
 * @deprecated
 */
module.exports.weightBasedLoad = (container, container_hold) => {

    let width, length, height;
    width = container_hold.x;
    length = container_hold.y;
    height = container_hold.z;
    let number_containers = container_hold.containers_in.length;

    // console.log(`per level: ${width*length}`);
    // console.log(`total: ${number_containers}`);

    // TODO: move it into a separate method
    let height_level = Math.floor(Math.floor(number_containers / width) / length) % height;
    // console.log(`height to put to: ${height_level}`);

    let cWieghtMatrix = {};
    for (let key in container_hold.containers_in) {
        // console.log(container_hold.containers_in[key]);
        let cellCoordX = container_hold.containers_in[key].address.x;
        let cellCoordY = container_hold.containers_in[key].address.y;

        // console.log(`coordinates of the cell: ${cellCoordX} : ${cellCoordY}`)

        if (!cWieghtMatrix[cellCoordX]) {

            // no containers on this X axis have been encountered => no y containers of this x axis are also 
            cWieghtMatrix[cellCoordX] = {}
            cWieghtMatrix[cellCoordX][cellCoordY] = { weight: container_hold.containers_in[key].weight, count: 1 };
        } else if (!cWieghtMatrix[cellCoordX][cellCoordY]) {

            // there have been containers on X axis, but not with this Y coordinate
            cWieghtMatrix[cellCoordX][cellCoordY] = { weight: container_hold.containers_in[key].weight, count: 1 };
        } else {

            // there have already been recorded the containers on this X and Y => this container is stacked on top of it (or beneath) and should be added to the column mass weight
            cWieghtMatrix[cellCoordX][cellCoordY].weight += container_hold.containers_in[key].weight;
            cWieghtMatrix[cellCoordX][cellCoordY].count++;
        }
    }

    // console.log("produced weight mass matrix: ")
    // console.log(cWieghtMatrix);


    let calculateCutMass = (cut, weightMatrix) => {
        let totalMass = 0;
        for (let x = cut.start_w; x < cut.end_w; x++) {
            for (let y = cut.start_l; y < cut.end_l; y++) {
                if (weightMatrix[x] && weightMatrix[x][y]) {
                    totalMass += weightMatrix[x][y].weight;
                    // console.log(`coordinates: ${x} : ${y} ; weight: ${weightMatrix[x][y].weight}`);
                }
            }
        }
        return totalMass;
    }

    // begin cutting: 
    let tryCut = (container, isParallelToWidth, width_start, length_start, width_end, length_end, iterationNumber) => {


        iterationNumber++;
        let makeNewCut = () => {
                return {
                    start_w: '',
                    start_l: '',
                    end_w: '',
                    end_l: '',
                    getWidth: function() {
                        return this.end_w - this.start_w
                    },
                    getLength: function() {
                        return this.end_l - this.start_l
                    }
                }
            }
            // console.log(`is width parallel: ${isParallelToWidth}; iteration number: ${iterationNumber}`)
        let cuts = [makeNewCut(), makeNewCut()]

        if (isParallelToWidth) {

            let cutLineCoord = length_start + Math.floor(((length_end) - length_start) / 2);
            // first cut
            cuts[0].start_w = width_start;
            cuts[0].end_w = width_end;
            cuts[0].start_l = length_start;
            cuts[0].end_l = cutLineCoord;
            // second cut
            cuts[1].start_w = width_start;
            cuts[1].end_w = width_end;
            cuts[1].start_l = cutLineCoord;
            cuts[1].end_l = length_end;
        } else {

            let cutLineCoord = width_start + Math.flor(((width_end) - width_start) / 2);
            // first cut
            cuts[0].start_w = width_start;
            cuts[0].end_w = cutLineCoord;
            cuts[0].start_l = length_start;
            cuts[0].end_l = length_end;
            // second cut
            cuts[1].start_w = cutLineCoord;
            cuts[1].end_w = width_end;
            cuts[1].start_l = length_start;
            cuts[1].end_l = length_end;
        }


        // console.log("produced cuts:")
        // console.log(cuts);
        // console.log(cuts.map((o) => { return o.getLength() * o.getWidth() }));

        // console.log(cuts);
        // select the cut with the least total weight
        for (let key in cuts) {
            // console.log(`cut's total weight: ${calculateCutMass(cuts[key], cWieghtMatrix)}`);
            cuts[key].totalMass = calculateCutMass(cuts[key], cWieghtMatrix)
        }
        // console.log(cuts.length);

        let bestCut = {};
        if (cuts[0].totalMass + container.weight < cuts[1].totalMass + container.weight) {
            bestCut = cuts[0];
        } else {
            if ((iterationNumber != 1) || (cuts[0].totalMass + container.weight > cuts[1].totalMass + container.weight)) {
                bestCut = cuts[1];
            } else {
                bestCut = cuts[0];
            }
        }
        let eq = ((cuts[0].end_l == cuts[0].end_l) &&
            ((cuts[0].start_l == cuts[0].start_l) &&
                (cuts[0].end_w == cuts[0].end_w) &&
                (cuts[0].start_w == cuts[0].start_w)));
        if ((bestCut.getLength() * bestCut.getWidth() == 1) || eq) {
            // console.log("best cut: ")
            // console.log(bestCut);
            return bestCut;
        }


        return tryCut(container, (iterationNumber % 2 == 0), bestCut.start_w, bestCut.start_l, bestCut.end_w, bestCut.end_l, iterationNumber);
    }
    let bestPosition = tryCut(container, true, 0, 0, width, length, 0);
    // console.log("received from the recursion")
    // console.log(bestPosition);
    let bestX = bestPosition.start_w;
    let bestY = bestPosition.start_l;
    let bestZ = height_level;

    return { x: bestX, y: bestY, z: bestZ }
    // return { x: 0, y: 0, z: 0 }
};

const validate = require('jsonschema').validate;
module.exports.ShipLoader = class ShipLoader {

    /**
     * 
     * @param {Object} ship
     * @param {Array} ship.containers_in 
     */
    constructor(ship) {

        this.ship = Object.assign({}, ship);
        this.totalMass = 0;
        this.allPossibilities = [];
        this.center = {
            x: ship.x / 2,
            y: ship.y / 2,
            z: 0
        };
    }

    getTotalMass() {

        if (typeof this.ship.containers_in === 'undefined') {

            return 0;
        }
        return this.ship.containers_in.map(container => {

            if (typeof container.weight === 'undefined') {

            if (typeof container.weight === 'undefined') {

                return 0;
            }
            return container.weight;
        }).reduce((a, b) => {

            return a + b;
        }, 0);
    }

    getDistanceBetweenTwoPoints(point1, point2) {

        const schema = {
            
        };
        let valid = (
            validate(point1, schema).errors.length === 0 &&
            validate(point2, schema).errors.length === 0
        );
        if(!valid) throw new Error('Invalid Input');
        let errors = validate(point1, schema)

    }

    getPlacementPossibilities() {
        let options = [];
        let zMappingMatrix = {};

        // get the list of all the options in the bottom level
        for (let xPos = 0; xPos < this.ship.x; xPos++) {

            // check the mapping option
            if (!zMappingMatrix[xPos]) {

                zMappingMatrix[xPos] = {};
            }

            for (let yPos = 0; yPos < this.ship.y; yPos++) {

                if (!zMappingMatrix[xPos][yPos]) {

                    zMappingMatrix[xPos][yPos] = {};
                }

                let option = { x: xPos, y: yPos, z: 0 };
                zMappingMatrix[xPos][yPos].option = option;

                options.push(option);
            }
        }

        for (let key in this.ship.containers_in) {
            let xPos = this.ship.containers_in[key].x;
            let yPos = this.ship.containers_in[key].y;
            let zPos = this.ship.containers_in[key].z;
            // if the z entry of the options is less or equal to the discovered one, update to +1
            if (zMappingMatrix[xPos][yPos].option.z <= zPos) {
                zMappingMatrix[xPos][yPos].option.z = zPos + 1;
            }
        }
        this.allPossibilities = options;
        return this.allPossibilities;
    }

};


// this.weightBasedLoad({ weight: 10 }, { x: 2, y: 3, z: 10, containers_in: [{ x: 0, y: 1, z: 3, weight: 10 }, { x: 0, y: 1, z: 2, weight: 10 }, { x: 0, y: 2, z: 3, weight: 15 }, { x: 1, y: 0, z: 3, weight: 19 }] })
// this.weightBasedLoad({}, { x: 2, y: 3, z: 10, containers_in: [] })


//
// let st = {
//     containers_current: [],
//     x: 3,
//     y: 2,
//     z: 34,
// };
// let conts = [];
//
// for (let i = 0; i < 10; i++) {
//     let cont = { weight: Math.floor(Math.random() * 20), address: { x: 0, y: 0, z: 0 } };
//     conts.push(cont);
// }
// // conts.sort((a, b) => { return b.weight - a.weight });
//
// for (let key in conts) {
//     conts[key].address = Object.assign(conts[key].address, this.calculateLocation(conts[key], st, this.weightBasedLoad))
//     st.containers_current.push(conts[key]);
// }
//
// console.log(st.containers_current);