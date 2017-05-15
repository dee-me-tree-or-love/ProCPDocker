'use strict';

// get general info about a storage
//
// https://github.com/dee-me-tree-or-love/ProCPDocker/blob/develop/proto/Backend/API_DOCUMENATION.md#storagesimulation_idtimeline_idstorage_id

module.exports.getContainer = (event, context, callback) => {

    let simID = "";
    let timelineID = "";
    let containerID = "";

    try {
        simID = event.pathParameters.simulation_id;
        timelineID = event.pathParameters.timeline_id;
        containerID = event.pathParameters.containerID;
    } catch (err) {
        callback(new Error('Incorrect data requested'));
        // abort further processing
        return;
    }



    const response = {
        statusCode: 200,
        body: JSON.stringify({
            "id": containerID,
            "descritpion": "I am a dummy container",
            "address": {
                "location_id": "st1",
                /* TODO: change later? */
                "x": 123,
                "y": 222,
                "z": 31
            },
            "weight": 0,
            "cargo_type": "Bullshit" /* TODO: think of types */
        }),
    }
    callback(null, response);

}