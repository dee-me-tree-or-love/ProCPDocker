"use strict";

const config = require('./connection');
const mysql = require('mysql');

module.exports.getConnection = () => {

    return mysql.createConnection(config);
};
class DBHelper {

    constructor() {

        this.connection =  mysql.createConnection(config);
        this.connection.connect();
        console.log('Connection opened');
    }

    processInOrder(queries) {

        return new Promise((resolve, reject) => {

            if (queries.length === 0) resolve();

            let counter = 0;
            let results = [];
            const executeQuery = () => {

                queries[counter]
                    .then(result => {

                        results.push(result);
                        counter++;
                        if (counter < queries.length) {

                            executeQuery();
                        } else {

                            resolve();
                        }
                    })
                    .catch(error => {

                        console.log(error);
                        reject(error);
                    });
            };
            executeQuery()
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

                    console.log(results.length);
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

    commit() {

        this.connection.commit();
        this.connection.destroy();
    }

    rollback() {

        this.connection.rollback();
        this.connection.destroy();
    }
}
module.exports.DBHelper = DBHelper;