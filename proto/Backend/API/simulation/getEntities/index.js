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
    getFlatData() { throw new Error("Not implemented by handler!"); }

    /**
     * Is used to retrieve the arrays of data associated with the requested object
     * @abstract
     * @returns a promise resolve with the final data of the asked stuff
     */
    getAggregataData() { throw new Error("Not implemented by handler!"); }

    static constructRetriever(option, timeline_id, simulaiton_id, db) {
        switch (option) {

            case DOCKS_OPTIONS:

                return new DockRetriever(timeline_id, simulaiton_id, db);

            case STORAGE_OPTIONS:
                throw new Error("not implemented yet!");
            case SHIP_OPTION:
                throw new Error("not implemented yet!");

        }
    }
}

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
    getDockIDs() {
        return this.docks.map((o) => { return o.id; })
    }
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
     * @returns a promise resolved or rejected
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

    try {

        // get the parameters
        simulation_id = event.pathParameters.simulation_id;
        timeline_id = event.pathParameters.timeline_id;
        option = event.pathParameters.option;

        // check if the option is one of the three
        option = option.toLowerCase();
        console.log(option);
        console.log(DOCKS_OPTIONS);
        if (option != DOCKS_OPTIONS && option != SHIP_OPTION && option != STORAGE_OPTIONS) {
            console.log("the option was incorrectly specified, aborting...");
            throw new Error("Wrong option!")
        }
        // prepare query for the db 

        // make the retriever
        dataRetriever = Retriever.constructRetriever(option, timeline_id, simulation_id, db);

    } catch (err) {

        console.log(err);
        lhelper.done({
            statusCode: 400,
            body: {
                message: "Missing simulaiton_id or timeline_id or options is wrong, make sure that the type requests is either: docks, ships or storages"
            }
        }, true);
        return;
    }

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