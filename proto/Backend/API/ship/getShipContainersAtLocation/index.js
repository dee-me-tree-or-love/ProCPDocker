'use strict';
const DBHelper = require('db-helper').DBHelper;
const LambdaHelper = require('basic-lambda-helper');
const lodash = require('lodash');
// get container info about a ship

module.exports.handler = (event, context, callback) => {

    const lhelper = new LambdaHelper(event, context, callback);
    const db = new DBHelper();



    let sim_id, timeline_id, ship_id, location_type;
    let limit, pagination_token;

    try {
        sim_id = event.pathParameters.simulation_id;
        timeline_id = event.pathParameters.timeline_id;
        ship_id = event.pathParameters.ship_id;
        location_type = event.pathParameters.location;

        if (event.queryStringParameters === null) event.queryStringParameters = {};
        lodash.defaults(event.queryStringParameters, { limit: 10, pagination_token: '' });

        limit = event.queryStringParameters.limit;
        pagination_token = event.queryStringParameters.pagination_token;


        // check if the type is correct
        if (location_type !== "onboard" && location_type !== "load" && location_type !== "unload") {
            console.log(`wrong type specified: ${location_type}`);
            throw new Error("Wrong type!");
        }
        // prepare for the db correct form
        if (location_type.includes("load")) {
            location_type = "to_" + location_type;
            console.log(`updated the location type to be: ${location_type}`);
        }
    } catch (err) {
        console.log(err);
        lhelper.done({
            statusCode: 400,
            body: {
                message: "Missing simulaiton_id or timeline_id or ship_id, make sure that the type requests is either: load, unload or onboard"
            }
        }, true);
        return;
    }


    db.start()
        .then(() => {
            // make query

            return db.runQuery(
                "SELECT C.* " +
                "FROM Containers as C " +
                "JOIN ContainerHold as CH ON C.container_hold = CH.id " +
                "JOIN Timelines as TL ON TL.id = CH.timeline_id " +
                "WHERE C.id in " +
                "(SELECT SC.container_id FROM ShipContainer as SC " +
                "WHERE SC.ship_id = ? AND SC.type = ?) " +
                "AND TL.id = ? AND TL.simulation_id = ? " +
                "AND CH.type=\"ship\" AND C.id > ? " +
                "ORDER by C.id " +
                "LIMIT ?;", [ship_id, location_type, timeline_id, sim_id, pagination_token, Number(limit)], `Getting the containers of type: ${location_type}`, true);
        })
        .then(containers => {
            // process response
            db.commit();

            console.log(containers.length);

            if (containers.length >= 1) {

                containers = containers.map((c) => {
                    return {
                        id: c.id,
                        description: c.description,
                        address: {
                            location_id: c.container_hold,
                            x: c.x,
                            y: c.y,
                            z: c.z
                        },
                        weight: c.weight,
                        cargo_type: c.cargo_type
                    };
                });
                console.log(containers);


                pagination_token = containers[containers.length - 1].id;

                lhelper.done({
                    statusCode: 200,
                    body: {
                        containers,
                        pagination_token,
                        pagination_url: `https://${event.headers.Host}${event.requestContext.path}?limit=${limit}&pagination_token=${pagination_token}`
                    }
                });
                return;

            } else {

                let pagination_token = '';
                lhelper.done({
                    statusCode: 200,
                    body: {
                        containers,
                        pagination_token,
                        pagination_url: `https://${event.headers.Host}${event.requestContext.path}?limit=${limit}&pagination_token=${pagination_token}`
                    }
                });
                return;
            }
        })
        .catch(err => {
            // handle problems
            db.rollback();
            console.log(err);
            lhelper.done({
                statusCode: 400,
                body: error
            });
        })

}