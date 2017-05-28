'use strict';
const LHelper = require('basic-lambda-helper');
const DBHelper = require('db-helper').DBHelper;

module.exports.handler = (event, context, callback) => {

    const lhelper = new LHelper(event, context, callback);

    let simulation_id = event.pathParameters.simulation_id;
    let timeline_id = event.pathParameters.timeline_id;
    let storage_id = event.pathParameters.storage_id;

    const db = new DBHelper();
    let storage = {};
    db.start()
        .then(() => {

            return db.runQuery(
                "SELECT ch.x, ch.y, ch.z, ch.id " +
                "FROM ContainerHold ch " +
                "JOIN Timelines tl " +
                "ON ch.timeline_id = tl.id " +
                "WHERE ch.id = ? " +
                "AND tl.id = ? " +
                "AND tl.simulation_id = ? " +
                'AND type = "storage"', [storage_id, timeline_id, simulation_id], 'Fetching Storages'
            );
        })
        .then(result => {

            if (result.length === 0) {

                lhelper.done({
                    statusCode: 404,
                    body: {
                        message: `No storage with id: ${storage_id} @sim:${simulation_id} @time:${timeline_id}`
                    }
                });
                return;
            }

            result = result[0];
            result.size = {
                x: result.x,
                y: result.y,
                z: result.z
            };
            result.containers_max = result.x * result.y * result.z;
            delete result.x;
            delete result.y;
            delete result.z;
            storage = result;
            Promise.resolve();
        })
        .then(() => {

            return db.runQuery(
                "SELECT COUNT(*) as containers_current " +
                "FROM Containers " +
                "WHERE container_hold = ? ", [storage_id], 'Fetching current container count'
            )
        })
        .then(containers_current => {

            storage.containers_current = containers_current[0].containers_current;
            return db.runQuery(
                "SELECT * " +
                "FROM StorageDock " +
                "WHERE storage_id = ?", [storage_id], 'Fetching connections'
            );
        })
        .then(connections => {

            storage.connections = connections;
            db.commit();
            lhelper.done({
                statusCode: 200,
                body: storage
            });
        })
        .catch(error => {

            console.log(error);
            lhelper.done({
                statusCode: 400,
                body: error
            });
        });
};
