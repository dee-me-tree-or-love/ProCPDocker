'use strict';
const DBHelper = require('db-helper').DBHelper;
const LambdaHelper = require('basic-lambda-helper');
// get general info about a ship
//
// https://github.com/dee-me-tree-or-love/ProCPDocker/blob/develop/proto/Backend/API_DOCUMENATION.md#storagesimulation_idtimeline_idstorage_id

module.exports.handler = (event, context, callback) => {

    const lhelper = new LambdaHelper(event, context, callback);
    const db = new DBHelper();

    let sim_id, timeline_id, ship_id;
    try {
        sim_id = event.pathParameters.simulation_id;
        timeline_id = event.pathParameters.timeline_id;
        ship_id = event.pathParameters.ship_id;
    } catch (err) {
        lhelper.done({
            statusCode: 400,
            body: {
                message: "Missing simulaiton_id or timeline_id or ship_id"
            }
        }, true);
        return;
    }

    db.start()
        .then(() => {

            // CH.timeline_id as timeline_id, TL.simulation_id as simulation_id
            return db.runQuery(
                "SELECT CH.id as ship_id, CH.x as x, CH.y as y, CH.z as z, " +
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
                "WHERE TL.simulation_id = ? AND TL.id = ? AND CH.id = ?;", [sim_id, timeline_id, ship_id],
                "getting the ship information", true);
        })
        .then(response => {
            db.commit();
            console.log(`response: ${response}`);
            if (response.length == 1) {

                let ship = {
                    id: response[0].ship_id,
                    size: {
                        x: response[0].x,
                        y: response[0].y,
                        z: response[0].z,
                    },
                    containers_max: response[0].container_max,
                    containers_current: response[0].containers_current,
                    containers_unload: response[0].containers_unload,
                    containers_load: response[0].containers_load,
                    destination: {
                        id: response[0].destination_id,
                        estimated_arrival_time: response[0].ship_eta,
                    }
                }

                // succesful response
                lhelper.done({
                    statusCode: 200,
                    body: ship
                }, true);
                return;

            } else {

                // bad query
                lhelper.done({
                    statusCode: 400,
                    body: {
                        message: "Unexpected response size, check your request for correctness..."
                    }
                },true);
                return;
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
        })
};