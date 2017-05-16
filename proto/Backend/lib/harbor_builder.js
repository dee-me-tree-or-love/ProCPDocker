'use strict';

// utility function for math: 

let getRandomInt = (min, max) => {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min;
}


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
                        vertices: [storages[i], docks[j]],
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


    let harbor = {
        docks: configs.docks,
        storages: configs.storages,
        edges: connections,
    }

    return harbor
}