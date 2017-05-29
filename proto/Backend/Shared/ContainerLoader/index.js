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
    return load_method(container, container_hold);
}


/**
 * the simplest method of spreading -> puts the containers one by one from 0;0;0 to x;y;z in a linear manner
 */
module.exports.linearLoad = (container, container_hold) => {

    let counter = container_hold.containers_in.length - 1;
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



module.exports.weightBasedLoad = (container, container_hold) => {

    let width, length, height;
    width = container_hold.x;
    length = container_hold.y;
    height = container_hold.z;
    let number_containers = container_hold.containers_in.length;

    console.log(`per level: ${width*length}`);
    console.log(`total: ${number_containers}`);

    let height_level = Math.floor(Math.floor(number_containers / width) / length) % height;
    console.log(`height to put to: ${height_level}`);

    let cWieghtMatrix = {};
    for (let key in container_hold.containers_in) {
        let cellCoordX = container_hold.containers_in[key].x;
    }

    // begin cutting: 
    let tryCut = (isParallelToWidth, width_start, length_start, width_end, length_end, iterationNumber) => {

        iterationNumber++;
        let makeNewCut = () => {
            return {
                start_w: '',
                start_l: '',
                end_w: '',
                end_l: '',
                getWidth: function() { return this.end_w - this.start_w },
                getLength: function() { return this.end_l - this.start_l }
            }
        }
        console.log(`is width parallel: ${isParallelToWidth}; iteration number: ${iterationNumber}`)
        let cuts = [makeNewCut(), makeNewCut()]

        if (isParallelToWidth) {

            let cutLineCoord = Math.ceil((length_end - length_start) / 2);
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

            let cutLineCoord = Math.ceil((width_end - width_start) / 2);
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


        console.log("produced cuts:")
        console.log(cuts);
        console.log(cuts.map((o) => { return o.getLength() * o.getWidth() }));

        // select the cut with the least total weight

        if ((cuts[0].getLength() * cuts[0].getWidth() == 0) || (cuts[1].getLength() * cuts[1].getWidth() == 0)) {
            return
        }



        tryCut((iterationNumber % 2 == 0), cuts[0].start_w, cuts[0].start_l, cuts[0].end_w, cuts[0].end_l, iterationNumber);
    }
    tryCut(true, 0, 0, width, length, 0);
}

this.weightBasedLoad({}, { x: 2, y: 3, z: 10, containers_in: [{}] })


let loc = this.calculateLocation({}, {
    containers_current: [
        {}, {},
        {}, {},
        {}, {},
        {}, {},
        {}, {},
        {}, {},
        {}, {}
    ],
    x: 2,
    y: 4,
    z: 34,
}, this.linearLoad)
console.log(loc);