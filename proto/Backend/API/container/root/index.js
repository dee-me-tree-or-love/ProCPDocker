'use strict';
const DBHelper = require('db-helper').DBHelper;
const LambdaHelper = require('basic-lambda-helper');

module.exports.handler = (event, context, callback) => {

    const lhelper = new LambdaHelper(event, context, callback);
    const db = new DBHelper();

    let sim_id, timeline_id, container_id;
    try {
        sim_id = event.pathParameters.simulation_id;
        timeline_id = event.pathParameters.timeline_id;
        container_id = event.pathParameters.container_id;
    } catch (err) {
        lhelper.done({
            statusCode: 400,
            body: {
                message: "Missing simulaiton_id or timeline_id or container_id"
            }
        }, true);
        return;
    }

    db.start()
        .then(() => {

            return db.runQuery(" SELECT C.* " +
                "FROM Containers as C JOIN ContainerHold as CH " +
                "ON C.container_hold = CH.id JOIN Timelines as TL " +
                "ON TL.id = CH.timeline_id " +
                "WHERE C.id = ? AND TL.simulation_id = ? AND TL.id = ?; ", [container_id,
                    sim_id,
                    timeline_id
                ],
                "requesting container info", true);
        })
        .then(c => {

            db.commit();

            console.log(`response: ${c}`);

            if (c.length == 1) {

                let container = {
                    id: c[0].id,
                    description: c[0].description,
                    address: {
                        location_id: c[0].container_hold,
                        x: c[0].x,
                        y: c[0].y,
                        z: c[0].z,
                    },
                    weight: c[0].weight,
                    cargo_type: c[0].cargo_type
                }

                lhelper.done({
                    statusCode: 200,
                    body: container
                }, true)
                return

            } else {

                // bad query
                lhelper.done({
                    statusCode: 400,
                    body: {
                        message: "Unexpected response size, check your request for correctness..."
                    }
                });
                return
            }
        })
        .catch(error => {
            db.rollback();
            // something messed up happened
            console.log(error);
            lhelper.done({
                statusCode: 400,
                body: {
                    error,
                    limit,
                    time_stamp
                }
            }, true);
            return
        })
}