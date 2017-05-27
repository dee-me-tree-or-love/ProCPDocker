'use strict';
const LambaHelper = require('basic-lambda-helper');
const DBHelper = require('db-helper');
// get simulation data function
//
// https: // github.com/dee-me-tree-or-love/ProCPDocker/blob/d3fb722f4d47c18c35077779a6b08addcd7c26fa/proto/Backend/API_DOCUMENATION.md#simulationsimulation_id
module.exports.handler = (event, context, callback) => {

    let lhelper = new LambaHelper(event, context, callback);
    try {

        event.body = JSON.parse(event.body);
        lhelper.parseBody();
    } catch (e) {

        lhelper.done({
            statusCode: 400,
            body: {
                message: "Malformed JSON. Please check for syntax errors"
            }
        });
        context.done();
    }

    let simID = event.pathParameters.simulation_id;
    let scope = [];
    if (typeof event.queryStringParameters.scope !== 'undefined') {

        scope = event.queryStringParameters.scope.split(',');
    }

    const connection = DBHelper.getConnection();
    let response = {};

    connection.connect();
    const runQuery = (query, params, message) => {

        return new Promise((resolve, reject) => {

            console.log(`${message}: PENDING`);
            connection.query(query, params, (error, results, fields) => {
                if (error) {

                    console.log(`${message}: FAIL`);
                    console.log(error);
                    reject(error);
                } else {

                    console.log(`${message}: OK`);
                    resolve(results);
                }
            });
        });
    };

    new Promise((resolve, reject) => {
        // Begin transaction
        connection.beginTransaction(function (err) {
            if (err) {

                reject(err);
            } else {

                resolve();
            }
        });
    })
        .then(() => {

            return runQuery('SELECT * FROM Simulations WHERE id = ?', simID, 'Fetching simulation');
        })
        .then(result => {

            if (result.length > 0) {
                result = result[0];
                response = {
                    id: result.id,
                    date_created: result.date_created,
                    current_time: result.current_time,
                    current_timeline_id: result.current_timeline,
                    scope: []
                };
                let scopeComponents = [];
                if (scope.length > 0) {

                    response.scope = scope;
                    response.scope.forEach(component => {
                        switch (component) {
                            case "docks":
                                console.log('Docks requested');
                                scopeComponents.push(runQuery(
                                    'SELECT * ' +
                                    'FROM Docks d ' +
                                    'WHERE d.id in (	' +
                                    '   SELECT ch.id	' +
                                    '   FROM ContainerHold ch	' +
                                    '   JOIN Timelines t	' +
                                    '   ON t.id = ch.timeline_id	' +
                                    '   JOIN Simulations s	' +
                                    '   ON s.id = t.simulation_id	' +
                                    '   WHERE s.id = ?	' +
                                    '   AND ch.`type` = "dock")',
                                    simID, 'Fetching docks'));
                                break;

                            case "ships":
                                console.log('Ships requested');
                                scopeComponents.push(runQuery(
                                    'SELECT * ' +
                                    'FROM Ships sh ' +
                                    'WHERE sh.container_hold in (	' +
                                    '   SELECT ch.id	' +
                                    '   FROM ContainerHold ch	' +
                                    '   JOIN Timelines t	' +
                                    '   ON t.id = ch.timeline_id	' +
                                    '   JOIN Simulations s	' +
                                    '   ON s.id = t.simulation_id	' +
                                    '   WHERE s.id = ?	' +
                                    '   AND ch.`type` = "ship")',
                                    simID, 'Fetching ships'));
                                break;
                            case "storages":
                                console.log('Storages requested');
                                scopeComponents.push(runQuery(
                                    'SELECT ch.id,x,y,z,ch.name ' +
                                    'FROM ContainerHold ch ' +
                                    'JOIN Timelines t ' +
                                    'ON t.id = ch.timeline_id ' +
                                    'JOIN Simulations s ' +
                                    'ON s.id = t.simulation_id ' +
                                    'WHERE ch.`type` = "storage" ' +
                                    'AND s.id = ?',
                                    simID, 'Fetching storages'));
                                break;
                        }
                    });
                    console.log(scopeComponents.length);
                    return Promise.all(scopeComponents);
                }
            }
            else {

                connection.commit();
                connection.end();
                lhelper.done({
                    statusCode: 200,
                    body: {}
                }, true);
                context.done();
            }
        })
        .then(all => {

            connection.commit();
            connection.end();
            let enrichedScope = {};
            for (let i = 0; i < response.scope.length; i++) {

                let component = response.scope[i];
                if (component.toLowerCase() === 'ships') {

                    all[i].forEach(ship => {

                        ship.id = ship.container_hold;
                        delete ship.container_hold;
                    })
                }
                enrichedScope[component] = all[i];
            }
            response.scope = enrichedScope;
            lhelper.done({
                statusCode: 200,
                body: response
            }, true);
        })
        // Handle errors
        .catch(error => {

            connection.end();
            lhelper.done({
                statusCode: 400,
                body: error
            }, true);
        });
};