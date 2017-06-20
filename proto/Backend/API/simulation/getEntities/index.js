// TODO: finish the selection

'use strict';

const DBHelper = require('db-helper').DBHelper;
const LambdaHelper = require('basic-lambda-helper');

// queries per isntance:

class Retriever {
    constructor(timeline_id, simulation_id, db) {
        this.db = db;
        this.timeline_id = timeline_id;
        this.simulation_id = simulation_id;
    }

    /**
     * Is used to get the flat data about the requested object
     * @abstract
     * @returns a promise db.runQuery
     */
    getFlatData() { return Promise.resolve("not implemented or not needed"); }

    /**
     * Is used to retrieve the arrays of data associated with the requested object
     * @abstract
     * @returns a promise resolve with the final data of the asked stuff
     */
    getAggregataData() { return Promise.resolve("not implemented or not needed"); }

    static constructRetriever(option, timeline_id, simulaiton_id, db) {
        switch (option) {

            case DOCKS_OPTIONS:

                return new DockRetriever(timeline_id, simulaiton_id, db);

            case STORAGE_OPTIONS:
                return new StorageRetriever(timeline_id, simulaiton_id, db);

            case SHIP_OPTION:

                return new ShipRetriver(timeline_id, simulaiton_id, db);

        }
    }
}

// implemented
class DockRetriever extends Retriever {

    // could kinda use the JS setter functions, but meh...
    setDocks(_docks) {
            this.docks = _docks;
            // construct the associative array
            this.docksById = {};
            for (let key in this.docks) {
                // this.docksById[this.docks[key].id] = {};
                this.docksById[this.docks[key].id] = this.docks[key];
            }
        }
        /**
         * @deprecated
         */
    getDockIDs() {
            return this.docks.map((o) => { return o.id; })
        }
        /**
         * @deprecated
         */
    getDockIDsString() {
        return history.getDockIDs.join('","');
    }

    setDockConnections(_connections) {
        this.dockConnections = _connections;
    }
    setScheduledShips(_sched_ships) {
        this.sheduledShips = _sched_ships;
    }

    /**
     * Returns a string db query for all the flat data we can get about the docks:
     * 1 row per dock
     */
    getDockDataQuery() {
        return 'SELECT d.id, d.loaders_count, ' +
            '(SELECT COUNT(*) FROM Containers WHERE container_hold = d.id) as container_count, ' +
            ' (SELECT container_hold as ship_id FROM Ships WHERE dock_id = d.id) as connected_ship_id ' +
            ' FROM ContainerHold ch JOIN Docks d ON ch.id = d.id ' +
            ' JOIN Timelines tl ON ch.timeline_id = tl.id ' +
            ` WHERE tl.id = "${this.timeline_id}" ` +
            `AND tl.simulation_id = "${this.simulation_id}" ` +
            ` AND type = "dock";`;
    }

    /**
     * Returns a string db query for all the connections
     */
    getDockConnectionsQuery() {

        // this this is not the this you would expect for some reason...
        // it's a Query! 
        console.log(this);
        let arraySet = this.docks.map((o) => { return o.id; }).join('","');
        console.log(arraySet);

        return `SELECT * ` +
            `FROM StorageDock ` +
            `WHERE dock_id IN ("${arraySet}")`;
    }

    /**
     * Returns a string db query to query for all the scheduled ships with their destination docks 
     */
    getDockScheduledShipsQuery() {
        return `SELECT DISTINCT(ship_id), eta, i.dock_id ` +
            `FROM Intervals i JOIN Timelines tl ON i.timeline_id = tl.id ` +
            `WHERE ship_id is not null ` +
            `AND i.timeline_id = "${this.timeline_id}" ` +
            `AND tl.simulation_id = "${this.simulation_id}" ORDER by eta; `;
    }

    // CONSTRUCT DATA INTO A SINGLE REPONSE BODY


    // OVERRIDING HANDLERS

    /**
     * Returns a promise resolved or rejected
     * @returns 
     */
    getFlatData() {

        let retriever = this;

        return retriever.db.runQuery(retriever.getDockDataQuery(), [], "Retrieving the dock flat data", true)
            .then(docks => {

                console.log("retrieved docks");
                console.log(docks);

                if (docks.length > 0) {
                    retriever.setDocks(docks);

                    return Promise.resolve(docks);
                } else {
                    return Promise.reject("Could not retrieve the docks");
                }

            });
    }

