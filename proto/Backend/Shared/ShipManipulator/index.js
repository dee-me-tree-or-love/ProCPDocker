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



    calculateBurstTimes() {

        for (let i = 0; i < this.configs.ships.length; i++) {
            let ship = this.configs.ships[i];
            let bursttimes = {};
            // console.log(ship.loads);
            // a slightly weird way to get it to work, right? 
            if ((Object.keys(ship.loads).length) > 0) {
                // for every storage in the loads of the ship
                for (let storage in ship.loads) {

                    // console.log(this.connectionMatrix[storage]);
                    // iterate over the docks connected to this storage:
                    for (let dock in this.connectionMatrix[storage]) {

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
                    }
                }
                ship.burstsizes = bursttimes;
            }
        }

        return this.shipHashTable;
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
        /* the way the response looks:
            // looks somewhat like this: 
            // { 
            //      'fd605e6f-c0a4-4cdb-a6f8-b778f73804f9': {       -- dock id
            //          '476962af-9b98-443c-bd31-7aa8ea9629c6': {   -- storage id
            //                  count: 1,                           -- how many containers are to be loaded
            //                  containers: [Object],               -- the containers
            //                  burstsize: 10                       -- how long would it take (distance * size)
            //          },
            //          'aaf67573-bed2-4cfd-a4f8-455e1a3a7482': { 
            //                  count: 3, 
            //                  containers: [Object], 
            //                  burstsize: 57 
            //          } 
            //      }, 
            // }
        */
        let resp = this.calculateBurstTimes();
        // console.log(resp);
        console.log(this.connectionMatrix);
        for (let key in this.shipHashTable) {
            console.log(this.shipHashTable[key])
            for (let option in this.shipHashTable[key].burstsizes) {
                console.dir(this.shipHashTable[key].burstsizes[option])
            }
        }
    }
}

let data = require("./expecteddata.js");
// console.dir(data);

let SS = new ShipScheduler(data.resp2);

let resp = SS.produceTiming();