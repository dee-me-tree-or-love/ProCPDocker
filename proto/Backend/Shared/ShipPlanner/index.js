/*
    before deploying anywhere, comment out all the console.log and .dir shits
*/

const uuid = require('uuid');

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
        this.storageHashTable = ShipScheduler.makeHashTableWithUUIDs(this.configs.storages);
        this.shipHashTable = ShipScheduler.makeHashTableWithUUIDs(this.configs.ships);
        this.dockHashTable = ShipScheduler.makeHashTableWithUUIDs(this.configs.docks);
        this.connectionMatrix = this.configs.connections;
        this.DEPARTUREMARGIN = 2;
        this.initializeProcessIntervalsOnDocks();
        this.initializeDockTemporaryStorage();
        // console.log(this.configs.connections);
    }

    // that is an amazing algorithm for creating has tables, I know, very error secure, suuuuure... 
    // it sucks in a way, but let's assume the uuids are 100% unique and there can be no problemos ever!
    /**
     * Produces the hash tables with UUIDs of the entities as keys
     * @param {*} entities 
     */
    static makeHashTableWithUUIDs(entities) {
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
     * Initializes the empty arrays of containers that are to be relocated from the docks to storages
     */
    initializeDockTemporaryStorage() {
        for (let key in this.dockHashTable) {
            this.dockHashTable[key].containers_toforward = [];
        }
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

                    // determine the total maximum burst time
                    // console.log(ship);
                    let totalProcessTime = max_burst_size +
                        Math.ceil(ship.containers_load.length / this.dockHashTable[dock].number_loaders) +
                        Math.ceil(ship.containers_unload.length / this.dockHashTable[dock].number_loaders);
                    bursttimes[dock].maxburstsize = totalProcessTime;
                    dockpriority.push({ dock_id: dock, burstsize: totalProcessTime });
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

            } else {
                let dockpriority = [];
                for (let dock in this.dockHashTable) {
                    dockpriority.push({ dock_id: dock, burstsize: Math.ceil(ship.containers_unload.length / this.dockHashTable[dock].number_loaders) });
                }
                ship.dockpriority = dockpriority;
            }
        }


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
        console.log("\ndocking the ship: " + ship.id + " ; eta: " + ship.eta);
        // determine if one of the options for the ship can host the ship with the given eta:
        for (let i = 0; i < ship.dockpriority.length; i++) {
            // check if the ship can be docked
            // console.log("what if here? " + ship.dockpriority[i].dock_id + " ; busrtsize: " + ship.dockpriority[i].burstsize);
            if (!this.processIntevalMakesOverlaps(
                    ship.dockpriority[i].dock_id, // the dock id
                    ship.eta, // the estimated time of arrival
                    (ship.eta + ship.dockpriority[i].burstsize) // the estimated time of departure
                )) {
                console.log("should dock to dock:" + ship.dockpriority[i].dock_id);

                // dock the ship! 
                this.dockShipTo(
                    ship.dockpriority[i].dock_id,
                    ShipScheduler.prepareProcessInterval(
                        ship,
                        ship.eta,
                        // forgot to include the margin first
                        (ship.eta + ship.dockpriority[i].burstsize + this.DEPARTUREMARGIN),
                        "ship is docked",
                        ship.dockpriority[i].dock_id)
                );
                console.log("docked the ship, etd: " + (ship.eta + ship.dockpriority[i].burstsize + this.DEPARTUREMARGIN));
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

            if ((potentialETD) < bestETD) {
                bestETA = latestETD;
                bestETD = potentialETD;
                bestOptionDockId = key;
            }
        }

        console.log("well, looks like the best options now is dock: " + bestOptionDockId + " ; etd: " + bestETD);
        this.dockShipTo(bestOptionDockId, ShipScheduler.prepareProcessInterval(ship, bestETA, bestETD, "ship is docked", bestOptionDockId));

    }


    /**
     * Checks if the dock has the overlap for the given start
     * @param {string} dock the id of the dock
     * @param {*} eta estimated time of arrival
     * @param {*} etd estimated time of departure
     * @returns {object} the response showing if the overlap exists
     */
    processIntevalMakesOverlaps(dock_id, eta, etd) {
        // console.log(this.dockHashTable[dock_id].processintervals);
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
    static prepareProcessInterval(ship, eta, etd, desc, dockId) {
        return { id: uuid(), ship: ship, eta: eta, etd: etd, description: desc, dock_id: dockId };
    }

    /**
     * Make an entry in the dock's process intervals for the given dock with the given process interval (pint)
     * @param {*} dock_id 
     * @param {*} pint 
     */
    dockShipTo(dock_id, pint) {
        this.dockHashTable[dock_id].processintervals.push(pint);
        for (let i in pint.ship.containers_unload) {
            this.dockHashTable[dock_id].containers_toforward.push(pint.ship.containers_unload[i]);
        }
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
        // this.logDockingOptions();

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
            // console.log(this.dockHashTable[key].processintervals);
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

        // for (let key in this.dockHashTable) {
        //     let dock = this.dockHashTable[key]
        //     console.log("\n dock id: " + key);
        //     console.log("dock process intervals:");
        //     for (let i in dock.processintervals) {
        //         console.dir(dock.processintervals[i]);
        //     }

        // }
        return this.configs;
    }

    /**
     * just a stupid function to make a nice log in the terminal
     */
    logDockingOptions() {
        for (let key in this.shipHashTable) {
            // console.log(this.shipHashTable[key])
            console.log("\n<<<<<+\nship: " + key)
            console.log("eta: " + this.shipHashTable[key].eta);
            console.log("load: " + this.shipHashTable[key].containers_load.length);
            console.log("unload: " + this.shipHashTable[key].containers_unload.length);
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

class TaskProducer {

    constructor(configs) {
        this.configs = configs;
        this.docks = configs.docks;
        this.storages = configs.storages;
        this.connectionMatrix = configs.connections;
    }



    static createTask(inter, container, dest_id, descr, stime, events) {
        let task = {
            id: uuid(),
            interval_id: inter,
            type: "container",
            extra: {
                container_id: container.id,
                source_id: container.address.location_id,
                destination_id: dest_id
            },
            description: descr,
            status: "waiting",
            start_time: stime,
            events: events,
            end_time: stime + events.length,
        }
        task.events.sort((a, b) => {
            return a.start_time - b.start_time;
        })
        return task;
    }

    static createScheduleTask(inter, ship_id, dock_id, descr, stime, events) {
        let task = {
            id: uuid(),
            interval_id: inter,
            type: "schedule",
            extra: {
                ship_id: ship_id,
                destination_id: dock_id
            },
            description: descr,
            status: "waiting",
            start_time: stime,
            events: events,
            end_time: stime + events.length,
        }
        task.events.sort((a, b) => {
            return a.start_time - b.start_time;
        })
        return task;
    }


    static createEvent(type, msg, start_time) {
        return {
            id: uuid(),
            type: type,
            message: msg,
            duration: 1, // by default
            start_time: start_time,
        }
    }

    produceTasks(configs) {
        let docks = configs.docks;
        let storages = configs.storages;

        let getEarliesETA = (dock) => {
                return dock.processintervals[0].eta;
            }
            // sort the docks by the earliest ETAs 
        docks.sort((a, b) => {
            return getEarliesETA(a) - getEarliesETA(b)
        })

        console.log("\n))))))))))))PRODUCING TASKS((((((((((((\n")

        let allTasks = [];
        // use promises to do so faster and more efficient -> make an aggregate result of the promises!

        for (let i in docks) {
            // per process interval
            for (let j in docks[i].processintervals) {
                let moveToDockTasks = [];
                let unloadTasks = [];
                let loadTasks = [];

                // phase 1 tasks: unload the ship and get the containers from the storage to the dockyard
                moveToDockTasks = moveToDockTasks.concat(this.produceTransferToDockTasks(docks[i], docks[i].processintervals[j]));
                unloadTasks = unloadTasks.concat(
                    this.produceContainerMovingTasks(docks[i], docks[i].processintervals[j],
                        docks[i].id, docks[i].processintervals[j].eta));

                // concatinating
                let phase1tasks = moveToDockTasks.concat(unloadTasks);

                // sort to find the last time of the 
                phase1tasks.sort((a, b) => {
                    return a.start_time - b.start_time;
                })

                let latestEndingTaskOfPhase1 = Math.max.apply(Math, phase1tasks.map((o) => { return o.end_time }))

                // console.log("\n>>>>>>>>>>>\nthe latest phase1 task of");
                // console.log("pint: " + docks[i].processintervals[j].id);
                // console.log(latestEndingTaskOfPhase1 + " of " + docks[i].processintervals[j].etd);
                // console.log("with remaining load: " + docks[i].processintervals[j].ship.containers_load.length);
                // console.log("in the dock with " + docks[i].number_loaders + " loaders");


                // use the latestEndingTaskOfPhase1 as the start time for the phase2: load and leave the port
                let phase2StartTime = latestEndingTaskOfPhase1;


                loadTasks = loadTasks.concat(
                    this.produceContainerMovingTasks(docks[i], docks[i].processintervals[j],
                        docks[i].processintervals[j].ship.id, phase2StartTime, true)
                );

                let movingTasks = unloadTasks.concat(loadTasks);

                // determine when the ship should leave
                let leave_time = Math.max.apply(Math, movingTasks.map((o) => { return o.end_time }));
                let leaveTask = (TaskProducer.createScheduleTask(docks[i].processintervals[j].id,
                    docks[i].processintervals[j].ship.id,
                    docks[i].id,
                    "Ship is leaving the dock",
                    leave_time, [TaskProducer.createEvent("undock", "Ship is leaving the dock", leave_time)]));


                // console.log("load tasks:");
                // for (let i in loadTasks) {
                //     console.log(loadTasks[i]);
                // }
                // console.log("<<<<<<<<<<<\n");

                let phase1and2tasks = phase1tasks.concat(loadTasks);
                phase1and2tasks.push(leaveTask);
                allTasks = allTasks.concat(phase1and2tasks);
                // produced the phase 1 and 2 tasks
            }
        }


        // phase 3: transport the containers to forward to the storages
        // go through every dock
        //      find the order of storages by distance
        //      try to move the containers to the closest storage
        // definitely use a separate method for it
        let tasksPhase3 = this.produceTransferFromDockToStorageTasks(docks);

        allTasks = allTasks.concat(tasksPhase3);

        // sort the tasks again
        allTasks.sort((a, b) => {
            return a.start_time - b.start_time;
        })
        return allTasks;
    }


    produceTransferFromDockToStorageTasks(docks) {
        // sort the connections of the docks which plan to forward containers to storages
        let docksToWorkWith = [];
        for (let i in docks) {
            if (docks[i].containers_toforward.length > 0) {
                docks[i].connections.sort((a, b) => { return a.weight - b.weight })
                docksToWorkWith.push(docks[i]);
            }
        }

        // sort these docks by the earliest time they are free of any process intervals
        docksToWorkWith.sort((a, b) => {
            return Math.max.apply(Math, a.processintervals.map((o) => { return o.etd })) -
                Math.max.apply(Math, b.processintervals.map((o) => { return o.etd })); // a nice way to get the last ETD
        })

        // make a hastable out of the storages
        this.storages = ShipScheduler.makeHashTableWithUUIDs(this.storages);
        // figure out the available capactities per storage
        let assignAvailableCapacity = (storages) => {
            for (let key in storages) {
                let storage = storages[key];
                storage.availableCapacity = storage.containers_max - storage.containers_current.length;
                // console.log("initialized the availble capacity for the storage: " + key + " : " + storage.availableCapacity);
            }
            return storages;
        }
        this.storages = assignAvailableCapacity(this.storages);

        // now start planning the transfers to the storages
        let transferTasks = [];
        /**
         * 
         * @param {*} dock 
         * @param {*} interval_id 
         * @param {*} optionIndex 
         * @param {*} numberOfTransfers 
         * @param {*} tasks 
         * @param {*} startTime 
         * @param {*} firstContainerIndex 
         */
        let makeUnloadTransferTasks = (dock, interval_id, optionIndex,
            numberOfTransfers, tasks, startTime, firstContainerIndex) => {
            // console.log("new recursive call");
            // console.log(tasks);
            let storageId = dock.connections[optionIndex].storage;
            let storageOption = this.storages[storageId];

            let difference = storageOption.availableCapacity - numberOfTransfers;

            // generates events linked to moving 1 container
            /**
             * 
             * @param {*} dock 
             * @param {*} container 
             * @param {*} interval_id 
             * @param {*} events 
             * @param {*} tasks 
             * @param {*} eventStartTime 
             */
            let generateEvents = (dock, container, distanceToStorage,
                events, eventStartTime) => {
                // event to pick the container from the dock
                events.push(TaskProducer.createEvent("pick", "pick container from dock for trasnportation", eventStartTime));
                eventStartTime++;
                // transportation events
                for (let k = 1; k < distanceToStorage - 1; k++) {
                    events.push(TaskProducer.createEvent("transfer", "transfer container from dock to storage", eventStartTime));
                    eventStartTime++;
                }
                // event to place the container to the storage
                events.push(TaskProducer.createEvent("move",
                    "move the container from transportation to the storage", eventStartTime));
                eventStartTime++;
                return eventStartTime;
            }

            if (difference >= 0) {
                // if the number of new containers that will be allocated to the storage does not exceed the capacity
                // update the available capacity to the correct value: the left capacity
                // and stop the run
                storageOption.availableCapacity = difference;
                // start craeting the tasks
                // let tranferFromDockTasks = [];
                let eventStartTime = startTime;

                for (let i = firstContainerIndex; i < numberOfTransfers; i++) {
                    // create the tasks 
                    // each task should start with startTime + i and should contain |distance| amount of events
                    // should be similar to the makeTransferTasks method used earlier

                    // since in the end of the nested for loop you get the last event start time ++
                    let taskStartTime = eventStartTime;

                    let events = [];
                    // generates tasks for every container with the events included
                    eventStartTime = generateEvents(dock, dock.containers_toforward[i],
                        this.connectionMatrix[storageId][dock.id].weight,
                        events,
                        eventStartTime);
                    // aggregate it all into the task
                    tasks.push(TaskProducer.createTask(interval_id, dock.containers_toforward[i],
                        dock.id,
                        "relocate the container from the dock to the storage", taskStartTime, events));


                    // console.log(tasks.map((o) => { return o.events }));
                    // console.log(tasks);
                    // console.log(tranferFromDockTasks);
                }

                // tasks = tasks.concat(tranferFromDockTasks)
                return;
            } else {
                // since didn't fit all the containers, there are excesses, but we need to get all the ones that are fitting!
                let endIndex = firstContainerIndex + storageOption.availableCapacity;
                storageOption.availableCapacity = 0;
                // start craeting the tasks
                // let tranferFromDockTasks = [];
                let eventStartTime = startTime;

                for (let i = firstContainerIndex; i < endIndex; i++) {
                    // create the tasks 
                    // each task should start with startTime + i and should contain |distance| amount of events
                    // should be similar to the makeTransferTasks method used earlier

                    // since in the end of the nested for loop you get the last event start time ++
                    let taskStartTime = eventStartTime;

                    let events = [];
                    // generates tasks for every container with the events included
                    generateEvents(dock, dock.containers_toforward[i],
                        this.connectionMatrix[storageId][dock.id].weight,
                        events,
                        eventStartTime);
                    // aggregate it all into the task
                    tasks.push(TaskProducer.createTask(interval_id, dock.containers_toforward[i],
                        dock.id,
                        "relocate the container from the dock to the storage", taskStartTime, events));
                }
                // tasks = tasks.concat(tranferFromDockTasks);
                difference = (-1) * difference;
                makeUnloadTransferTasks(dock, interval_id, optionIndex + 1, difference, tasks, eventStartTime, endIndex);
            }
        }

        let allTasks = [];

        // make all the tasks
        for (let i in docksToWorkWith) {
            // get last ETD:
            let latestEtd = Math.max.apply(Math, docksToWorkWith[i].processintervals.map((o) => { return o.etd }));
            // add new interval
            let interval = ShipScheduler.prepareProcessInterval("", latestEtd,
                latestEtd, // has to be changed after!
                "moving the containers stored for forwarding to the storages", docksToWorkWith[i].id);

            let dockForwardingTasks = [];
            makeUnloadTransferTasks(docksToWorkWith[i], interval.id, 0,
                docksToWorkWith[i].containers_toforward.length,
                dockForwardingTasks, latestEtd, 0);
            // concatenate all the new tasks there

            // make the interval final with the correct time
            interval.etd = Math.max.apply(Math, dockForwardingTasks.map((o) => { return o.end_time }));

            // add the freshly built interval to the array
            docksToWorkWith[i].processintervals.push(interval);

            // docksToWorkWith[i].processintervals.push(interval);
            // console.log("\n NEW INTERVAL: ");
            // console.log(interval);
            // console.log("Its tasks")
            // console.log(dockForwardingTasks);
            // console.log("\n");
            allTasks = allTasks.concat(dockForwardingTasks);
        }
        return allTasks;
    }

    produceTransferToDockTasks(dock, processinterval) {

        // for (let i in dock.processintervals) {
        // let containerpayloads = dock.processintervals[i].ship.loads;
        // let intId = dock.processintervals[i].id;
        let containerpayloads = processinterval.ship.loads;
        let intId = processinterval.id;
        // console.log("you are looking at the payloads:")
        // console.log(containerpayloads);
        let tasks = [];
        let intervalTime = processinterval.eta;
        let taskStartTime = intervalTime;
        for (let storageId in containerpayloads) {

            let eventStartTime = intervalTime;

            for (let k in containerpayloads[storageId].containers) {

                // console.log("new task")
                taskStartTime = eventStartTime;

                // moving the containers from the storage to the dock includes picking them up from the storage and placing them in the dock implicitly
                let events = [];

                events.push(TaskProducer.createEvent("pick", "pick container from storage for trasnportation", eventStartTime));
                eventStartTime++;
                for (let j = 1; j < this.connectionMatrix[storageId][dock.id].weight - 1; j++) {

                    // console.log("this event starts at: " + eventStartTime);
                    events.push(TaskProducer.createEvent("transfer", "transfer container from storage to dock", eventStartTime));
                    eventStartTime++;
                }
                events.push(TaskProducer.createEvent("move", "move the container from transportation to the dock", eventStartTime));
                eventStartTime++;
                // console.log("task start time: " + taskStartTime)
                tasks.push(TaskProducer.createTask(intId, containerpayloads[storageId].containers[k], dock.id,
                    "relocate the container from the storage to the dock", taskStartTime, events));
            }
        }
        // console.log("tasks for the pint:")
        // console.log(processinterval.id);
        // console.log(tasks);
        // }
        return tasks;

    }

    // since we may be sure that the containers have been moved to the dock at this point of time
    // and in fact we don't even really care where the containers are, but the task executor should just make sure that on these tasks
    // the containers are being placed to the ship under any circumstances


    produceContainerMovingTasks(dock, processinterval, destination_id, start_time, load) {

        let pickContainers = (interval_id, tasks, containers, destination, start_time, startIndex, endIndex, increment, load) => {

            if (startIndex >= containers.length) {
                return;
            }
            let desc = "unloading the container from the ship to dock"
            if (load) {
                desc = "loading the container from the dock to the ship"
            }
            // console.log("load? -> ", load);
            // console.log("desc: " + desc);
            for (let i = startIndex; i < endIndex && i < containers.length; i++) {
                tasks.push(TaskProducer.createTask(
                    interval_id,
                    containers[i],
                    destination,
                    desc,
                    start_time, [
                        TaskProducer.createEvent("move", "move the container between ship and dock", start_time),
                    ]));
            }
            pickContainers(interval_id, tasks, containers, destination, start_time + 1, endIndex, endIndex + increment, increment, load);
        };

        let makeMoveTasksPerPint = (dock, pint, destination_id, stime, load) => {
            // console.log(dock);
            let tasks = [];
            let containers = pint.ship.containers_unload;
            // check if the request is to load the shit
            if (load) {
                containers = pint.ship.containers_load;
            }
            let destination = destination_id;
            let start_time = stime;
            let startIndex = 0;
            let endIndex = startIndex + dock.number_loaders;
            pickContainers(pint.id, tasks, containers, destination, start_time, startIndex, endIndex, dock.number_loaders, load);
            return tasks;
        };

        let moveTasks = [];

        // make ship arrive task
        if (!load) {
            moveTasks.push(TaskProducer.createScheduleTask(processinterval.id,
                processinterval.ship.id,
                dock.id,
                "Ship arrives to the dock",
                start_time, [TaskProducer.createEvent("dock ship", "Shipa arrives to the dock", start_time)]));
            start_time++;
        }

        moveTasks = moveTasks.concat(makeMoveTasksPerPint(dock, processinterval, destination_id, start_time, load));
        return moveTasks;
    }
}


/**
 * @typedef {ScheduleAndTasks}
 * @property {Array} intervals
 * @property {Array} tasks
 */

/**
 * The functon that takes the configuration of the simulation as it is processed
 * The configs should be passed once all the verificators have passed and
 * All the containers were distributed among the entities
 * @param {Object} configs
 * @param {Array} configs.docks - the array of the dock entities 
 * @param {Array} configs.ships - the array of the ships with their containers
 * @param {Array} configs.storages - the array of the storages
 * @param {Object} configs.connections - the object that represents the connection matrix Storages -> Docks. the keys: [storage_id][dock_id]
 * @param {Object} configs.connections.weight - the property that signifies the weight of the connection between the storage and the dock 
 * @returns {ScheduleAndTasks} the intervals and the tasks for the simulation
 */
module.exports.createScheduleAndTasks = (configs) => {
    let SS = new ShipScheduler(configs);
    let schedulerResponse = SS.produceTiming();
    // console.log(schedulerResponse.docks.map((o) => { return o.processintervals }))
    // the response is the configuration that has the following way of returning docks
    //    { docks:
    //    [ { id: 'ed1d17d1-5c52-4d50-97b0-f6a20bfab0e1',
    //        number_loaders: 2,
    //        connections: [Object],
    //        processintervals: [Object],
    //        containers_toforward: [] },
    //      { id: '1301c6ef-55be-40a4-873f-fa8edaf01c69',
    //        number_loaders: 2,
    //        connections: [Object],
    //        processintervals: [Object],
    //        containers_toforward: [] } ],
    let TP = new TaskProducer(configs);
    let tasks = TP.produceTasks(TP.configs);


    let intervals = [];
    for (let i in schedulerResponse.docks) {
        intervals = intervals.concat(TP.configs.docks[i].processintervals);
    }
    return {
        intervals: intervals,
        tasks: tasks,
    }
};


// let data = require("./expecteddata.js");
//
// let result = this.createScheduleAndTasks(data.resp7);
// console.log(result.tasks);