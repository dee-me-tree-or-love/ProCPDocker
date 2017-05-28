'use strict';
const DBHelper = require('db-helper').DBHelper;
const LambdaHelper = require('basic-lambda-helper');

module.exports.handler = (event, context, callback) => {

    const lhelper = new LambdaHelper(event, context, callback);
    const db = new DBHelper();

    let sim_id
    try {
        sim_id = event.pathParameters.simulation_id;
    } catch (err) {
        lhelper.done({
            statusCode: 400,
            body: {
                message: "Missing simulaiton_id"
            }
        }, true);
        return;
    }

    db.start()
        .then(() => {

            return db.runQuery("SELECT T.* FROM Timelines as T WHERE T.simulation_id = ?;", [sim_id], "getting timelines", true);
        })
        .then(timelines => {

            db.commit();

            console.log(timelines);

            if (timelines.length >= 1) {
                timelines = timelines.map((tl) => {
                    return {
                        id: tl.id,
                        // TODO: change timelines time created from timestamp to integer in the database
                        time_created: tl.time_zero,
                        time_zero: tl.time_zero,
                        parent_timeline_id: tl.parent,
                    }
                });

                // TODO: consider pagination, but it's unlikely to be needed
                lhelper.done({
                    statusCode: 200,
                    body: {
                        timelines,
                    }
                });
                return;

            } else {

                lhelper.done({
                    statusCode: 200,
                    body: {
                        timelines,
                    }
                });
                return;
            }
        })
        .catch(error => {

            db.rollback();
            // something messed up happened
            console.log(error);
            lhelper.done({
                statusCode: 400,
                body: {
                    error,
                    limit,
                    time_stamp
                }
            }, true);
            return
        })


}