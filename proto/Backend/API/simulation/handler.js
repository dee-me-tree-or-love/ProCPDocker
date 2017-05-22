/*
By testing with the same config data, the function sometimes works and sometimes does not - I do not know what is the reason for its behavior
so the data I pass: 

{
    "docks": [
        {
            "id": "1",
            "number_loaders": 2
        }
    ],
    "storages": [
        {
            "x": 5,
            "y": 2,
            "z": 1,
            "id": "s1",
            "filled": 10
        },
        {
            "x": 5,
            "y": 2,
            "z": 1,
            "id": "s1",
            "filled": 80
        }
    ],
    "ships": [
        {
            "id": "ship1",
            "eta": 6,
            "x": 1,
            "y": 2,
            "z": 2,
            "filled": 80,
            "unload": 60,
            "load": 40
        }
    ]
}

the result I get is either of the two: 
a) 
{
  "docks": [
    {
      "id": "7c3f704a-28ff-4005-a703-72135cf39bea",
    ...
        }
      ]
    }
  ],
  "storages": [
    {
      "x": 5,
    ...
      ]
    }
  ],
  "ships": [
    {
      "id": "3bdc2335-1ef3-46e4-9cdf-5ad22c05f35d",
      "eta": 6,
      "x": 1,
      "y": 2,
     ...
        }
      ]
    }
  ],
  "simulation_id": "2362f43b-280f-48ad-b581-dc903ee0f7f3",
  "all": 13
}


*/






'use strict';
const LambaHelper = require('basic-lambda-helper');
const ContainerFactory = require('./Container').ContainerFactory;
const HarborValidator = require('harbor-validator');
const HarborBuilder = require('harbor-builder');
const SQS = require('aws-sdk').SQS;

const uuid = require('uuid');
const random = require('random-js')();

const SQS_URL = "https://sqs.eu-central-1.amazonaws.com/277346611766/entities";
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
    // returns the new structure with uuids and connections as entities, and connections as global edges
    config = HarborBuilder.constructHarbor(config).entities;

    let totalContainersForSim = 0;
    let totalCapacity = 0;
    let movingContainers = 0;

    // UUIDs are assigned in .constructHarbor(config)
    // //Calculate containers
    // config.docks.forEach(dock => {

    //     dock.id = uuid();
    // });

    // Calculate container capacity for storages
    config.storages.forEach(storage => {

        let total = storage.x * storage.y * storage.z;
        let filled = Math.ceil(total * storage.filled / 100);

        totalCapacity += total;
        movingContainers += filled;
        totalContainersForSim += filled;

        delete storage.filled;
        // storage.id = uuid();
        storage.containers_max = total;
        storage.containers_to_fill = filled;
        storage.containers_current = 0;
    });

    // Calculate containers for ships
    config.ships.forEach(ship => {

        let total = ship.x * ship.y * ship.z;
        let load = Math.ceil(total * ship.load / 100);
        let unload = Math.ceil(total * ship.unload / 100);
        let filled = Math.ceil(total * ship.filled / 100);

        totalContainersForSim += filled;
        totalContainersForSim += load;

        movingContainers += unload;

        delete ship.filled;
        delete ship.unload;
        delete ship.load;

        // ship.id = uuid();
        ship.containers_max = total;
        ship.containers_current = filled;
        ship.containers_load = load;
        ship.containers_unload = unload;
    });

    // Capacity validation
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

    let all_containers = [];
    //Distribute containers
    let containers_to_storage = [];
    config.ships.forEach(ship => {

        let containers = ContainerFactory.create(ship.containers_current);
        containers.forEach(container => {

            container.address.location_id = ship.id;
        });
        ship.containers_current = containers;
        ship.containers_unload = containers.slice(0, ship.containers_unload);
        ship.containers_load = ContainerFactory.create(ship.containers_load);

        all_containers = all_containers.concat(ship.containers_current);
        all_containers = all_containers.concat(ship.containers_load);

        let freeStorages = config.storages.slice();
        ship.containers_load.forEach(container => {

            let isPlaced = false;
            do {

                // Check if there are available storages
                if (freeStorages.length === 0) {

                    lhelper.done({
                        statusCode: 400,
                        body: {
                            message: "There are no free storages left for the containers to load to ships. " +
                                "Increase storage capacity. " +
                                "All containers \"TO LOAD\" should already be on the port and part of the filled storages"
                        }
                    });
                    return;
                }

                // Pick random storage
                let storage_index = random.integer(0, freeStorages.length - 1);
                let storage = freeStorages[storage_index];

                // Check if there is space for one more container
                if (storage.containers_to_fill > storage.containers_current) {

                    container.address.location_id = storage.id;
                    containers_to_storage.push(container);

                    storage.containers_current++;
                    isPlaced = true;
                } else {

                    //Remove the filled storage from the possibilities
                    freeStorages.splice(storage_index, 1);
                }
            } while (!isPlaced);
        });

        //TODO:
        // loop trough the containers_load
        // pick a random storage
        // check if we can fit a container
        // put the container
        // if we don't have space in all the storages, throw an error

    });

    //Distribute containers "TO LOAD" from ships to storages
    let per_storage = {};
    containers_to_storage.forEach(container => {

        let address = container.address.location_id;
        if (typeof per_storage[address] === 'undefined') {

            per_storage[address] = [];
        }
        per_storage[address].push(container);
    });

    //Fill up storages to capacity
    config.storages.forEach(storage => {

        // Add containers to load from ships
        storage.containers_current = per_storage[storage.id];

        // Fill to desired capacity
        let to_fill = storage.containers_to_fill - storage.containers_current.length;
        if (to_fill > 0) {

            let containers = ContainerFactory.create(to_fill);
            storage.containers_current = storage.containers_current.concat(containers);
            all_containers = all_containers.concat(containers);
        }

        delete storage.containers_to_fill;
    });

    let saveEntities = (entities) => {
        return new Promise((resolve, reject) => {

            let Entries = [];
            entities.forEach(entity => {
                Entries.push({
                    Id: entity.id,
                    MessageBody: JSON.stringify(entities[i])
                });
            });
            let sqs = new SQS();
            sqs.sendMessageBatch({
                Entries,
                QueueUrl: SQS_URL
            }, function(err, data) {
                if (err) {

                    reject(err);
                } else {

                    resolve(data);
                }
            });
        });
    };

    all_containers.forEach(container => {
        container.type = 'container';
    });

    // saveEntities(all_containers)
    //     .then(d => {
    //         lhelper.done({
    //             statusCode: 200,
    //             body: {
    //                 d,
    //                 all_containers
    //             }
    //         });
    //     })
    //     .catch(e => {
    //         lhelper.done({
    //             statusCode: 400,
    //             body: {
    //                 e,
    //                 all_containers
    //             }
    //         });
    //     });

    // containers X
    // ships
    // docks
    // storages
    // time line
    // simulation


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
    config.all = all_containers.length;

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
};

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
};

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
};

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