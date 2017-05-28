"use strict";
const DBHelper = require('db-helper');

class ChangeProcessor {

    constructor(connection) {

        this.connection = connection;
    }

    runQuery(query, params, message, verbose) {

        verbose = verbose | false;
        return new Promise((resolve, reject) => {

            if (verbose) console.log(`${message}: PENDING`);
            this.connection.query(query, params, (error, results, fields) => {
                if (error) {

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

    move(interval) {

        return this.runQuery("SELECT 1 + 1", [], "move");
    }

    pick(interval) {

        return this.runQuery("SELECT 1 + 1", [], "pick");
    }

    transfer(interval) {

        return this.runQuery("SELECT 1 + 1", [], "transfer");
    }

    dock(interval) {

        return this.runQuery("SELECT 1 + 1", [], "dock");
    }

    undock(interval) {

        return this.runQuery("SELECT 1 + 1", [], "undock");
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

                return cp.runQuery('SELECT * from Simulations WHERE id = ?', simulation_id, 'Getting Simulation info');
            })
            .then(simulation => {

                if (simulation.length === 0)
                    return {result: true, message: `No simulation with id: ${simulation_id}`};
                else simulation = simulation[0];

                if (simulation.current_time === end_time)
                    return {result: true, message: `Simulation already at time: ${end_time}`};

                isForward = (simulation.current_time - end_time) < 0;

                console.log(`Forward: ${isForward}`);
                console.log(`Simulation id: ${simulation.id}`);
                console.log(`Timeline id: ${simulation.current_timeline}`);

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

                if (events.result) {

                    console.log(events.message);
                    resolve(events);
                    connection.commit();
                    connection.end();
                }
                if(events.length === 0){

                    resolve();
                }
                let counter = 0;
                const executeEvent = () => {

                    console.log(events[counter].start_time);
                    cp[events[counter].type](events[counter], isForward)
                        .then(() => {

                            counter++;
                            if (counter < events.length) {

                                executeEvent();
                            } else {

                                connection.commit();
                                connection.end();
                                resolve();
                            }
                        })
                        .catch(error => {

                            connection.rollback();
                            connection.end();
                            reject(error);
                        });
                };
                executeEvent();

            })
            .catch();
    });
};

module.exports.Sync = Sync;

this.Sync("0fbf5dbf-38f5-4e00-ad12-34d6e246bdd0", 10)
    .then(res => {
        console.log('Done');
    })
    .catch(er => {
        console.log(er);
    });