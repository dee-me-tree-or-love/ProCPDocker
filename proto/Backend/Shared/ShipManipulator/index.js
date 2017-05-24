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

    static makeProcessInterval(ship, eta, etd) {
        return { ship: ship, eta: eta, etd: etd };
    }

    constructor(configs) {
        this.configs = configs;
        this.storageHashTable = this.makeHashTableWithUUIDs(this.configs.storages);
        this.shipHashTable = this.makeHashTableWithUUIDs(this.configs.ships);
        this.dockHashTable = this.makeHashTableWithUUIDs(this.configs.docks);
        this.connectionMatrix = this.configs.connections;

        // console.log(this);
        // console.log("created the ship scheduler !!!! ")
    }

    // that is an amazing algorithm for creating has tables, I know, very error secure, suuuuure... 
    // it sucks in a way, but let's assume the uuids are 100% unique and there can be no problemos ever!
    makeHashTableWithUUIDs(entities) {
        let hashTable = {}
        for (let i = 0; i < entities.length; i++) {
            hashTable[entities[i].id] = entities[i];
        }
        return hashTable;
    }

    initializeProcessIntervalsOnDocks() {
        for (let key in this.dockHashTable) {
            dockHashTable[key].processintervals = [];
        }
    }

    calculateBurstTimes() {

        // per ship
        for (let i = 0; i < this.configs.ships.length; i++) {
            let ship = this.configs.ships[i];
            let bursttimes = {};

            // per storage
            // console.log(ship.loads);
            // a slightly weird way to get it to work, right? 
            if ((Object.keys(ship.loads).length) > 0) {
                let dockpriority = [];

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
                        bursttimes[dock][storage].containers = ship.loads[storage].containers;
                        bursttimes[dock][storage].burstsize = ship.loads[storage].count * this.connectionMatrix[storage][dock].weight;

                        if (bursttimes[dock][storage].burstsize > max_burst_size) {
                            max_burst_size = bursttimes[dock][storage].burstsize;
                        }
                    }

                    // determine the maximum burst time
                    bursttimes[dock].maxburstsize = max_burst_size;
                    dockpriority.push({ dock_id: dock, burstsize: max_burst_size });
                }

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

    produceTiming() {
        // sort ships by ETA
        this.configs.ships = ShipManipulator.sortShipsByETA(this.configs.ships);


        // for each ship calculate the loads
        for (let i = 0; i < this.configs.ships.length; i++) {

            let ship = this.configs.ships[i];
            ship.loads = ShipManipulator.countLoads(ship);

            // console.dir(ship);
        }

        // calculate the burst times given the loads per each ship
        // the response is not needed actually
        this.calculateBurstTimes();

        // console.log(resp);
        // console.log(this.connectionMatrix);

        // log what the dock options are there
        this.logDockingOptions();

        // Choosing the best option: Pseudocode
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

    }

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

let SS = new ShipScheduler(data.resp3);

let resp = SS.produceTiming();