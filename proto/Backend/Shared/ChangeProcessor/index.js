"use strict";
const DBHelper = require('db-helper');

class ChangeProcessor {

    constructor(connection) {

        this.connection = connection;
    }

    processEvents(events, isForward){

        return new Promise((resolve, reject) => {

            let counter = 0;
            const executeEvent = () => {

                this[events[counter].type](events[counter], isForward)
                    .then(() => {

                        counter++;
                        if (counter < events.length) {

                            executeEvent();
                        } else {

                            resolve();
                        }
                    })
                    .catch(error => {

                        console.log(error);
                        reject(error);
                    });
            };
            executeEvent()
        });
    }

    runQuery(query, params, message, verbose) {

        verbose = verbose | false;
        return new Promise((resolve, reject) => {

            if (verbose) console.log(`${message}: PENDING`);
            this.connection.query(query, params, (error, results, fields) => {
                if (error) {

                    console.log(error);
                    if (verbose) console.log(`${message}: FAIL`);
                    reject(error);
                } else {

                    if (verbose) console.log(`${message}: OK`);
                    resolve(results);
                }
            });
        });
    };

    start() {
        return new Promise((resolve, reject) => {

            console.log('Begin transaction');
            this.connection.beginTransaction(function (err) {
                if (err) {

                    console.log(err);
                    reject(err);
                } else {

                    resolve();
                }
            });
        });
    }

    move(event, isForward) {

        let queryTop = "UPDATE Containers C " +
            "JOIN Tasks T " +
            "ON C.id = T.container_id " +
            "JOIN Events E " +
            "ON T.id = E.task_id ";

        if (isForward) {
            queryTop += "SET C.container_hold = T.destination_id, T.status = \"done\" ";
        } else {
            queryTop += "SET C.container_hold = T.source_id, T.status = \"executing\" ";
        }
        console.log(`Executed move with forward: ${isForward}`);
        return this.runQuery(queryTop + "WHERE E.id = ?;", [event.id], "move");
    }

    pick(event, isForward) {
        let query = "UPDATE Tasks T " +
            "join Events E " +
            "on E.task_id = T.id ";
        if (isForward) {
            query += "SET T.status = \"executing\" ";
        } else {
            query += "SET T.status = \"waiting\" ";
        }
        console.log(`Executed pick with forward: ${isForward}`);
        return this.runQuery(query + "WHERE E.id = ?;", [event.id], "pick");
    }

    transfer(event, isForward) {
        // handling is implicit and is not taken to the extend of affecting the database
        console.log(`Executed transfer with forward: ${isForward}`);
        return this.runQuery("SELECT 1 + 1", [], "transfer");
    }

    dock(event, isForward) {

        if (isForward) {
            return this.runQuery(
                "UPDATE Ships S " +
                "JOIN Intervals I " +
                "ON S.container_hold = I.ship_id " +
                "JOIN Tasks T " +
                "ON T.interval_id = I.id " +
                "JOIN Events E " +
                "ON E.task_id = T.id " +
                "SET S.dock_id = T.destination_id " +
                "WHERE E.id = ?", [event.id], 'Executing dock event')
        } else {

            return this.undock(event, !isForward);
        }
    }

    undock(event, isForward) {

        if (isForward) {
            return this.runQuery(
                "UPDATE Ships S " +
                "JOIN Intervals I " +
                "ON S.container_hold = I.ship_id " +
                "JOIN Tasks T " +
                "ON T.interval_id = I.id " +
                "JOIN Events E " +
                "ON E.task_id = T.id " +
                "SET S.dock_id = NULL " +
                "WHERE E.id = ?", [event.id], 'Executing dock event');
        } else {

            return this.dock(event, !isForward);
        }
    }
}

const Sync = (simulation_id, end_time) => {

    return new Promise((resolve, reject) => {

        const connection = DBHelper.getConnection();

        connection.connect();
        let cp = new ChangeProcessor(connection);
        let isForward = true;

        // Begin transaction
        cp.start()
            .then(() => {

                return cp.runQuery('SELECT * from Simulations WHERE id = ?', simulation_id, 'Getting Simulation info', true);
            })
            .then(simulation => {

                if (simulation.length === 0)
                    return {result: true, message: `No simulation with id: ${simulation_id}`};
                else simulation = simulation[0];

                if (simulation.current_time === end_time)
                    return {result: true, message: `Simulation already at time: ${end_time}`};

                isForward = (simulation.current_time - end_time) < 0;

                console.log(`------------------------`);
                console.log(`Forward: ${isForward}`);
                console.log(`Simulation id: ${simulation.id}`);
                console.log(`Timeline id: ${simulation.current_timeline}`);
                console.log(`Time diff: ${simulation.current_time} -> ${end_time}`);
                console.log(`------------------------`);

                let query =
                    "SELECT e.*" +
                    "FROM Events e " +
                    "JOIN Tasks t " +
                    "ON e.task_id = t.id " +
                    "JOIN Intervals i " +
                    "ON t.interval_id = i.id " +
                    "JOIN Timelines tl " +
                    "ON tl.id = i.timeline_id " +
                    "WHERE tl.simulation_id = ? " +
                    "AND tl.id = ? ";

                if (!isForward) {
                    query +=
                        "AND e.start_time >= ? " +
                        "AND e.start_time <= ? " +
                        "ORDER BY e.start_time DESC";
                } else {
                    query +=
                        "AND e.start_time <= ? " +
                        "AND e.start_time >= ? " +
                        "ORDER BY e.start_time";
                }

                return cp.runQuery(query, [simulation_id, simulation.current_timeline, end_time, simulation.current_time], 'Fetching events', true);
            })
            .then(events => {

                if (events.result || events.length === 0) {

                    return true;
                }

                console.log(`===> Events: ${events.length}`);
                return cp.processEvents(events, isForward);
            })
            .then(fastForward => {

                if (fastForward) return;
                return cp.runQuery(
                    "UPDATE Simulations S " +
                    "SET S.current_time = ? " +
                    "WHERE S.id = ?;", [end_time, simulation_id], "Updating the current time", true);
            })
            .then(() => {

                connection.commit();
                connection.end();
                resolve({result: true, message: 'All successful'});
            })
            .catch(error => {

                connection.rollback();
                connection.end();
                reject(error);
            });
    });
};

module.exports.Sync = Sync;

this.Sync("7fe9a6fe-d457-4c6e-84a4-a394178a2689", 0)
    .then(() => {

        console.log('Done');
    })
    .catch(er => {
        console.log(er);
    });