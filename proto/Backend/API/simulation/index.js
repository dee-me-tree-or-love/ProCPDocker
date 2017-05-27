'use strict';


// get configuration of the simulation
//
// https://github.com/dee-me-tree-or-love/ProCPDocker/blob/d3fb722f4d47c18c35077779a6b08addcd7c26fa/proto/Backend/API_DOCUMENATION.md#simulationsimulation_idconfiguration

module.exports.getSimulationConfig = (event, context, callback) => {

    // TODO: validate if sim and timeline id are ok

    let simID = "";
    try {
        simID = event.pathParameters.simulation_id
    } catch (err) {
        callback(new Error('Couldn\'t find simulation.'));
    }

    // TODO: change to retrieval from DB
    // this is are the parameters that should be sent to the dynamoDB.get() method
    const params = {
        TableName: process.env.SIMULATION_TABLE,
        Key: {
            id: simID,
        },
    };

    if (simID === "sim1") {
        const response = {
            statusCode: 200,
            body: JSON.stringify({
                docks: [{
                    id: "1",
                    number_loaders: 2
                }],
                storages: [{
                    x: 2,
                    y: 2,
                    z: 2,
                    id: "s1",
                    filled: 40 /* % of total containers in storage*/
                }],
                ships: [{
                    id: "ship1",
                    eta: 6,
                    x: 1,
                    y: 3,
                    z: 3,
                    filled: 50,
                    /* % of total containers onboard*/
                    unload: 20,
                    /* % of total containers to unload */
                    load: 40 /* % of total containers to load */
                }]
            }),
            headers:{
                "Access-Control-Allow-Origin":"*"
            }
        };
        callback(null, response);
    } else {
        callback(new Error('Couldn\'t find simulation.'));
    }
}

// get the timelines of the simulation
//
// https://github.com/dee-me-tree-or-love/ProCPDocker/blob/d3fb722f4d47c18c35077779a6b08addcd7c26fa/proto/Backend/API_DOCUMENATION.md#simulationsimulation_idtimelines

module.exports.getSimulationHarborTimelines = (event, context, callback) => {

    // TODO: validate if sim and timeline id are ok

    let simID = "";
    try {
        simID = event.pathParameters.simulation_id
    } catch (err) {
        callback(new Error('Couldn\'t find simulation.'));
        return;
    }

    // TODO: change to retrieval from DB
    // this is are the parameters that should be sent to the dynamoDB.get() method
    const params = {
        TableName: process.env.SIMULATION_TABLE,
        Key: {
            id: simID,
        },
    };

    if (simID === "sim1") {
        const response = {
            statusCode: 200,
            body: JSON.stringify({
                timelines: [{
                    id: "tl1",
                    // I do not know what mock data to put here
                    time_created: "",
                    time_zero: "",
                    parent_timeline_id: "",
                },
                    {
                        id: "tl2",
                        // I do not know what mock data to put here
                        time_created: "",
                        time_zero: "",
                        parent_timeline_id: "tl1",
                    },
                    {
                        id: "tl3",
                        // I do not know what mock data to put here
                        time_created: "",
                        time_zero: "",
                        parent_timeline_id: "tl2",
                    },
                    {
                        id: "tl4",
                        // I do not know what mock data to put here
                        time_created: "",
                        time_zero: "",
                        parent_timeline_id: "tl1",
                    }
                ]
            }),
            headers:{
                "Access-Control-Allow-Origin":"*"
            }
        };
        callback(null, response);
    } else {
        callback(new Error('Couldn\'t find simulation.'));
    }
}

// get the harbor data about storages, docks and ships
//
// https://github.com/dee-me-tree-or-love/ProCPDocker/blob/d3fb722f4d47c18c35077779a6b08addcd7c26fa/proto/Backend/API_DOCUMENATION.md#simulationsimulation_idtimelinestimeline_id-docks--ships--storages-all

module.exports.getSimulationHarborData = (event, context, callback) => {
    let simID = "";
    let timelineID = "";
    let requestOption = "";

    // TODO: validate if sim and timeline id are ok
    // a little validation here

    try {
        simID = event.pathParameters.simulation_id;
        timelineID = event.pathParameters.timeline_id;
        requestOption = event.pathParameters.option;
        requestOption = requestOption.toLowerCase();

        if (requestOption !== "docks" && requestOption !== "storages" && requestOption !== "ships") {
            callback(new Error('Request option not recognized: make sure to ask for ships | docks | sotrages...'));
            // abort further processing
            return;
        }
    } catch (err) {
        callback(new Error('Incorrect data requested'));
        // abort further processing
        return;
    }


    // TODO: definitely change from switch to something normal...
    switch (requestOption) {
        case "docks":
        {
            const response = {
                statusCode: 200,
                body: JSON.stringify({
                    docks: [{
                        "id": "d1",
                        "loaders_count": 2,
                        "connected_storages": [{
                            "id": "st1",
                            "weight": 10
                        }],
                        "container_count": 10,
                        "connected_ship_id": "sh1",
                        "scheduled_ships": [{
                            "id": "sh1",
                            "time_arrived": 0
                        }]
                    },
                        // {
                        //     "id": "d2",
                        //     "loaders_count": 3,
                        //     "connected_storages": [{
                        //         "id": "st1",
                        //         "weight": 5
                        //     }],
                        //     "container_count": 45,
                        //     "connected_ship_id": "",
                        //     "scheduled_ships": []
                        // }
                    ]
                }),
                headers:{
                    "Access-Control-Allow-Origin":"*"
                }
            };
            callback(null, response);
            break;
        }

        case "storages":
        {
            const response = {
                statusCode: 200,
                body: JSON.stringify({
                    docks: [{
                        "id": "st1",
                        "size": {
                            "x": 40,
                            "y": 20,
                            "z": 10,
                        },
                        "containers_max": 8000,
                        "containers_current": 5055,
                        "connections": [{
                            "id": "d1",
                            "weight": 10
                        }],
                        "status": "operating" /* TODO: think of different option what can happen */
                    }]

                }),
                headers:{
                    "Access-Control-Allow-Origin":"*"
                }
            };
            callback(null, response);
            break;
        }

        case "ships":
        {
            const response = {
                statusCode: 200,
                body: JSON.stringify({
                    ships: [{
                        "id": "",
                        "size": {
                            "x": 10,
                            "y": 15,
                            "z": 4,
                        },
                        "containers_max": 600,
                        "containers_current": 67,
                        "containers_unload": 5,
                        "containers_load": 3,
                        "destination": {
                            "id": "d1",
                            "estimated_arrival_time": 0
                        },
                        "status": "" /* TODO: think of different option what can happen */
                    }]
                }),
                headers:{
                    "Access-Control-Allow-Origin":"*"
                }
            };
            callback(null, response);
            break;
        }
        default:
            callback(new Error("Something went wrong... Our apes are fixing it for you"));
    }

};