/*
    before deploying anywhere, comment out all the console.log and .dir shits
*/



// for sorting and finding where to load from
class ShipManipulator {
    static countLoads(ship) {

        let loads = {};

        // count how many times each storage id appears as a  location id
        for (let i = 0; i < ship.containers_load.length; i++) {

            let storageId = ship.containers_load[i].address.location_id;
            if (!(loads[storageId])) {
                loads[storageId] = {};
                loads[storageId].count = 1;
                loads[storageId].containers = [ship.containers_load[i]];
            } else {
                loads[storageId].count++;
                loads[storageId].containers.push(ship.containers_load[i]);
            }
        }
        return loads;
    };


    // Runtime analysis: O(n) :D 
    static sortShipsByETA(ships) {
        // counting sort way: 

        // since it's javascript we can omit finding the maximum and minimum sizes for the count helper
        // instead we can just create a new stuff as soon as we encounter something new: !counter[arr[i]]

        // used to count the number a certain value has appeared
        let ETAcounter = [];

        // count how many ships are scheduled to arrive at certain ETA
        for (let i = 0; i < ships.length; i++) {
            // if such ETA has not been counted yet
            if (!(ETAcounter[ships[i].eta])) {
                // initialize
                ETAcounter[ships[i].eta] = {};
                // add count
                ETAcounter[ships[i].eta].count = 1;
                // add reference to the first ship
                ETAcounter[ships[i].eta].ships = [ships[i]];
            } else {
                ETAcounter[ships[i].eta].count += 1;
                ETAcounter[ships[i].eta].ships.push(ships[i]);
            }
        }


        // console.dir(ETAcounter); // .log() prints stringies of the objects, whereas .dir() returns a NAVIGATABLE tree (it's no use in the terminal thouh...)

        // // do the correct placing
        let shipOrder = []; // the arbitrary variable to keep the correct order of the ships

        // for all the defined keys in the ETACounter
        for (let k in ETAcounter) { // in such case 'k's are the actual keys apparently...
            // while the still are ships in the 'slice'
            while (ETAcounter[k].count > 0) {
                // put the ship to a correct place
                shipOrder = shipOrder.concat(ETAcounter[k].ships.slice(ETAcounter[k].count - 1, ETAcounter[k].count))
                ETAcounter[k].count -= 1;
            }
        }

        // sorted stuff
        // console.dir(shipOrder);

        // console.log("sorted");
        // return the ships ordered by the ETA
        return shipOrder;
    };
}

class ShipScheduler {

    constructor(configs) {
        this.configs = configs;

        // sort connections:
        this.sortConnections(this.configs.docks);
        // console.log("sorted docks");
        // for (let i in this.configs.docks) {
        //     console.log(this.configs.docks[i].connections);
        // }

        this.sortConnections(this.configs.storages);
        // console.log("sorted storages");
        // for (let i in this.configs.storages) {
        //     console.log(this.configs.storages[i].connections);

        // }


        this.storageHashTable = this.makeHashTableWithUUIDs(this.configs.storages);
        this.shipHashTable = this.makeHashTableWithUUIDs(this.configs.ships);
        this.dockHashTable = this.makeHashTableWithUUIDs(this.configs.docks);
        this.connectionMatrix = this.configs.connections;

        this.DEPARTUREMARGIN = 2; // extra time for each ETD - just to make sure that the schedule is not toooooo clustered

        // to get how much capacity is left 
        this.initializeStorageAvailableCapacity();

        this.initializeProcessIntervalsOnDocks();
        console.log(this.configs.docks);
        // console.log("created the ship scheduler !!!! ")
    }

    // that is an amazing algorithm for creating has tables, I know, very error secure, suuuuure... 
    // it sucks in a way, but let's assume the uuids are 100% unique and there can be no problemos ever!
    /**
     * Produces the hash tables with UUIDs of the entities as keys
     * @param {*} entities 
     */
    makeHashTableWithUUIDs(entities) {
        let hashTable = {}
        for (let i = 0; i < entities.length; i++) {
            hashTable[entities[i].id] = entities[i];
        }
        return hashTable;
    }

    /**
     * Initializes the empty arrays of intervals at the docks
     */
    initializeProcessIntervalsOnDocks() {
        for (let key in this.dockHashTable) {
            this.dockHashTable[key].processintervals = [];
        }
    }


    /**
     * Initializes the storages with the available capacity property
     */
    initializeStorageAvailableCapacity() {
        for (let key in this.storageHashTable) {
            let storage = this.storageHashTable[key];
            storage.availableCapacity = storage.containers_max - storage.containers_current.length;
            console.log("initialized the availble capacity for the storage: " + key + " : " + storage.availableCapacity);
        }
    }


