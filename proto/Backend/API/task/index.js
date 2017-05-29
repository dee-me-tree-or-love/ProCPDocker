'use strict';
const DBHelper = require('db-helper').DBHelper;
const LambdaHelper = require('basic-lambda-helper');
const lodash = require('lodash');

module.exports.handler = (event, context, callback) => {

    const lhelper = new LambdaHelper(event, context, callback);

    const db = new DBHelper();

    if (event.queryStringParameters === null || typeof event.queryStringParameters === 'undefined') event.queryStringParameters = {};
    lodash.defaults(event.queryStringParameters, {limit: 10, time_stamp: 0});

    let time_stamp = event.queryStringParameters.time_stamp;
    let limit = event.queryStringParameters.limit;
    if (limit < 0) limit = 0;

    let sim_id, timeline_id;
    try {
        sim_id = event.pathParameters.simulation_id;
        timeline_id = event.pathParameters.timeline_id;
    } catch (err) {
        lhelper.done({
            statusCode: 400,
            body: {
                message: "Missing simulaiton_id or timeline_id"
            }
        }, true);
        return;
    }

    db.start()
        .then(() => {

            return db.runQuery(
                "SET @counter = 0; " +
                "SELECT (@counter := @counter +1) as time_id, sub.* " +
                "FROM " +
                "(SELECT t.id as task_id, t.type as task_type, t.description as task_description, t.status as task_status, source_id, destination_id, " +
                "       t.container_id,e.id as event_id, e.type as event_type, e.message as event_message, e.start_time as event_start_time, t.end_time as task_end_time, t.start_time as task_start_time " +
                "FROM Events e " +
                "LEFT JOIN  Tasks t " +
                "ON e.task_id = t.id " +
                "JOIN Intervals i " +
                "ON t.interval_id = i.id " +
                "JOIN Timelines tl " +
                "ON i.timeline_id = tl.id " +
                "WHERE tl.id = ? " +
                "AND tl.simulation_id = ? " +
                "ORDER BY e.start_time, t.start_time ) sub " +
                "order by time_id;", [timeline_id, sim_id], "Getting tasks", true
            );
        })
        .then(response => {

            if (response[1].length === 0) {

                lhelper.done({
                    statusCode: 200,
                    body: {
                        tasks: []
                    }
                });
                return;
            }
            db.commit();

            response = response[1];

            console.log(`Total events: ${response.length}`);
            let tasksIndecies = {}, tasksArr = [], counter = 0, pagination_token = 0;
            response.forEach(event => {

                if (event.time_id <= time_stamp) return; //Only include events after the pagination time_stamp

                if (typeof tasksIndecies[event.task_id] === 'undefined') {

                    console.log(`First time task ${event.task_id}`);
                    tasksIndecies[event.task_id] = counter;
                    counter++;
                    tasksArr.push({
                        id: event.task_id,
                        type: event.task_type,
                        start_time: event.task_start_time,
                        end_time: event.task_end_time,
                        extra: {
                            destination_id: event.destination_id,
                            source_id: event.source_id,
                            container_id: event.container_id
                        },
                        description: event.task_description,
                        status: event.task_status,
                        events: []
                    });
                    console.log(`We now have ${tasksArr.length} tasks`);
                }
                tasksArr[tasksIndecies[event.task_id]].events.push({
                    id: event.event_id,
                    type: event.event_type,
                    message: event.event_message,
                    time_stamp: event.event_start_time,
                    time_id: event.time_id
                });
            });
            //Limit tasks
            tasksArr = tasksArr.splice(event.queryStringParameters.time_stamp, limit);

            //Get time_id of last included event
            [].concat.apply([], tasksArr.map(t => {
                return t.events;
            })).forEach(e => {
                if (e.time_id > pagination_token) pagination_token = e.time_id;
                delete  e.time_id;
            });
            lhelper.done({
                statusCode: 200,
                body: {
                    tasks: tasksArr,
                    next_time_stamp: pagination_token,
                    next_time_stamp_url: `https://${event.headers.Host}${event.requestContext.path}?limit=${limit}&time_stamp=${pagination_token}`
                }
            }, true);
        })
        .catch(error => {

            console.log(error);
            lhelper.done({
                statusCode: 400,
                body: {
                    error,
                    limit,
                    pagination_token
                }
            }, true);
        });
};