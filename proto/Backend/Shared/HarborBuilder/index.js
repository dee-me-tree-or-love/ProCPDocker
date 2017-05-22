'use strict';


// for the uid generation
// creates UNIQUE Random identification numbers, guaranteed!
const uuid = require('uuid');



// utility function for math: 
/**
 * Generates the random integer in range [min,max]
 * @param  {} min
 * @param  {} max
 */
const getRandomInt = (min, max) => {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min;
};

// the procedure to construct the harbor based on the configurations
// assuming that the configurations have been verified already
/**
 * @param  {Object} configs
 * @param  {callback} laypaths - is a function with parameters(docks, storages), 
 *                                  it creates the edges and adds the connections 
 *                                  property to all the docks and storages
 * 
 * @returns {Object} The harbor object with edges, updated docks and storages
 */
module.exports.constructHarbor = (configs, laypaths) => {

    // provide the UIDs to the entities:
    // console.dir(configs);

    for (let i = 0; i < configs.ships.length; i++) {
        configs.ships[i].id = uuid();
    }
    for (let i = 0; i < configs.docks.length; i++) {
        configs.docks[i].id = uuid();
    }
    for (let i = 0; i < configs.storages.length; i++) {
        configs.storages[i].id = uuid();
    }

    // once done, should be fine
    // console.dir(configs);

    // if user has provided no callback function in the parameter
    if (!(typeof laypaths == "function")) {
        // this fucntion modifies the docks and storages by adding connections to them.
        laypaths = (docks, storages) => {
            let edges = [];
            // console.log("adding edges");

            // some people say using for index ... is better than foreach method of the array

            // iterate over storages
            for (let i = 0; i < storages.length; i++) {
                // not sure if needed to first check if this property is defined... 
                if (storages[i].connections == undefined) {
                    storages[i].connections = [];
                }

                // iterate over docks
                for (let j = 0; j < docks.length; j++) {

                    if (docks[j].connections == undefined) {
                        docks[j].connections = [];
                    }

                    // create new edge
                    let edge = {
                        vertices: { storage: storages[i].id, dock: docks[j].id },
                        weight: getRandomInt(5, 20), // using the function declared above
                    }

                    // add the connections to the docks and storages
                    storages[i].connections.push(edge);
                    docks[j].connections.push(edge);
                    // add the connections to the 
                    edges.push(edge);
                }
            }

            // console.dir(edges);
            return edges;
        }
    }

    let connections = laypaths(configs.docks, configs.storages);
    // should return updated harbor configuration
    return { entities: configs, edges: connections }
};