'use strict';
// to make sure this thing is available outside, just in case
export { Error };

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

// the object that contains the verificator parameters
// used only in verifyConfigStructure method
// maybe could be moved there also
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
};

// a class that only has the constructor that defines the structure and adds the data
// to be used for reporting purposes
class Error {
    constructor(message, parent, child) {
        this.message = message;
        this.parentSection = parent;
        this.childAttribute = child;
    }
}

// the procedure to verify that the structure of the configuration object received corresponds to the format
/**
 * Validates the configurations passed by the client for the consistency of the properties and types
 * Does structural and logic validation
 * It will do it in a inorder treewalk (traversal) way
 * @param  {Object} configs - the configration object consisting of docks, storages and ships
 * @returns {Object} Response of a format 
 *                  {isokay: boolean, 
 *                  errors: Error collection}
 */
module.exports.verifyConfigStructure = (configs) => {
    // the errors will be pushed here
    let errors = [];
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

    return {
        docks: configs.docks,
        storages: configs.storages,
        edges: connections,
    }
};


// the procedures to check all the logical rules. 
// assuming that the verification of the structure has passed
// are split into smaller methods for better maintenance reasons
/**
 * @param  {} ship takes the ship as a parameter
 * @returns {Object} response of the format 'Error' (see previously)
 */
module.exports.verifyShipRules = (ship) => {
    // could an awesome usecase to make it with callbacks and then we can have a verificator tree for business rules... 
    // this would be sort of easier to manage further, but whatever, for now this is good as well
    let errors = [];

    // check time of arrival
    if (!(ship.eta >= 0 && Number.isInteger(ship.eta))) {
        errors.push(new Error("Ship's ETA is incorrect. Expected a positive integer"));
    }

    // check percentages
    /* could aggregate the percentage check to check if integer and if in range of 0 to 100 for all possible percentages, but it's okay for now */
    if (checkPercentage(ship.filled) && checkPercentage(ship.unload) && checkPercentage(ship.load)) { // all integers and all non-negative
        // if so
        // check if the summation fails
        if (!((ship.filled + ship.load - ship.unload) >= 0 && (ship.filled + ship.load - ship.unload) <= 100)) {
            // then it's really bad! 
            errors.push(new Error("The percentage amounts of filled + load - unload should be in range [0;100]"))
        }
    } else {
        // then some basics of the percentages have failed
        errors.push(new Error("The percentages have been incorrectly specified..."));
    }

    // definitely needs a class of its own
    let result = {
        isokay: (errors.length == 0),
        errors: errors,
    }

    return result;
}

// a supplimentray method for checking if the size is alright
let checkSize = (sizable) => {
    return (sizable.x < 0 || sizable.y < 0 || sizable.z < 0)
}
let checkPercentage = (perc) => {
    return (Number.isInteger(perc) && perc >= 0 && perc <= 100)
}