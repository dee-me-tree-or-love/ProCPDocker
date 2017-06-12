'use strict';
const DBHelper = require('db-helper').DBHelper;
const LambdaHelper = require('basic-lambda-helper');

module.exports.handler = (event, context, callback) => {

    const lhelper = new LambdaHelper(event, context, callback);
    const db = new DBHelper();

    let sim_id;
    let timeline_id;
    let option;

    try {

        // get the parameters
        sim_id = event.pathParameters.simulation_id;
        timeline_id = event.getParameter.timeline_id;
        option = event.getParameter.option;

        // check if the option is one of the three
        option = option.toLowerCase();
        if (option != "docks" && option != "ships" && options != "storages") {
            console.log("the option was incorrectly specified, aborting...");
            throw new Error("Wrong option!")
        }
        // prepare for the db 
        let db_query = "";
        switch (option) {
            case "docks":
                console.log("Docks requested");
                db_query = "SELECT d.id, d.loaders_count " +
                    "FROM ContainerHold ch " +
                    "JOIN Docks d " +
                    "ON ch.id = d.id " +
                    "JOIN Timelines tl " +
                    "ON ch.timeline_id = tl.id " +
                    "WHERE tl.id = ? " +
                    "AND tl.simulation_id = ? " +
                    'AND type = "dock"', [timeline_id, simulation_id], 'Fetching Storages'
                break;
            case "ships":
                console.log("Ships requested");
                db_query = "";
                break;
        }

    } catch (err) {

    }


}