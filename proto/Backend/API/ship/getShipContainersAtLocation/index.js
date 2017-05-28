'use strict';
const DBHelper = require('db-helper').DBHelper;
const LambdaHelper = require('basic-lambda-helper');
// get container info about a ship

module.exports.handler = (event, context, callback) => {

    const lhelper = new LambdaHelper(event, context, callback);
    const db = new DBHelper();



    let sim_id, timeline_id, ship_id;
    try {
        sim_id = event.pathParameters.simulation_id;
        timeline_id = event.pathParameters.timeline_id;
        ship_id = event.pathParameters.ship_id;
    } catch (err) {
        lhelper.done({
            statusCode: 400,
            body: {
                message: "Missing simulaiton_id or timeline_id or ship_id"
            }
        }, true);
        return;
    }


    db.start()
        .then(() => {
            // make query
        })
        .then(result => {
            // process response
        })
        .catch(err => {
            // handle problems
            db.connection.destroy();
        })

}