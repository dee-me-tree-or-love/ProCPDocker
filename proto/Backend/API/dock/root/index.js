'use strict';
const LHelper = require('basic-lambda-helper');
const DBHelper = require('db-helper').DBHelper;

module.exports.handler = (event, context, callback) => {

    const lhelper = new LHelper(event, context, callback);

    let simulation_id = event.pathParameters.simulation_id;
    let timeline_id = event.pathParameters.timeline_id;
    let dock_id = event.pathParameters.dock_id;

    const db = new DBHelper();
    let dock = {};
    db.start()
        .then(() => {

            return db.runQuery(
                "SELECT d.id, d.loaders_count " +
                "FROM ContainerHold ch " +
                "JOIN Docks d " +
                "ON ch.id = d.id " +
                "JOIN Timelines tl " +
                "ON ch.timeline_id = tl.id " +
                "WHERE ch.id = ? " +
                "AND tl.id = ? " +
                "AND tl.simulation_id = ? " +
                'AND type = "dock"', [dock_id, timeline_id, simulation_id], 'Fetching Storages'
            );
        })
        .then(docks => {

            if (docks.length === 0) {

                lhelper.done({
                    statusCode: 404,
                    body: {
                        message: `No dock with id: ${dock_id} @sim:${simulation_id} @time:${timeline_id}`
                    }
                }, true);
                return;
            }
            dock = docks[0];
            Promise.resolve();
        })
        .then(() => {

            return db.runQuery(
                "SELECT COUNT(*) as containers_current " +
                "FROM Containers " +
                "WHERE container_hold = ? ", [dock_id], 'Fetching current container count'
            )
        })
        .then(containers_current => {

            dock.containers_count = containers_current[0].containers_current;
            return db.runQuery(
                "SELECT * " +
                "FROM StorageDock " +
                "WHERE dock_id = ?", [dock_id], 'Fetching connections'
            );
        })
        .then(connections => {

            dock.connections = connections;
            return db.runQuery(
                "SELECT container_hold as id " +
                "FROM Ships " +
                "WHERE dock_id = ?", [dock.id], 'Fetching connected ship'
            );
        })
        .then(ship => {

            dock.connected_ship_id = (ship.length === 0) ? null : ship[0].id;
            return db.runQuery(
                "SELECT DISTINCT(ship_id), eta " +
                "FROM Intervals i " +
                "WHERE i.dock_id = ? " +
                "AND ship_id is not null " +
                "AND timeline_id = ? " +
                "ORDER by eta;", [dock_id, timeline_id], 'Fetching scheduled ships'
            )
        })
        .then(scheduled_ships => {

            dock.scheduled_ships = (scheduled_ships.length === 0 ) ? [] : scheduled_ships;
            db.commit();
            lhelper.done({
                statusCode: 200,
                body: dock
            },true);
        })
        .catch(error => {

            db.rollback();
            console.log(error);
            lhelper.done({
                statusCode: 400,
                body: error
            },true);
        });
};
