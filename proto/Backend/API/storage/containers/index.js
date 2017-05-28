'use strict';
const LHelper = require('basic-lambda-helper');
const DBHelper = require('db-helper').DBHelper;
const lodash = require('lodash');

module.exports.handler = (event, context, callback) => {

    const lhelper = new LHelper(event, context, callback);

    let simulation_id = event.pathParameters.simulation_id;
    let timeline_id = event.pathParameters.timeline_id;
    let storage_id = event.pathParameters.storage_id;

    if(event.queryStringParameters === null) event.queryStringParameters = {};
    lodash.defaults(event.queryStringParameters,{limit: 10,pagination_token: 0});

    let limit = event.queryStringParameters.limit;
    let pagination_token = event.queryStringParameters.pagination_token;

    const db = new DBHelper();
    let storage = {};
    db.start()
        .then(() => {

            return db.runQuery(
                'SELECT c.* ' +
                'FROM Containers c ' +
                'JOIN ContainerHold ch ' +
                'ON ch.id = c.container_hold ' +
                'JOIN Timelines tl ' +
                'ON tl.id = ch.timeline_id ' +
                'WHERE simulation_id = ? ' +
                'AND ch.id = ? ' +
                'AND tl.id = ?' +
                'AND c.weight > ? ' +
                'ORDER by c.weight ' +
                'LIMIT ?;', [simulation_id, storage_id, timeline_id, pagination_token, Number(limit)], 'Fetching Storages'
            );
        })
        .then(containers => {

            containers = containers.map((c) => {
                return {
                    id: c.id,
                    description: c.description,
                    address:{
                        location_id: c.container_hold,
                        x: c.x,
                        y: c.y,
                        z: c.z
                    },
                    weight: c.weight,
                    cargo_type: c.cargo_type
                };
            });
            db.commit();
            let pagination_token = containers[containers.length - 1].weight + 1;
            lhelper.done({
                statusCode: 200,
                body: {
                    containers,
                    pagination_token,
                    pagination_url: `https://${event.headers.Host}${event.requestContext.path}?limit=${limit}&pagination_token=${pagination_token}`
                }
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
