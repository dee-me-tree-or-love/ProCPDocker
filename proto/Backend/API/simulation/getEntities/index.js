// TODO: finish the selection

'use strict';
const DBHelper = require('db-helper').DBHelper;
const LambdaHelper = require('basic-lambda-helper');

module.exports.handler = (event, context, callback) => {

    const lhelper = new LambdaHelper(event, context, callback);
    const db = new DBHelper();

    const DOCKS_OPTIONS = "docks"
    const STORAGE_OPTIONS = "storages"
    const SHIP_OPTION = "ships"

    let simulation_id;
    let timeline_id;
    let option;
    let db_query;

    try {

        // get the parameters
        simulation_id = event.pathParameters.simulation_id;
        timeline_id = event.pathParameters.timeline_id;
        option = event.pathParameters.option;

        // check if the option is one of the three
        option = option.toLowerCase();
        if (option != DOCKS_OPTIONS && option != SHIP_OPTION && option != STORAGE_OPTIONS) {
            console.log("the option was incorrectly specified, aborting...");
            throw new Error("Wrong option!")
        }
        // prepare query for the db 
        db_query = "";

        switch (option) {
            case DOCKS_OPTIONS:

                console.log("Docks requested");

                /*
                {
                    "id":"",
                    "loaders_count":0,
                    "connected_storages":[
                        {
                        "id":"",
                        "weight":0
                        }
                    ],
                    "container_count":0,
                    "connected_ship_id":"",
                    "scheduled_ships":[
                        {
                        "id":"",
                        "time_arrived":0
                        }
                    ]
                }
                */


                db_query = "SELECT d.id, d.loaders_count " +

                    // count containers
                    "(SELECT COUNT(*) " +
                    "FROM Containers " +
                    "WHERE container_hold = d.id) as container_current " +
                    // continue

                    "FROM ContainerHold ch " +
                    "JOIN Docks d " +
                    "ON ch.id = d.id " +
                    "JOIN Timelines tl " +
                    "ON ch.timeline_id = tl.id " +
                    `WHERE tl.id = "${timeline_id}" ` +
                    `AND tl.simulation_id = "${simulation_id}" ` +
                    'AND type = "dock"';
                break;

            case SHIP_OPTION:

                console.log("Ships requested");
                // TODO: implement the getting of the ship
                break;

            case STORAGE_OPTIONS:

                console.log("Storages requested");
                db_query = "SELECT ch.x, ch.y, ch.z, ch.id " +
                    "FROM ContainerHold ch " +
                    "JOIN Timelines tl " +
                    "ON ch.timeline_id = tl.id " +
                    // do not forget the quotes!
                    `WHERE tl.id = "${timeline_id}" ` +
                    `AND tl.simulation_id = "${simulation_id}" ` +
                    'AND type = "storage"';
                break;

            default:

                // if ends up here -> the previous if failed for some reason, theoretically impossible
                // but better be safe then sorry
                // console.log("the option was incorrectly specified, aborting...");
                // throw new Error("Wrong option!");
        }

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

            // run the query
            // the query is already parametrized during the preparation
            return db.runQuery(db_query, [], `Getting the entities of type: ${option}`, true);
        })
        .then(entities => {

            // maybe the db is not needed even...
            db.commit();

            if (entities.length === 0) {

                lhelper.done({
                    statusCode: 404,
                    body: {
                        message: `No entitties with the specified parameters are available`
                    }
                }, true)
            }

            let responseBody = [];

            // populate the response body
            switch (option) {
                case DOCKS_OPTIONS:

                    for (let key in entities) {

                        console.log(`retrieved entity:`);
                        console.dir(entities[key]);

                        let res = entities[key];

                        responseBody.push(res)
                    }
                    break;

                case SHIP_OPTION:

                    // TODO: populate the response with teh ships' data
                    break;

                case STORAGE_OPTIONS:

                    // TODO: populate the response body with storage data
                    break;

                default:
                    break;
            }

            // make the body of the response: 
            let body = {};
            body[option] = responseBody;
            console.log(body);
            // return the response body
            lhelper.done({
                statusCode: 200,
                body: body,
            }, true);
            return;

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