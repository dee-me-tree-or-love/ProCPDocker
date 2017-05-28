'use strict';
const DBHelper = require('db-helper').DBHelper;
const LambdaHelper = require('basic-lambda-helper');

module.exports.handler = (event, context, callback) => {

    const lhelper = new LambdaHelper(event, context, callback);
    const db = new DBHelper();

    let sim_id = "";
    let timeline_id = "";
    let limit = event.queryStringParameters.simulation_id | 10;
    let time_stamp = event.queryStringParameters.simulation_id | 0;

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

    lhelper.done({
        statusCode: 200,
        body: {
            time_stamp,
            timeline_id,
            sim_id,
            limit
        }
    }, true);
    return;

    const response = {
        statusCode: 200,
        body: JSON.stringify({
            "tasks": [{
                "id": "ffgsdf121dh123esd234s",
                "type": "",
                /* TODO: Think of types */
                "extra": {},
                "description": "",
                "status": "",
                "time_to_complete": 0,
                "events": [{
                    "id": "",
                    "type": "",
                    /* TODO: Think of types */
                    "message": "",
                    "time_stamp": 0
                }]
            },
                {
                    "id": "fggsdf121ar123esd234s",
                    "type": "",
                    /* TODO: Think of types */
                    "extra": {},
                    "description": "",
                    "status": "",
                    "time_to_complete": 0,
                    "events": [{
                        "id": "",
                        "type": "",
                        /* TODO: Think of types */
                        "message": "",
                        "time_stamp": 0
                    }]
                },
                {
                    "id": "ffgsdf121ar123esd234s",
                    "type": "",
                    /* TODO: Think of types */
                    "extra": {},
                    "description": "",
                    "status": "",
                    "time_to_complete": 0,
                    "events": [{
                        "id": "",
                        "type": "",
                        /* TODO: Think of types */
                        "message": "",
                        "time_stamp": 0
                    }]
                }
            ],
            "next_time_stamp": 10
        })
    }
    callback(null, response);
};