    /**
     * 
     */
    getAggregataData() {

        let retriever = this;

        return this.db.runQuery(this.getDockConnectionsQuery(), [], "Getting the dock connections", true)
            .then(connections => {

                // get connections
                console.log(connections);
                retriever.setDockConnections(connections);

                // map connections to correct docks
                for (let key in connections) {
                    if (!retriever.docksById[connections[key].dock_id].connected_storages) {
                        retriever.docksById[connections[key].dock_id].connected_storages = [];
                    }
                    retriever.docksById[connections[key].dock_id].connected_storages
                        .push(connections[key]);
                    // remove redundant properties - ?
                    // delete connections[key].dock_id;
                }

                // return the promise of the next query
                return retriever.db
                    .runQuery(retriever.getDockScheduledShipsQuery(), [], "Retrieveing the dock scheduled ships", true);
            })
            .then(scheduledShips => {


                // get scheduled ships
                console.log(scheduledShips);
                retriever.setScheduledShips(scheduledShips);

                // map ships to correct docks
                for (let key in scheduledShips) {

                    if (!retriever.docksById[scheduledShips[key].dock_id].scheduled_ships) {
                        retriever.docksById[scheduledShips[key].dock_id].scheduled_ships = [];
                    }
                    retriever.docksById[scheduledShips[key].dock_id].scheduled_ships
                        .push(scheduledShips[key]);

                    // remove the redundant property
                    delete scheduledShips[key].dock_id;
                }

                return Promise.resolve(retriever.docks);
            })
    }
}

// ridicoulous - > I had a Re!_R_!triever written and it wouldn't work :) 
// implemented
class ShipRetriver extends Retriever {

    setShipData(ships) {
        this.ships = ships;
    }

    /**
     * Processes the response array to construct correct list with ship objects wit required structure
     * Sets the data to the ships
     * @param {Array} response from the db query 
     */
    parseFlatResponse(response) {
        let temp_ships = [];
        for (let key in response) {
            let ship = {
                id: response[key].ship_id,
                size: {
                    x: response[key].x,
                    y: response[key].y,
                    z: response[key].z,
                },
                containers_max: response[key].container_max,
                containers_current: response[key].containers_current,
                containers_unload: response[key].containers_unload,
                containers_load: response[key].containers_load,
                destination: {
                    id: response[key].destination_id,
                    estimated_arrival_time: response[key].ship_eta,
                }
            }
            temp_ships.push(ship);
        }
        this.setShipData(temp_ships);
    }


    getShipDataQuery() {
        return "SELECT CH.id as ship_id, CH.x as x, CH.y as y, CH.z as z, " +
            "(x * y * z) as container_max, " +
            "(SELECT COUNT(*) FROM Containers WHERE container_hold = CH.id ) as containers_current, " +
            "(SELECT COUNT(*) FROM ShipContainer WHERE ship_id = CH.id AND type=\"to_unload\") as containers_unload, " +
            "(SELECT COUNT(*) FROM ShipContainer WHERE ship_id = CH.id AND type=\"to_load\") as containers_load, " +
            "S.eta as ship_eta, " +
            "(SELECT D.id " +
            "FROM Docks AS D JOIN Tasks AS T ON T.destination_id = D.id JOIN " +
            "Intervals AS I ON I.id = T.interval_id WHERE T.type = \"schedule\" AND I.ship_id = CH.id " +
            "GROUP BY D.id) as destination_id " +
            "FROM Ships AS S JOIN ContainerHold as CH ON S.container_hold = CH.id " +
            "JOIN Timelines as TL ON TL.id = CH.timeline_id " +
            `WHERE TL.simulation_id = "${this.simulation_id}" AND TL.id = "${this.timeline_id}";`
    }

    getFlatData() {

        let retriever = this;

        console.log(retriever.getShipDataQuery());
        return retriever.db.runQuery(retriever.getShipDataQuery(), [], "Retrieving ship data", true)
            .then(ships => {
                console.log("retrieved ships");
                console.log(ships);

                if (ships.length > 0) {
                    retriever.parseFlatResponse(ships);

                    return Promise.resolve(retriever.ships);
                } else {

                    return Promise.reject("Could not retrieve the ships");
                }
            });
    }

    // there aint aggregate data from the ships that you can get...
    /**
     * @returns a promise resolve with the ship data 
     */
    getAggregataData() {
        let retriever = this;
        return Promise.resolve(retriever.ships);
    }
}



class StorageRetriever extends Retriever {

    getStorageDataQuery() {
        return `SELECT ch.id, ch.x, ch.y, ch.z, (ch.x * ch.y * ch.z) AS containers_max, ` +
            ` (SELECT COUNT(*) FROM Containers WHERE container_hold = ch.id) AS containers_current ` +
            ` FROM ContainerHold ch JOIN Timelines tl ON ch.timeline_id = tl.id ` +
            ` WHERE tl.id = "${this.timeline_id}" ` +
            ` AND tl.simulation_id = "${this.simulation_id}" ` +
            `AND type = "storage"; `
    }

