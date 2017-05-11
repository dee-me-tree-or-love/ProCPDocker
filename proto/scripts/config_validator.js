// change to actual classes
// export default {};

// imports
// doesn't work for some reason - dunno how to fix, some people advise o use Babbel

let configs = require('./harbor_config');

console.log('--------');
console.log('received configs:');
console.dir(configs);

class ConfigValidator {
    static validate(configs) {
        ConfigValidator.validateDocks(configs);

    }

    static reportPropertyProblem(obj, type, prop) {
        // logs the problems
        console.log("!___lacking property___!");
        console.log("current object of type: " + type + " lacks property: " + prop);
        console.log("object:")
        console.dir(obj);
        console.log("!______!");
    }

    static validateConsistency(configs) {
        const verificatorShips = [
            "id",
            "eta",
            "x",
            "y",
            "z",
            "filled",
            "unload",
            "load"
        ];
        const verificatorDocks = [
            "id",
            "nrloaders",
            "storage_id",
        ]
        const verificatorStorages = [
            "id",
            "x",
            "y",
            "z",
            "filled"
        ]



        console.log("VALIDATING SHIPS:");
        let shipsFailed = ConfigValidator.checkCollectionConsistency(configs.ships, verificatorShips, "Ship");
        console.log("VALIDATING DOCKS");
        let docksFailed = ConfigValidator.checkCollectionConsistency(configs.docks, verificatorDocks, "Dock");
        console.log("VALIDATIN STORAGES");
        let storagesFailed = ConfigValidator.checkCollectionConsistency(configs.storages, verificatorStorages, "Storages");

        if (shipsFailed) {
            console.log("!> ships fucked up");
        }
        if (docksFailed) {
            console.log("!> docks fucked up");
        }
        if (storagesFailed) {
            console.log("!> storages fucked up");
        }
    }

    // check consistency of the properties of the items in the collection agains the given validator
    // give the type of the objects in the collection as a String_? via the `type` parameter
    static checkCollectionConsistency(collection, verificator, type) {
        // check if all the fields are present, return problems if not
        // does not provide logic check
        let testFailed = false;
        console.log(verificator);

        for (let k = 0; k < collection.length; k++) {
            let instance = collection[k];
            let propertyNames = Object.getOwnPropertyNames(instance);


            console.dir(instance);

            for (let i = 0; i < verificator.length; i++) {
                // if the property of the verificator is not in the ship object, 
                // we've got a trouble and need to handle this shit
                if (!propertyNames.includes(verificator[i])) {
                    ConfigValidator.reportPropertyProblem(instance, type, verificator[i]);
                    testFailed = true;
                } else {
                    console.log("+ _passed_: " + verificator[i] + " is in")
                }
            }
        }
        return testFailed;
    };

    static validateDocks(configs) {

    }
    static validateStorages(configs) {

    }

}

ConfigValidator.validateConsistency(configs);