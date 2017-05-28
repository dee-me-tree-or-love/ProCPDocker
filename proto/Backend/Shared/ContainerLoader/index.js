/**
 * @param {Object} container the container that s to be placed
 * @param {Object} container_hold the entity that will hold the container
 * @param {int} container_hold.x the x dimension of the container hold entity
 * @param {int} container_hold.y the y dimension of the container hold entity
 * @param {int} container_hold.z the z dimension of the container hold entity
 * @param {Array} container_hold.containers_in the array of the containers currently located in the container hold
 * @param {Function} load_method the algorthm used to allocate the containers
 * @returns {Object} returns the object with x, y and z coordinates for the container
 */
module.exports.calculateLocation = (container, container_hold, load_method) => {

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

}