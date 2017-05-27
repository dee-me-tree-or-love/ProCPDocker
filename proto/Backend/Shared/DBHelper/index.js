"use strict";

const config = require('./connection');
const mysql = require('mysql');

module.exports.getConnection = () => {

    return mysql.createConnection(config);
};

module.exports.DBHelper = class DBHelper{

    constructor(){

        this.connected = false;
        this.inTransaction = false;
    }

    /**
     *
     * @returns {boolean}
     */
    checkConnected(){

        return this.connected;
    }
    /**
     *
     * Establishes a connection
     */
    connect(){

        return new Promise((resolve, reject) => {

            if(this.connected){

                reject('Already connected');
            }
            this.connection = mysql.createConnection(config);
            this.connection.connect(err => {
                if (err) {

                    reject();
                }else{

                    this.connected = true;
                    console.log('Connection opened');
                    resolve(this.connection.threadId);
                }
            });
        })
    }

    /**
     *
     * @param query
     * @param params
     * @param message
     * @returns {Promise}
     */
    runQuery(query, params, message){

        return new Promise((resolve, reject) => {

            if(!this.connected){

                reject('Not connected!');
            }
            console.log(`${message}: PENDING`);
            this.connection.query(query, params, (error, results, fields) => {

                if(!this.inTransaction){

                    this.connection.end();
                    console.log('Connection closed');
                }
                if (error) {

                    console.log(`${message}: FAIL`);
                    reject(error);
                } else {

                    console.log(`${message}: OK`);
                    resolve(results);
                }
            });
        });
    }

    /**
     *
     * @returns {Promise}
     */
    beginTransaction(){

        return new Promise((resolve, reject) => {
            // Begin transaction
            this.connection.beginTransaction(err => {
                if (err) {

                    this.inTransaction = true;
                    console.log('Transaction started');
                    reject(err);
                } else {

                    resolve();
                }
            });
        })
    }

    /**
     * Commits the transaction and closes the connection!
     *
     * @returns {Promise}
     */
    commitTransaction(){

        return new Promise((resolve, reject) => {

            this.connection.end();
            console.log('Connection closed');
            this.connected = false;
            this.connection.commit(err => {

                this.inTransaction = false;
                console.log('Transaction completed');
                if (err) {

                    reject(err);
                } else {

                    resolve();
                }
            });
        });
    }

    /**
     *
     * @param queries
     * @returns {Promise}
     */
    runQueriesInTransaction(queries){
        return new Promise((resolve, reject) => {

            let connection = mysql.createConnection(config);
            connection.open();
            connection.beginTransaction(err => {

                if(err){

                    reject(err);
                }else{

                    queries.forEach(query => {

                        query = new Promise((resolve,reject) => {

                            connection.query(query.query, query.params, (error, results, fields) => {

                                if (error) {

                                    console.log(error);
                                    reject(error);
                                } else {

                                    resolve(results);
                                }
                            });
                        });
                    });
                    console.log(`Enqueued ${queries.length} promises`);
                    Promise.all(queries)
                        .then(result => {

                            console.log(result);
                            connection.commit(err => {

                                connection.close();
                                if (err) {

                                    console.log(err);
                                    reject(err);
                                } else {

                                    resolve(result);
                                }
                            });
                        })
                        .catch(error => {

                            console.log(error);
                            connection.rollback(() => {

                                connection.close();
                                reject(error);
                            });
                        });
                }
            });

        });
    }
};
