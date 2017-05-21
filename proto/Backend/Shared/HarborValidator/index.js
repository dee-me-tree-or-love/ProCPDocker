// module to be used to 
// verify that the configuartions submitted correspond to the rules 
// and
// make preliminary adjustements to the configurations: like build paths
'use strict';
// to make sure this thing is available outside, just in case
// export { StructureChecker, Error, RuleChecker };

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
        // this.failedInstanceID = failureID;
    }
}


class StructureChecker {
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
    static verifyConfigStructure(configs) {
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
                    };
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

        return {
            isokay: (errors.length == 0),
            errors: errors,
        };
    }
}


class RuleChecker {
    /**
     * @param  {Object} ship takes the ship as a parameter
     * @returns {Object} response of the format 'Error' (see previously)
     */
    static verifyShipRules(ship) {
        // could an awesome usecase to make it with callbacks and then we can have a verificator tree for business rules... 
        // this would be sort of easier to manage further, but whatever, for now this is good as well
        let errors = [];

        // check time of arrival
        if (!(ship.eta >= 0 && Number.isInteger(ship.eta))) {
            errors.push(new Error("Ship's ETA is incorrect. Expected a positive integer"));
        }

        // check percentages
        /* could aggregate the percentage check to check if integer and if in range of 0 to 100 for all possible percentages, but it's okay for now */
        if (RuleChecker.checkPercentage(ship.filled) && RuleChecker.checkPercentage(ship.unload) && RuleChecker.checkPercentage(ship.load)) { // all integers and all non-negative

            // if so
            // check if the summation fails

            if (!((ship.filled + ship.load - ship.unload) >= 0 && (ship.filled + ship.load - ship.unload) <= 100)) {

                // then it's really bad! 
                errors.push(new Error("The percentage amounts of filled + load - unload should be in range [0;100]"))
            }
            if (!(ship.filled >= ship.unload)) {

                errors.push(new Error("You can not unload more containers from the ship than it has on board"))
            }
        } else {

            // then some basics of the percentages have failed

            errors.push(new Error("The percentages have been incorrectly specified..."));
        }

        return RuleChecker.prepareReturn(errors);
    }

    static verifyDockRules(dock) {

        let errors = [];

        // check for the number of loaders

        if ((dock.number_loaders < 0) || (dock.number_loaders > 4)) {
            erros.push(new Error("The number of loaders should be in the range [0;4]"))
        }

        return RuleChecker.prepareReturn(errors);
    }

    static verifyStorageRules(storage) {

        let errors = [];

        // check the size to be correct
        if (RuleChecker.checkSize(storage)) {
            errors.push(new Error("The size of the storage should be specified with positive integer x,y,z"))
        }
        // check the percentage to be valid
        if (RuleChecker.checkPercentage(storage.filled)) {
            errors.push(new Error("The percentage is not corretly specified"))
        }
        return RuleChecker.prepareReturn(errors);
    }

    // makes the response
    static prepareReturn(errors) {
        // definitely needs a class of its own
        return {
            isokay: (errors.length == 0),
            errors: errors,
        };
    }

    // a supplimentray method for checking if the size is alright
    static checkSize(sizable) {
        return (sizable.x <= 0 || sizable.y <= 0 || sizable.z <= 0)
    }

    static checkPercentage(perc) {
        return (Number.isInteger(perc) && perc >= 0 && perc <= 100)
    }
}


module.exports.verifyConfiguration = (configs) => {
    // first validate the structure
    let errors = [];

    let sCheckResult = StructureChecker.verifyConfigStructure(configs);
    if (sCheckResult.isokay == false) {
        errors.push(sCheckResult.errors);
        // if there are problems -> return, cause if the structure is broken, no use to check the rules
        return errors;
    }
    // only if the structure is okay
    // then validate the rules
    for (let i = 0; i < configs.ships.length; i++) {
        let rulesCheckResult = RuleChecker.verifyShipRules(configs.ships[i]);
        if (rulesCheckResult == false) {
            errors.push(rulesCheckResult.errors);
        }
    }
    for (let i = 0; i < configs.docks.length; i++) {
        let rulesCheckResult = RuleChecker.verifyDockRules(configs.docks[i]);
        if (rulesCheckResult == false) {
            errors.push(rulesCheckResult.errors);
        }
    }
    for (let i = 0; i < configs.storages.length; i++) {
        let rulesCheckResult = RuleChecker.verifyStorageRules(configs.storages[i]);
        if (rulesCheckResult == false) {
            errors.push(rulesCheckResult.errors);
        }
    }
    return errors;
};

module.exports.Error = Error;
module.exports.StructureChecker = StructureChecker;
module.exports.RuleChecker = RuleChecker;