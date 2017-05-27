"use strict";
const DBHelper = require('db-helper');

class ChangeProcessor {

    constructor(connection) {

        this.connection = connection;
    }

    runQuery(query, params, message){

        return new Promise((resolve, reject) => {

            console.log(`${message}: PENDING`);
            this.connection.query(query, params, (error, results, fields) => {
                if (error) {

                    console.log(`${message}: FAIL`);
                    reject(error);
                } else {

                    console.log(`${message}: OK`);
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

                    reject(err);
                } else {

                    resolve();
                }
            });
        });
    }

    move(interval) {

        return this.runQuery("SELECT 1 + 1", [], "you do smt");
    }
}

const Sync = (simulation_id, end_time) => {

    return new Promise((resolve, reject) => {

        const connection = DBHelper.getConnection();

        connection.connect();
        let cp = new ChangeProcessor(connection);

        // Begin transaction
        cp.start()
            .then(() => {

                console.log('Get simulation');
                return cp.runQuery('SELECT * from Simulations WHERE id = ?', simulation_id, 'Getting Simulation info');
            })
            .then(simulation => {

                simulation = simulation[0];
                console.log(simulation.current_timeline);
                console.log(simulation.id);
                return cp.runQuery(
                    "SELECT e.* " +
                    "FROM Events e " +
                    "JOIN Tasks t " +
                    "ON e.task_id = t.id " +
                    "JOIN Intervals i " +
                    "ON t.interval_id = i.id " +
                    "JOIN Timelines tl " +
                    "ON tl.id = i.timeline_id " +
                    "WHERE tl.simulation_id = ? " +
                    "AND e.type = \"move\"" +
                    "AND tl.id = ?" +
                    "ORDER BY e.start_time", [simulation_id, simulation.current_timeline], 'Fetching events');
            })
            .then(events => {

                let isForward = true; // Get from db diff
                let counter = 0;

                const executeEvent = () => {

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

this.Sync("29850869-481e-4d04-8049-5dd634f0c638")
    .then(res => {
    })
    .catch(er => {
        console.log(er);
    });