    /**
     * Sorts the connections of an entities: Dock | Storage by the edge weight
     * @param {*} entities 
     */
    sortConnections(entities) {
        for (let i = 0; i < entities.length; i++) {
            entities[i].connections.sort((a, b) => {
                return a.weight - b.weight;
            })
        }
        return entities;
    }





    determineDockPriority(ship, bursttimes) {

        let dockpriority = [];



        /* this is about the stuff for the LOADING part of the endeavor
        --------------------------------------------------------------*/
        // per dock
        // console.log(this.connectionMatrix[storage]);
        // iterate over the docks connected to this storage:
        for (let dock in this.dockHashTable) {
            let max_burst_size = -1;
            // for every storage in the loads of the ship
            for (let storage in ship.loads) {


                // display what you have here
                // console.log(this.connectionMatrix[storage][dock]);
                // initialize the new chunk
                if (!bursttimes[dock]) {
                    bursttimes[dock] = {};
                }

                if (!bursttimes[dock][storage]) {
                    bursttimes[dock][storage] = {};
                }

                bursttimes[dock][storage].count = ship.loads[storage].count;
                bursttimes[dock][storage].loadcontainers = ship.loads[storage].containers;
                bursttimes[dock][storage].burstsize = {};

                bursttimes[dock][storage].burstsize.loading =
                    (ship.loads[storage].count * this.connectionMatrix[storage][dock].weight) +
                    Math.ceil(ship.loads[storage].count / this.dockHashTable[dock].number_loaders);

                // console.log("time to load the containers: " + ship.loads[storage].count / this.dockHashTable[dock].number_loaders);

                if (bursttimes[dock][storage].burstsize.loading > max_burst_size) {
                    max_burst_size = bursttimes[dock][storage].burstsize.loading;
                }
            }



            /* this is about the stuff for the UNLOADING part of the endeavor
            --------------------------------------------------------------*/
            // figure out where to unload with the best efficiency
            // the connections between the docks and sotrages are sorted in increasing order on consturcting

            // get how many containers one needs to unload
            let numberOfUnloads = ship.containers_unload.length;

            // per each dock priority there are N unload destinations
            let unloadDestinations = [];

            console.log("Getting unload destinations for ship: " + ship.id + " at dock: " + dock);

            let makeUnloadDestinations = (dockHashTable, storageHashTable, dock, ship, unloadDestinations, optionIndex, unloadStartIndex, numberOfUnloads) => {

                let storageId = dockHashTable[dock].connections[optionIndex].storage;
                let storageOption = storageHashTable[storageId];

                console.log("can accept: " + storageOption.availableCapacity);

                let difference = storageOption.availableCapacity - numberOfUnloads;

                if (difference >= 0) {
                    // if the number of new containers that will be allocated to the storage does not exceed the capacity
                    // update the available capacity to the correct value: the left capacity
                    // and stop the run
                    storageOption.availableCapacity = difference;
                    // make sure the containers are recorded well to be unloaded to this destination
                    unloadDestinations.push({
                        storageId: storageId,
                        containers: ship.containers_unload.slice(), // making the shallow copy, but not sure if should...
                    });
                    console.log("returns");
                    return;

                } else {
                    console.log("couldn't fit all");
                    let endIndex = unloadStartIndex + storageOption.availableCapacity;
                    unloadDestinations.push({
                        storageId: storageId,
                        containers: ship.containers_unload.slice(unloadStartIndex, endIndex), // making the shallow copy, but not sure if should...
                    });
                    storageOption.availableCapacity = 0;
                    difference = (-1) * difference;
                    makeUnloadDestinations(dockHashTable, storageHashTable, dock, ship, unloadDestinations, optionIndex + 1, endIndex, difference)
                }
            }

            // bursttimes[dock].unloading = ship.containers_unload.length;
            this.initializeStorageAvailableCapacity();
            let dockHTCopy = Object.assign({}, this.dockHashTable);
            let storageHTCopy = Object.assign({}, this.storageHashTable);
            // console.log(storageHTCopy);
            makeUnloadDestinations(dockHTCopy, storageHTCopy, dock, ship, unloadDestinations, 0, 0, numberOfUnloads);
            console.log("\n\nREALLY SCARY OPERTATION ")
            console.dir(unloadDestinations);
            console.log("REALLY SCARY OPERTATION \n\n")



            // determine the maximum burst time
            bursttimes[dock].maxburstsize = max_burst_size;
            dockpriority.push({ dock_id: dock, burstsize: max_burst_size });
        }
        return dockpriority;
    }







