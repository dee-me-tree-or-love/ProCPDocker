'use strict';

// sync to timestamp
//
// https://github.com/dee-me-tree-or-love/ProCPDocker/blob/d3fb722f4d47c18c35077779a6b08addcd7c26fa/proto/Backend/API_DOCUMENATION.md#syncsimulation_idtimeline_idtime_stamp

module.exports.handler = (event, context, callback) => {

    let params = JSON.parse(event.body);

    let simID = "";
    let timelineID = "";
    let timestamp = "";

    try {
        simID = params.simulation_id;
        timelineID = params.timeline_id;
        timestamp = params.timestamp;
    } catch (err) {
        callback(new Error('Incorrect data requested'));
        // abort further processing
        return;
    }
    // TODO: add parameters validation
    // TODO: add database integration
    let addTasks = false;
    let tasks = [];
    if (params.return_tasks != undefined) {
        addTasks = params.return_tasks;

        if (addTasks) {
            tasks = {
                "tasks": [{
                        "id": "ffgsdf121dr123esd234s",
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
                        "id": "fhjsdf121dr123esd234s",
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
                        "id": "ffgsdf127dr123esd234s",
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
                        "id": "ffgsdf121dr1n3esd234s",
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
                "next_time_stamp": 5,
            }
        }
    }

    // TODO: validate if sim and timeline id are ok

    const response = {
        statusCode: 200,
        body: JSON.stringify({
            "acknowledged": timestamp,
            "tasks": tasks,
        }),
    }
    callback(null, response);
}