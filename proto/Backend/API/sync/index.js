'use strict';
const LambdaHelper = require('basic-lambda-helper');
const DBHelper = require('db-helper').DBHelper;
const ChangeProcessor = require('change-proccessor');

module.exports.handler = (event, context, callback) => {

    const db = new DBHelper();
    let lhelper = new LambdaHelper(event, context, callback);



    try {

        event.body = JSON.parse(event.body);

    } catch (e) {
        console.log(e);
        lhelper.done({
            statusCode: 400,
            body: {
                message: "Malformed JSON. Please check for syntax errors"
            }
        }, true);
        context.done();
        return;
    }

    let simId, ret_tasks, end_time, timeline_id;


    lhelper.checkInputBody(["simulation_id", "timeline_id", "time_stamp", "return_tasks"]).then(() => {

            console.log("checked");
            console.log(event.body);
            let simId = event.body.simulation_id;
            let ret_tasks = event.body.return_tasks;
            let end_time = event.body.time_stamp;
            let timelineId = event.body.timeline_id;
            console.log("about to sync");
            // TODO: make sync work with the timelines
            return ChangeProcessor.Sync(simId, end_time);
        })
        .then(res => {
            console.log(res);

            if (res.result) {


                let ret_tasks = event.body.return_tasks;
                let end_time = event.body.time_stamp;

                let body = { acknowledged: end_time };

                if (!ret_tasks) {
                    lhelper.done({
                        statusCode: 200,
                        body: body
                    }, true);
                    context.done();
                    return;
                } else {
                    // getting the data from the database
                    return db.start()
                }
            } else {

                console.log("got an error");
                throw { message: "Something went wrong while with the syncronization" }
            }
        }).then(() => {

            let simId = event.body.simulation_id;
            let end_time = event.body.time_stamp;
            let timelineId = event.body.timeline_id;


            return db.runQuery(
                "SELECT t.id as task_id, t.type as task_type, t.description as task_description, t.status as task_status, source_id, destination_id, " +
                "       t.container_id,e.id as event_id, e.type as event_type, e.message as event_message, e.start_time as event_start_time, t.start_time as task_start_time, t.end_time as task_end_time " +
                "FROM Events e " +
                "LEFT JOIN  Tasks t " +
                "ON e.task_id = t.id " +
                "JOIN Intervals i " +
                "ON t.interval_id = i.id " +
                "JOIN Timelines tl " +
                "ON i.timeline_id = tl.id " +
                "WHERE tl.id = ? " +
                "AND tl.simulation_id = ? " +
                "AND t.start_time <= ? " +
                "AND t.end_time >= ? " +
                "ORDER BY e.start_time, t.start_time", [timelineId, simId, end_time, end_time], "Getting tasks", true
            );
        }).then(response => {

            db.commit();
            let end_time = event.body.time_stamp;

            let tasks = {};
            response.forEach(event => {

                if (typeof tasks[event.task_id] === 'undefined') {

                    tasks[event.task_id] = {
                        id: event.task_id,
                        type: event.task_type,
                        extra: {
                            destination_id: event.destination_id,
                            source_id: event.source_id,
                            container_id: event.container_id
                        },
                        description: event.task_description,
                        status: event.task_status,
                        events: [],
                        start_time: event.task_start_time,
                        end_time: event.task_end_time
                    };
                }
                tasks[event.task_id].events.push({
                    id: event.event_id,
                    type: event.event_type,
                    message: event.event_message,
                    time_stamp: event.event_start_time
                });
            });

            let taskArray = []
            for (let i in tasks) {
                taskArray.push(tasks[i]);
            }

            lhelper.done({
                    statusCode: 200,
                    body: { acknowledged: end_time, tasks: taskArray }
                },
                true);
            return;
        })
        .catch(error => {
            db.rollback();
            lhelper.done(error);
            context.done();
            return;
        });


}