    /**
     * Calculates how much would it take to move the containers from the storage to dock for each ship take in every docking case
     */
    calculateBurstTimes() {

        // per ship
        for (let i = 0; i < this.configs.ships.length; i++) {
            let ship = this.configs.ships[i];
            let bursttimes = {};

            // per storage
            // console.log(ship.loads);
            // a slightly weird way to get it to work, right? 
            if ((Object.keys(ship.loads).length) > 0) {

                let dockpriority = this.determineDockPriority(ship, bursttimes);

                // order the docking options in the order of the burstsize
                // I know it's bad, but well... works for now I guess
                dockpriority.sort((a, b) => {
                        return a.burstsize - b.burstsize;
                    })
                    // console.log("sorted::");
                    // console.log(dockpriority);
                ship.dockpriority = dockpriority;
                ship.burstsizes = bursttimes;
            }
        }
        // return this.shipHashTable;
    }


    /**
     * Find the latest time of departure of the dock
     * @param {*} dock 
     */
    findLatestETD(dock) {
        if (dock.processintervals[dock.processintervals.length - 1]) {
            return dock.processintervals[dock.processintervals.length - 1].etd
        } else {
            return 0;
        }
    }

    /**
     * Find the best docking option for the given ship
     * @param {*} ship 
     */
    determineDocking(ship) {

        // need to keep in mind the unloading of the ship also!

        console.log("\ndocking the ship: " + ship.id + " ; eta: " + ship.eta);
        // determine if one of the options for the ship can host the ship with the given eta:
        for (let i = 0; i < ship.dockpriority.length; i++) {
            // check if the ship can be docked
            console.log("what if here? " + ship.dockpriority[i].dock_id + " ; busrtsize: " + ship.dockpriority[i].burstsize);
            if (!this.processIntevalMakesOverlaps(
                    ship.dockpriority[i].dock_id, // the dock id
                    ship.eta, // the estimated time of arrival
                    (ship.eta + ship.dockpriority[i].burstsize) // the estimated time of departure only with load
                )) {
                console.log("should dock to dock:" + ship.dockpriority[i].dock_id);

                // dock the ship! 
                this.dockShipTo(
                    ship.dockpriority[i].dock_id,
                    this.prapareProcessInterval(
                        ship,
                        ship.eta,
                        (ship.eta + ship.dockpriority[i].burstsize),
                        "ship is docked")
                );
                // finish
                return;
            }
            // check next
        }
        // out of the loop
        // nowhere to dock at the given period -> start option 2
        console.log("nowhere to dock, huh...");

        // find the dock with the best [ latest(ETD) + burstsize + margin ] combo and place the ship there
        let bestOptionDockId = ship.dockpriority[0].dock_id;
        // ho ho ho, javascript allows to use INFINITY! how sweeeet! (wonder how efficient though...)
        let bestETD = Infinity; // some arbitrary huge number
        let bestETA = 0;
        for (let i = 0; i < ship.dockpriority.length; i++) {

            let key = ship.dockpriority[i].dock_id;
            let latestETD = this.findLatestETD(this.dockHashTable[key]);

            let potentialETD = latestETD + ship.dockpriority[i].burstsize + this.DEPARTUREMARGIN;

            if (
                (potentialETD) < bestETD
            ) {
                bestETA = latestETD;
                bestETD = potentialETD;
                bestOptionDockId = key;
            }
        }

        console.log("well, looks like the best options now is dock: " + bestOptionDockId + " ; etd: " + bestETD);
        this.dockShipTo(bestOptionDockId, this.prapareProcessInterval(ship, bestETA, bestETD, "ship is docked"));

    }


    /**
     * Checks if the dock has the overlap for the given start
     * @param {string} dock the id of the dock
     * @param {*} eta estimated time of arrival
     * @param {*} etd estimated time of departure
     * @returns {object} the response showing if the overlap exists
     */
    processIntevalMakesOverlaps(dock_id, eta, etd) {
        console.log(this.dockHashTable[dock_id].processintervals);
        for (let i = 0; i < this.dockHashTable[dock_id].processintervals.length; i++) {
            // console.log(
            //     "ETA: " + (this.dockHashTable[dock_id].processintervals[i].eta)
            // )
            // console.log(
            //     "ETD: " + (this.dockHashTable[dock_id].processintervals[i].etd)
            // )
            if (this.dockHashTable[dock_id].processintervals[i].eta <= eta &&
                this.dockHashTable[dock_id].processintervals[i].etd + this.DEPARTUREMARGIN >= eta) {
                return true;
            }
        }
        return false;
    }

