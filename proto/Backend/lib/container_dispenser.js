// the module to be used for creating containers based on the configurations
// requires that the configurations have been verified

'use strict';

// can be ceratin container types
const containerTypes = [
    ""
];
// TODO: could be nice to write a code to produce standartized descriptions with certain sensefulness - could be made as a recursive algorithm

// to produce the containers without any `seeds` that could affect the allocating of the containers or add any logical aspect to the procedure
module.exports.dispenseContainersRandomly = (configs) => {
    // from the configs, start with the storages and create all the containers for them.
    // loop over every storage and create containers

    // once the storage containers were created go through ships
    // the ships' contents should be populated just like the storages
    // the unload and load containers should be taken as splices of total containers located in ship and in storages respectively
}