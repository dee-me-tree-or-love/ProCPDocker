'use strict';

// TODO: do the custom error reporting

// get tasks
//
// https://github.com/dee-me-tree-or-love/ProCPDocker/blob/d3fb722f4d47c18c35077779a6b08addcd7c26fa/proto/Backend/API_DOCUMENATION.md#taskssimulation_idtimeline_id

module.exports.getTasks = (event, context, callback) => {
    let simID = "";
    let timelineID = "";

    try {
        simID = event.pathParameters.simulation_id;
        timelineID = event.pathParameters.timeline_id;
    } catch (err) {
        callback(new Error('Incorrect data requested'));
        // abort further processing
        return;
    }

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
}