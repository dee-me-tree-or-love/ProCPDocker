class ConfigValidator {

    static validate(configs) {

        ConfigValidator.validateDocks(configs);
        ConfigValidator.validateStorages(configs);
        ConfigValidator.validateShips(configs);
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
        ];
        const verificatorStorages = [
            "id",
            "x",
            "y",
            "z",
            "filled"
        ];

        console.log("VALIDATING SHIPS: PENDING");
        let shipsFailed = ConfigValidator.checkCollectionConsistency(configs.ships, verificatorShips, "Ship");

        console.log("VALIDATING DOCKS: PENDING");
        let docksFailed = ConfigValidator.checkCollectionConsistency(configs.docks, verificatorDocks, "Dock");

        console.log("VALIDATING STORAGES: PENDING");
        let storagesFailed = ConfigValidator.checkCollectionConsistency(configs.storages, verificatorStorages, "Storages");

        if (shipsFailed.result) {

            console.log("!> ships fucked up");
            console.log(shipsFailed.errors);
        }else{

            console.log("VALIDATING SHIPS: OK");
        }
        if (docksFailed.result) {

            console.log("!> docks fucked up");
            console.log(docksFailed.errors);
        }else{

            console.log("VALIDATING DOCKS: OK");
        }
        if (storagesFailed.result) {

            console.log("!> storages fucked up");
            console.log(storagesFailed.errors);
        }else{

            console.log("VALIDATING STORAGES: OK");
        }
    }

    // check consistency of the properties of the items in the collection against the given validator
    // give the type of the objects in the collection as a String_? via the `type` parameter
    static checkCollectionConsistency(collection, verificator, type) {

        let testFailed = false;
        let errors = [];

        for (let k = 0; k < collection.length; k++) {

            let instance = collection[k];
            let propertyNames = Object.getOwnPropertyNames(instance);

            for (let i = 0; i < verificator.length; i++) {

                // if the property of the verificator is not in the ship object
                if (!propertyNames.includes(verificator[i]) || instance[verificator[i]] === '') {

                    errors.push(`${type} ${instance.id ? instance.id : 'x'} lacks property ${verificator[i]}`);
                    testFailed = true;
                }
            }
        }
        return {
            result: testFailed,
            errors
        };
    };

    static validateDocks(configs) {

        //TODO: logical checks
    }

    static validateStorages(configs) {

        //TODO: logical checks
    }

    static validateShips(configs) {

        //TODO: logical checks
    }
}
module.exports.ConfigValidator = ConfigValidator;