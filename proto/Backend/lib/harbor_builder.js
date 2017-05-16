'use strict';

// utility function for math: 

/**
 * Generates the random integer in range [min,max]
 * @param  {} min
 * @param  {} max
 */
let getRandomInt = (min, max) => {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min;
}

// the object that contains the verificator parameters
const verificator = {
    configRootName: "configrations",
    // groups are ships, docks and storages
    groups: [
        // group type is the name of the aggregation property of the configs
        // ships
        {
            type: "ships",
            // attrs array is the array of attributes that need to be present in the group
            attrs: [
                "id",
                "eta",
                "x",
                "y",
                "z",
                "filled",
                "unload",
                "load"
            ]
        },
        // docks
        {
            type: "docks",
            attrs: [
                "id",
                "number_loaders",
            ],
        },
        // storages
        {
            type: "storages",
            attrs: [
                "id",
                "x",
                "y",
                "z",
                "filled"
            ],
        }
    ]
}


/**
 * Validates the configurations passed by the client for the consistency of the properties and types
 * Does structural and logic validation
 * It will do it in a inorder treewalk (traversal) way
 * @param  {Object} configs - the configration object consisting of docks, storages and ships
 * @returns {Object} Response of a format {isokay: boolean, errors: Object}
 */
module.exports.verifyConfigStructure = (configs) => {
    // the errors will be pushed here
    let errors = [];
    // a class that only has the constructor that defines the structure and adds the data
    // to be used for reporting purposes
    class Error {
        constructor(message, parent, child) {
            this.message = message;
            this.parentSection = parent;
            this.childAttribute = child;
        }
    }
    /* probably better not to have inner classes, but I do not know for sure */


    // start traversing:
    /* would have been very nice to write a recursive function for it, but maybe some more work would be needed */

    // first level from root
    for (let i = 0; i < verificator.groups.length; i++) {
        let group = verificator.groups[i];

        // check if such group is not present in the configs
        if (configs[group.type] == undefined) {
            // if so - add error, go to next group
            errors.push(
                new Error(
                    "Could not find the section: ", // message
                    verificator.configRootName, // parent of the attribute that is missing
                    group.type // the attribute that is missing
                )
            );
            // must not have a break here!
        } else {

            // if the group exists, continue checking 

            // check for there being at least 1 object in the group
            if (configs[group.type].length > 0) {
                // function to check the attributes of the object of the section
                let checkAttributesOfGroup = (obj, group) => {

                    // check ammount of presentproperties and the expected
                    if (Object.keys(obj).length != group.attrs.length) {
                        errors.push(new Error("Unexpected number of properties", group))
                    }

                    // every attribute of the group
                    for (let j = 0; j < group.attrs.length; j++) {
                        // check
                        let attr = group.attrs[j];
                        // check presence
                        if (obj[attr] == undefined) {
                            // if not there - add error
                            errors.push(
                                new Error(
                                    "Could not find the attribute: ", // message
                                    group.type, // parent of the attribute that is missing
                                    attr // the attribute that is missing
                                )
                            );
                            // no fucking breaks
                        } else {
                            // consider adding the logic rules as callback attributes of the property!
                            // console.log("+____ OK : " + attr);
                        }

                    }
                }
                for (let k = 0; k < configs[group.type].length; k++) {
                    // for every object of the group do the checks
                    let candidate = configs[group.type][k];
                    // console.log("candidate:")
                    // console.dir(candidate);
                    checkAttributesOfGroup(candidate, group)
                }
            } else {
                errors.push(new Error("No data in the section ", verificator.configRootName, group.type));

            }

        }
    }

    let result = {
        isokay: (errors.length == 0),
        errors: errors,
    }

    return result;
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