    /**
     * Create and return an object that correpsonds to the interval that is saved in the docks process intervals
     * @param {*} ship 
     * @param {*} eta 
     * @param {*} etd 
     * @param {*} desc 
     */
    prapareProcessInterval(ship, eta, etd, containers, desc) {
        return { ship: ship, eta: eta, etd: etd, description: desc };
    }

    /**
     * Make an entry in the dock's process intervals for the given dock with the given process interval (pint)
     * @param {*} dock_id 
     * @param {*} pint 
     */
    dockShipTo(dock_id, pint) {
        this.dockHashTable[dock_id].processintervals.push(pint);
    }

    /**
     * make all the scheduling stuff - it should be the only public entry point 
     */
    produceTiming() {
        // sort ships by ETA
        this.configs.ships = ShipManipulator.sortShipsByETA(this.configs.ships);


        // for each ship calculate the loads
        for (let i = 0; i < this.configs.ships.length; i++) {

            let ship = this.configs.ships[i];
            ship.loads = ShipManipulator.countLoads(ship);

            // console.dir(ship);
        }

        // calculates the burst times given the loads per each ship
        // and provides the docking options in the priority sorted way
        // the response is not needed actually
        this.calculateBurstTimes();

        // console.log(resp);
        // console.log(this.connectionMatrix);

        // log what the dock options are there
        this.logDockingOptions();

        // Choosing the best option: Pseudocode
        // 
        // Important: since the ships are processed in order there can be no chance that a 
        // ship wil be overlapping by the 2nd endpoint
        //
        // try to dock to the best options - if not possible select others
        // for this we need to check for the dock's processintervals
        // and check for the overlaps and 
        //
        //                      if there are none -> place directly starting from ETA
        //                                  NOT LIKE THIS: if the ETD is overlapping -> try moving the next process after this one
        //
        //                      if there is an overlap, 
        //                          try the next best option 
        //                      until sucess or all of them appear occupied
        //
        //                      if didn't place
        //                          sort the docking options by the earliest free spot after the ETA
        //                          schedule the ship for this spot
        //                          move everything scheduled after further 
        //                                  (which is unlikely to happen in the beginnning, 
        //                                  since the ships are processed in the order of the increasing ETAs)

        for (let key in this.dockHashTable) {
            console.log(this.dockHashTable[key].processintervals);
        }

        // console.log("\n+++++++ IMPORNANT ");
        // console.log("configs.docks ");
        // console.log(this.configs.ships);
        // console.log("VS \nshipHashTable");
        // console.log(this.shipHashTable)
        // console.log("++++++++ COMPARISON\n");

        // so, the ships that are stored in this.configs.ships ARE ORDERED
        // but the ones in the hash table are not! so we need to iterate over the ships in configs.ships

        for (let i = 0; i < this.configs.ships.length; i++) {
            this.determineDocking(this.configs.ships[i]);
        }

        let dockSchedule = [];

        for (let key in this.dockHashTable) {
            let dock = this.dockHashTable[key];

            // logging stuff can be removed
            console.log("\n dock id: " + key);
            console.log("dock process intervals:");

            for (let i in dock.processintervals) {

                // logging stuff can be removed
                console.dir(dock.processintervals[i]);

                dockSchedule.push({
                    dock_id: key,
                    interval: dock.processintervals[i]
                });
            }

        }

        return dockSchedule;
    }

    /**
     * just a stupid function to make a nice log in the terminal
     */
    logDockingOptions() {
        for (let key in this.shipHashTable) {
            // console.log(this.shipHashTable[key])
            console.log("\n<<<<<+\nship: " + key)
            console.log("eta: " + this.shipHashTable[key].eta);
            for (let option in this.shipHashTable[key].burstsizes) {
                console.log("\noption to dock to: " + option)
                console.dir(this.shipHashTable[key].burstsizes[option])
            }
            console.log("\n== priority ==\n");
            console.log(this.shipHashTable[key].dockpriority);
            console.log("\n+>>>>>>\n")
        }
    }
}

let data = require("./expecteddata.js");
// console.dir(data);

let SS = new ShipScheduler(data.resp5);

let resp = SS.produceTiming();
console.log("\n ******** REPSONSE ********")
console.dir(resp);

console.log("\n ******** SHIPS ********")
console.dir(SS.configs.ships[0])