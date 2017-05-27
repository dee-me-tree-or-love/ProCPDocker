'use strict';
const LambaHelper = require('basic-lambda-helper');
const ContainerFactory = require('container-factory');
const HarborValidator = require('harbor-validator');
const HarborBuilder = require('harbor-builder');
const DBHelper = require('db-helper');
const S3 = require('aws-sdk').S3;

const uuid = require('uuid');
const random = require('random-js')();

// submit new simulation
// 
// https:// github.com/dee-me-tree-or-love/ProCPDocker/blob/d3fb722f4d47c18c35077779a6b08addcd7c26fa/proto/Backend/API_DOCUMENATION.md#new-simulation
module.exports.handler = (event, context, callback) => {

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

    const original_conf = JSON.stringify(config);
    // Construct Harbor
    console.log('Construct Harbor');
    config = HarborBuilder.constructHarbor(config).entities;

    let totalContainersForSim = 0;
    let totalCapacity = 0;
    let movingContainers = 0;

    // Calculate container capacity for storages
    console.log('Calculate container capacity for storages');
    config.storages.forEach(storage => {

        let total = storage.x * storage.y * storage.z;
        let filled = Math.ceil(total * storage.filled / 100);

        totalCapacity += total;
        movingContainers += filled;
        totalContainersForSim += filled;

        delete storage.filled;
        storage.containers_max = total;
        storage.containers_to_fill = filled;
        storage.containers_current = 0;
    });

    // Calculate containers for ships
    console.log('Calculate containers for ships');
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

        ship.containers_max = total;
        ship.containers_current = filled;
        ship.containers_load = load;
        ship.containers_unload = unload;
    });

    // Capacity validation
    console.log('Capacity validation');
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

    // Distribute containers
    console.log('Distribute containers');
    let all_containers = [];
    let containers_to_storage = [];
    config.ships.forEach(ship => {

        ship.containers_current = ContainerFactory.create(ship.containers_current, ship.id);
        ship.containers_unload = ship.containers_current.slice(0, ship.containers_unload);
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

                    // Remove the filled storage from the possibilities
                    freeStorages.splice(storage_index, 1);
                }
            } while (!isPlaced);
        });
    });

    // Distribute containers "TO LOAD" from ships to storages
    console.log('Distribute containers "TO LOAD" from ships to storages');
    let per_storage = {};
    containers_to_storage.forEach(container => {

        let address = container.address.location_id;
        if (typeof per_storage[address] === 'undefined') {

            per_storage[address] = [];
        }
        per_storage[address].push(container);
    });

    // Fill up storages to capacity
    console.log('Fill up storages to capacity');
    config.storages.forEach(storage => {

        // Add containers to load from ships
        storage.containers_current = per_storage[storage.id];

        if (typeof storage.containers_current === 'undefined') {

            storage.containers_current = [];
        }
        // Fill to desired capacity
        let to_fill = storage.containers_to_fill - storage.containers_current.length;
        if (to_fill > 0) {

            let containers = ContainerFactory.create(to_fill, storage.id);
            storage.containers_current = storage.containers_current.concat(containers);
            all_containers = all_containers.concat(containers);
        }

        delete storage.containers_to_fill;
    });

    // Persist entities in DB
    console.log('Persist entities in DB');
    const connection = DBHelper.getConnection();

    const timeline_id = uuid();
    const simulation_id = uuid();
    const current_time = new Date().getTime().toString();
    config.timelines = [];
    config.timelines.push({
        id: timeline_id,
        name: "default_timeline",
        time_zero: current_time,
        simulation_id: simulation_id
    });

    config.simulation = {
        id: simulation_id,
        configuration_url: `https://s3.eu-central-1.amazonaws.com/docker-simulations/${simulation_id}.json`,
        date_created: current_time,
        current_timeline: timeline_id,
        current_time
    };
    connection.connect();
    const runQuery = (query, params, message) => {

        return new Promise((resolve, reject) => {

            console.log(`${message}: PENDING`);
            connection.query(query, params, (error, results, fields) => {
                if (error) {

                    console.log(`${message}: FAIL`);
                    reject(error);
                } else {

                    console.log(`${message}: OK`);
                    resolve(results);
                }
            });
        });
    };

    new Promise((resolve, reject) => {
        // Begin transaction
        connection.beginTransaction(function (err) {
            if (err) {

                reject(err);
            } else {

                resolve();
            }
        });
    })
        .then(() => {
            return new Promise((resolve, reject) => {
                // Begin transaction
                connection.beginTransaction(function (err) {
                    if (err) {

                        reject(err);
                    } else {

                        resolve();
                    }
                });
            })
        })
        // Create simulation
        .then(() => {

            return runQuery('INSERT INTO Simulations SET ? ', config.simulation, 'Creating Simulation');
        })
        // Create timeline
        .then(() => {

            return runQuery('INSERT INTO Timelines SET ?', config.timelines, 'Creating Timeline');
        })
        // Create storages
        .then(() => {

            let storages = [];
            const addStorage = (id, x, y, z, type) => {
                storages.push([id, x, y, z, type, timeline_id]);
            };
            config.storages.forEach(storage => {
                addStorage(storage.id, storage.x, storage.y, storage.z, 'storage');
            });
            config.ships.forEach(ship => {
                addStorage(ship.id, ship.x, ship.y, ship.z, 'ship');
            });
            config.docks.forEach(dock => {
                addStorage(dock.id, 0, 0, 0, 'dock');
            });
            return runQuery('INSERT INTO ContainerHold (id, x, y, z, type, timeline_id) VALUES ?', [storages], 'Creating Storages');
        })
        // Create docks
        .then(() => {

            console.log(`Creating Docks: PENDING`);
            let docks = [];
            config.docks.forEach(dock => {

                docks.push([
                    dock.id,
                    dock.number_loaders
                ]);
            });
            return runQuery('INSERT INTO Docks (id, loaders_count) VALUES ?', [docks], 'Creating Docks');
        })
        // Create containers
        .then(() => {

            for (let i = 0; i < all_containers.length; i++) {

                all_containers[i] = [
                    all_containers[i].id,
                    all_containers[i].address.location_id,
                    all_containers[i].cargo_type,
                    all_containers[i].weight,
                    all_containers[i].description,
                    all_containers[i].address.x,
                    all_containers[i].address.y,
                    all_containers[i].address.z,
                ];
            }
            return runQuery('INSERT INTO Containers (id, container_hold, cargo_type, weight, description, x, y, z) VALUES ?', [all_containers], 'Create containers');
        })
        // Create ships
        .then(() => {

            let ships = [];
            config.ships.forEach(ship => {
                ships.push([
                    ship.id,
                    ship.eta ? ship.eta : 0,
                    ship.etd ? ship.etd : 0
                ]);
            });
            return runQuery('INSERT INTO Ships (container_hold, eta, etd) VALUES ?', [ships], 'Creating Ships');
        })
        // Link ship containers
        .then(() => {

            let ship_containers = [];
            config.ships.forEach(ship => {
                ship.containers_current.forEach(container => {

                    ship_containers.push([container.id, 'onboard', container.address.location_id]);
                });
                ship.containers_load.forEach(container => {

                    ship_containers.push([container.id, 'to_load', ship.id]);
                });
                ship.containers_unload.forEach(container => {

                    ship_containers.push([container.id, 'to_unload', container.address.location_id]);
                });
            });
            return runQuery('INSERT INTO ShipContainer (container_id, type, ship_id) VALUES ?', [ship_containers], 'Link ship containers');
        })
        // Connect docks and storages
        .then(() => {

            let connections = [];
            config.docks.forEach(dock => {

                dock.connections.forEach(con => {

                    connections.push([
                        con.storage,
                        con.dock,
                        con.weight
                    ]);
                });
            });
            return runQuery('INSERT INTO StorageDock (storage_id, dock_id, weight) VALUES ?', [connections], ' Connect docks and storages');
        })
        // Commit
        .then(() => {
            return new Promise((resolve, reject) => {

                connection.commit((err) => {
                    if (err) {

                        reject(err);
                    } else {

                        resolve();
                    }
                });
            });
        })
        // Save configuration to S3
        .then(() => {
            return new Promise((resolve, reject) => {

                let params = {
                    Bucket: 'docker-simulations',
                    Key: `${config.simulation.id}.json`,
                    Body: original_conf
                };
                let s3 = new S3();
                s3.putObject(params, function (err, data) {
                    if (err) {

                        reject(err);
                    }
                    else {

                        lhelper.done({
                            statusCode: 200,
                            body: {
                                simulation_id: config.simulation.id,
                                timeline_id,
                                download_url: `https://s3.eu-central-1.amazonaws.com/docker-simulations/${config.simulation.id}.json`
                            }
                        },true);
                    }
                });
            });
        })
        // Handle errors
        .catch(error => {

            connection.rollback(function () {
                connection.end();
                lhelper.done({
                    statusCode: 400,
                    body: error
                },true);
            });
        });
};