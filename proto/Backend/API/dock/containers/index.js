'use strict';
const LHelper = require('basic-lambda-helper');
const DBHelper = require('db-helper').DBHelper;
const lodash = require('lodash');

module.exports.handler = (event, context, callback) => {

    const lhelper = new LHelper(event, context, callback);

    let simulation_id = event.pathParameters.simulation_id;
    let timeline_id = event.pathParameters.timeline_id;
    let dock_id = event.pathParameters.dock_id;

    if(event.queryStringParameters === null) event.queryStringParameters = {};
    lodash.defaults(event.queryStringParameters,{limit: 10,pagination_token: ''});

    let limit = event.queryStringParameters.limit;
    let pagination_token = event.queryStringParameters.pagination_token;

    const db = new DBHelper();
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
                'AND c.id > ? ' +
                'AND ch.type = "dock" ' +
                'ORDER by c.id ' +
                'LIMIT ?;', [simulation_id, dock_id, timeline_id, pagination_token, Number(limit)], 'Fetching Containers'
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
            containers = (containers.length === 0 ) ? [] : containers;
            db.commit();
            let pagination_token = (containers.length === 0 ) ? null : containers[containers.length - 1].id;
            let pagination_url = (containers.length === 0 ) ? null : `https://${event.headers.Host}${event.requestContext.path}?limit=${limit}&pagination_token=${pagination_token}`;
            lhelper.done({
                statusCode: 200,
                body: {
                    containers,
                    pagination_token,
                    pagination_url
                }
            },true);
        })
        .catch(error => {

            console.log(error);
            lhelper.done({
                statusCode: 400,
                body: error
            });
        },true);
};
