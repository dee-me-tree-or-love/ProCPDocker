'use strict';
const LambaHelper = require('basic-lambda-helper');
const ContainerFactory = require('./Container').ContainerFactory;
const uuid = require('uuid');
const HarborValidator = require('harbor-validator');
const HarborBuilder = require('harbor-builder');
// submit new simulation
//
// https://github.com/dee-me-tree-or-love/ProCPDocker/blob/d3fb722f4d47c18c35077779a6b08addcd7c26fa/proto/Backend/API_DOCUMENATION.md#new-simulation
module.exports.newSimulation = (event, context, callback) => {

    let lhelper = new LambaHelper(event, context, callback);
    try {
        event.body = JSON.parse(event.body);
    } catch (e) {

        lhelper.done({
            statusCode: 400,
            body: {
                message: "Malformed JSON. Please check for syntax errors"
            }
        });
        return;
    }
    let config = event.body;

    let errors = HarborValidator.verifyConfiguration(config);
    if (errors.length > 0) {
        lhelper.done({
            statusCode: 400,
            body: errors
        });
        return;
    }

    // construct connections between the harbor instances: 
    // !!_IMPORTANT_!! 
    // the code line modifies the configs by adding the connections!
    HarborBuilder.constructHarbor(configs);

    let nrContainers = 0;
    let totalCapacity = 0;
    let movingContainers = 0;

    //Calculate containers
    config.docks.forEach(dock => {

        dock.id = uuid();
    });

    config.storages.forEach(storage => {

        let total = storage.x * storage.y * storage.z;
        let filled = Math.ceil(total * storage.filled / 100);

        totalCapacity += total;
        movingContainers += filled;
        nrContainers += filled;

        delete storage.filled;
        storage.id = uuid();
        storage.containers_max = total;
        storage.containers_current = filled;
    });

    config.ships.forEach(ship => {

        let total = ship.x * ship.y * ship.z;
        let load = Math.ceil(total * ship.load / 100);
        let unload = Math.ceil(total * ship.unload / 100);
        let filled = Math.ceil(total * ship.filled / 100);

        nrContainers += filled;
        nrContainers += load;

        movingContainers += load;
        movingContainers -= unload;

        delete ship.filled;
        delete ship.unload;
        delete ship.load;

        ship.id = uuid();
        ship.containers_max = total;
        ship.containers_current = filled;
        ship.containers_load = load;
        ship.containers_unload = unload;
    });

    if (movingContainers > totalCapacity) {

        lhelper.done({
            statusCode: 400,
            body: {
                message: "Too many containers. Please decrease the requested containers or increase storage capacity.",
                movingContainers,
                totalCapacity
            }
        }, true);
    }

    //Distribute containers

    config.ships.forEach(ship => {

        let containers = ContainerFactory.create(ship.containers_current);
        containers.forEach(container => {

            container.address.location_id = ship.id;
        });
        ship.containers_current = containers;
        ship.containers_unload = containers.slice(0, ship.containers_unload);
        ship.containers_load = ContainerFactory.create(ship.containers_load);

        //TODO:
        // loop trough the containers_load
        // pick a random storage
        // check if we can fit a container
        // put the container
        // if we don't have space in all the storages, throw an error

    });


    config.storages.forEach(storage => {

        //TODO:
        // fill up to capacity
        let containers = ContainerFactory.create(storage.containers_current);
        containers.forEach(container => {

            container.address.location_id = storage.id;
        });
        storage.containers_current = containers;
    });
    //TODO:
    // Put all entity instances in a queue to insert in the DB

    //TODO:
    // Find where to dock, according to where the nearest storage is with the most containers
    // Sum containers in storage to get and multiply by the weighted edge to the dock and then find the average
    // Dock the ship to the dock with the smallest average distance to the storage and the ETA
    // Generate tasks according to the distance from dock to storage
    //      Write algorithm to correctly place the containers on the ship
    //      Maybe consider the containers which are already on the ship and rearrange them, maybe
    // Put all events in a FIFO queue and insert in DB in order

    //calculate containers
    config.simulation_id = uuid();

    lhelper.done({
        statusCode: 200,
        body: config
    });

};

// get simulation data function
//
// https: //github.com/dee-me-tree-or-love/ProCPDocker/blob/d3fb722f4d47c18c35077779a6b08addcd7c26fa/proto/Backend/API_DOCUMENATION.md#simulationsimulation_id

module.exports.getSimulation = (event, context, callback) => {

    // TODO: validate if sim and timeline id are ok

    let simID = event.pathParameters.simulation_id

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
                id: simID,
                date_created: "2017-05-13T07:22Z",
                current_time: 0,
                current_timeline_id: "tl1",
                scope: {
                    requested: "Yes, you can send a request body with GET but it should not have any meaning. -- see: http://stackoverflow.com/questions/978061/http-get-with-request-body",
                },
            }),
        };
        callback(null, response);
    } else {
        callback(new Error('Couldn\'t fetch simulation.'));
    }
}

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
                };
                callback(null, response);
                break;
            }
        default:
            callback(new Error("Something went wrong... Our apes are fixing it for you"));
    }

};