    setStorageData(storages) {
        this.storages = storages;

        // construct the associative array
        this.storagesById = {};
        for (let key in this.storages) {
            this.storagesById[this.storages[key].id] = this.storages[key];
        }
    }

    parseFlatResponse(response) {
        let temp_storages = [];
        console.log("received response");
        console.log(response);
        for (let key in response) {
            let storage = {
                id: response[key].id,
                size: {
                    x: response[key].x,
                    y: response[key].y,
                    z: response[key].z,
                },
                containers_max: response[key].containers_max,
                containers_current: response[key].containers_current,
            }
            temp_storages.push(storage);
        }
        console.log(temp_storages);
        this.setStorageData(temp_storages);
    }

    setConnections(connections) {
        this.storageConnections = connections;
    }

    /**
     * Returns a string db query for all the connections
     */
    getConnectionsQuery() {

        // this this is not the this you would expect for some reason...
        // it's a Query! 
        console.log(this);
        let arraySet = this.storages.map((o) => { return o.id; }).join('","');
        console.log(arraySet);

        return `SELECT * ` +
            `FROM StorageDock ` +
            `WHERE storage_id IN ("${arraySet}")`;
    }

    getFlatData() {
        let retriever = this;

        return retriever.db.runQuery(retriever.getStorageDataQuery(), [], "Retrieving the storage flat data")
            .then(ships => {
                console.log("retrieved ships");
                console.log(ships);

                if (ships.length > 0) {
                    retriever.parseFlatResponse(ships);

                    return Promise.resolve(retriever.ships);
                } else {

                    return Promise.reject("Could not retrieve the ships");
                }
            });
    }

    getAggregataData() {


        let retriever = this;

        return this.db.runQuery(this.getConnectionsQuery(), [], "Getting the storage connections", true)
            .then(connections => {

                // get connections
                console.log(connections);
                retriever.setConnections(connections);

                // map connections to correct docks
                for (let key in connections) {
                    if (!retriever.storagesById[connections[key].storage_id].connected_docks) {
                        retriever.storagesById[connections[key].storage_id].connected_docks = [];
                    }
                    retriever.storagesById[connections[key].storage_id].connected_docks
                        .push(connections[key]);
                    // remove redundant properties - ?
                    // delete connections[key].dock_id;
                }

                // return the promise of the next query
                console.log("line 399");
                console.log(retriever.storages);
                return Promise.resolve(retriever.storages);
            });
    }
}

const DOCKS_OPTIONS = "docks"
const STORAGE_OPTIONS = "storages"
const SHIP_OPTION = "ships"


module.exports.handler = (event, context, callback) => {

    const lhelper = new LambdaHelper(event, context, callback);
    const db = new DBHelper();

    let simulation_id;
    let timeline_id;
    let option;
    let dataRetriever;


    // get the parameters
    simulation_id = event.pathParameters.simulation_id;
    timeline_id = event.pathParameters.timeline_id;
    option = event.pathParameters.option;

    // check if the option is one of the three
    option = option.toLowerCase();
    console.log(option);
    // console.log(SHIP_OPTION);

    // if not in any of the accepted options should abort
    if (option != DOCKS_OPTIONS && option != SHIP_OPTION && option != STORAGE_OPTIONS) {

        console.log("the option was incorrectly specified, aborting...");
        // throw new Error("Wrong option!")
        // console.log(err);
        lhelper.done({
            statusCode: 400,
            body: {
                message: "Missing simulaiton_id or timeline_id or options is wrong, make sure that the type requests is either: docks, ships or storages"
            }
        }, true);
        return;
    }
    // prepare query for the db 

    // make the retriever
    dataRetriever = Retriever.constructRetriever(option, timeline_id, simulation_id, db);


    db.start()
        .then(() => {

            // run the flat query
            return dataRetriever.getFlatData();
        })
        .then(() => {

            // run the aggregate query
            return dataRetriever.getAggregataData();
        })
        .then(complete_data => {

            console.log("reached last section");
            console.log(complete_data);

            // finish
            db.commit();
            lhelper.done({
                statusCode: 200,
                body: complete_data
            }, true);
        })
        .catch(err => {

            // handle problems
            db.rollback(); // --> do not need it?
            console.log(err);
            lhelper.done({
                statusCode: 400,
                body: err
            }, true);
        })

}


// module.exports = { DockRetriever, Retriever }