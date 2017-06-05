// this is just a draft yet, a lot of stuff is left to be done...

class Cut {
    constructor(w_start, w_end, l_start, l_end) {
        this.w_start = w_start; // inclusive in the array
        this.w_end = w_end; // non inclusive in the array
        this.l_start = l_start;
        this.l_end = l_end;
    }
    getWidth() {
        return this.w_end - this.w_start;;
    }
    getLength() {
        return this.l_end - this.l_start;
    }
    getSurface() {
        return this.getLength() * this.getWidth();
    }
}

class LoadBalancingLoader {
    constructor(storage) {
        this.storage = storage;
        this.massMatrix = this.buildMassMatrix(storage);
    }

    buildMassMatrix(storage) {

        let cWieghtMatrix = {};
        for (let key in storage.containers_in) {
            // console.log(container_hold.containers_in[key]);
            let cellCoordX = storage.containers_in[key].address.x;
            let cellCoordY = storage.containers_in[key].address.y;

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
        return cWieghtMatrix;
    }
}




// TODO: maybe make it work with 2 parameters: width and length
/**
 * Splits the given cut into 9 cuts according to description of the algorithm
 * @param {int} width
 * @param {int} length 
 * @returns {Array} Returns an array of 9 cuts
 */
let makeCuts = (width, length) => {
    let widthCuts = [];
    let lengthCuts = [];

    // HORIZONTAL CUTTING (parallel to Y (== length) axis of the ship)
    // first horizontal cut
    widthCuts[0] = {};
    widthCuts[0].w_start = 0;
    widthCuts[0].w_end = Math.floor(width / 2); // exclussive boundary 
    // second horizontal cut
    widthCuts[1] = {};
    widthCuts[1].w_start = Math.floor(width / 2);
    widthCuts[1].w_end = Math.ceil(width / 2);
    // third horizontal cut
    widthCuts[2] = {};
    widthCuts[2].w_start = Math.ceil(width / 2);
    widthCuts[2].w_end = width;

    // VERTICAL CUTTING (parallel to X (== width) axis of the ship)
    // first vertical cut 
    lengthCuts[0] = {};
    lengthCuts[0].l_start = 0;
    lengthCuts[0].l_end = Math.floor(length / 2); // exclussive boundary 
    // second horizontal cut
    lengthCuts[1] = {};
    lengthCuts[1].l_start = Math.floor(length / 2);
    lengthCuts[1].l_end = Math.ceil(length / 2);
    // third horizontal cut
    lengthCuts[2] = {};
    lengthCuts[2].l_start = Math.ceil(length / 2);
    lengthCuts[2].l_end = length;


    // allocating 
    // 9 steps in total
    let cuts = [];
    for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {

            cuts.push(new Cut(widthCuts[i].w_start, widthCuts[i].w_end, lengthCuts[j].l_start, lengthCuts[j].l_end));
        }
    }
    return cuts;
}


// for testing purposes
let cuts = makeCuts(5, 7);

console.log(cuts.length);
console.log(cuts);


// TODO: make the sorting and all that
// sorting order: by size -> by weight -> by available height 
// (maybe switch the last two?)

/**
 * This method sorts the given array of cuts based on their sufrace size
 * The sorting is not fully intuitive -> it sorts in ascending, but then places the 0 sized cuts in the end
 * @param {Array} cuts the array of the Cut objects to be sorted 
 * @returns {Array} the sorted array of cuts
 */
let sortByCutSize = (cuts) => {
    return cuts.sort((a, b) => {
        let diff = a.getSurface() - b.getSurface();
        if (diff == ((-1) * b.getSurface())) {
            diff = Infinity; // maybe could be done nicer...
        }
        return diff;
    })
}

console.log(sortByCutSize(cuts).map((o) => {
    return `W: ${o.w_start} ~ ${o.w_end} _ L: ${o.l_start} ~ ${o.l_end} _ S: ${o.getSurface()}`;
}));



/**
 * Used to sort the array of given cuts by the mass weight of each
 * @param {Array} cuts the array of the Cut objects to be sorted 
 * @returns {Array} the array of the sorted cuts by their mass weight
 */
let sortByCutMassWeight = (cuts) => {
    // TODO: write the sort by mass function
}

let sortByAvailableHeight = (cuts) => {
    // TODO: write the sort by available height function
}

let GetAvailableHeight = (width, length, nr_containers) => {
    let height_level = Math.floor(Math.floor(nr_containers / width) / length) % height;
}