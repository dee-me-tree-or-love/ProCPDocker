'use strict';

// get all available impact options
// /impact/options/all
// https://github.com/dee-me-tree-or-love/ProCPDocker/blob/develop/proto/Backend/API_DOCUMENATION.md#impactoptionsall

module.exports.getOptions = (events, context, callback) => {
    callback(null, {
        statusCode: 200,
        body: JSON.stringify({
            "actions": [{
                "name": "We are still thinking",
                "type": "More to come",
                "description": "We will provide the definition of the possible impacts with the properties below",
                "properties": [{
                        "name": "Property1",
                        "value": 123
                    },
                    {
                        "name": "Property2",
                        "value": "Could be a number as well"
                    },
                ]
            }]
        })
    });
}

// submit an impact to the server to alter reality
// 
// https://github.com/dee-me-tree-or-love/ProCPDocker/blob/develop/proto/Backend/API_DOCUMENATION.md#impactsimulation_idtimeline_idtime_stampcommit

module.exports.submitImpact = (events, context, callback) => {
    // should get params, but for now we just send a response back
    // no matter what actually was sent (even if nothing)
    callback(null, {
        statusCode: 201,
        body: JSON.stringify({
            "new_timeline_id": "tl67",
            "acknowledged_timestamp": 0,
            "next_time_stamp": 0,
            "tasks": [ /* At most 5 tasks */ {
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
            }],
        })
    })
}