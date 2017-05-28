'use strict';
const LambdaHelper = require('basic-lambda-helper');
const DBHelper = require('db-helper').DBHelper;
const ChangeProcessor = require('change-proccessor');

module.exports.handler = (event, context, callback) => {

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


    lhelper.checkInputBody(["simulation_id", "timeline_id", "time_stamp", "return_tasks"]).then(() => {

            console.log("checked");
            let simId = event.body.simulation_id;
            let timelineId = event.body.timeline_id;
            let end_time = event.body.time_stamp;

            console.log("about to sync");
            // TODO: make sync work with the timelines
            return ChangeProcessor.Sync(simId, end_time);
        })
        .then(res => {
            console.log(res);
            let ret_tasks = event.body.return_tasks;
            let end_time = event.body.time_stamp;
            let timelineId = event.body.timeline_id;

            console.log("finished promise");
            if (res.result) {
                console.log(lhelper);


                let body = { acknowledged: end_time };
                if (ret_tasks) {


                    // getting the data from the database

                    const db = new DBHelper();
                    db.start().then(() => {

                        return db.runQuery(
                            "SELECT t.id as task_id, t.type as task_type, t.description as task_description, t.status as task_status, source_id, destination_id, " +
                            "       t.container_id,e.id as event_id, e.type as event_type, e.message as event_message, e.start_time as event_start_time, t.end_time as task_end_time " +
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
                            "ORDER BY e.start_time, t.start_time", [timelineId, sim_id, end_time, end_time], "Getting tasks", true
                        );
                    }).then(response => {

                        db.commit();

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
                    });

                    let taskArr = [];
                    for (let task in tasks) taskArr.push(tasks[task]);
                    body.tasks = taskArr;
                }

                lhelper.done({
                    statusCode: 200,
                    body: body
                }, true);
                context.done();

                return;
            } else {

                console.log("got an error");
                throw { message: "Something went wrong while with the syncronization" }
            }
        })
        .catch(error => {

            lhelper.done(error);
            context.done();
            return;
        });


}