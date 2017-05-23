module.exports.countLoads = (ship) => {

    let loads = [];

    // count how many times each storage id appears as a  location id
    for (let i = 0; i < ship.containers_load.length; i++) {

        let storageId = ship.containers_load[i].address.location_id;
        if (loads[storageId] == undefined) {
            loads[storageId] = 1;
        } else {
            loads[storageId]++;
        }
    }
    return loads;
}


// Execution time: O(n) :D 
module.exports.sortShipsByETA = (ships) => {
    // counting sort way: 

    // since it's javascript we can omit finding the maximum and minimum sizes for the count helper
    // instead we can just create a new stuff as soon as we encounter something new: !counter[arr[i]]

    // used to count the number a certain value has appeared
    let ETAcounter = [];

    // count how many ships are scheduled to arrive at certain ETA
    for (let i = 0; i < ships.length; i++) {
        // if such ETA has not been counted yet
        if (!(ETAcounter[ships[i].eta])) {
            // initialize
            ETAcounter[ships[i].eta] = {};
            // add count
            ETAcounter[ships[i].eta].count = 1;
            // add reference to the first ship
            ETAcounter[ships[i].eta].ships = [ships[i]];
        } else {
            ETAcounter[ships[i].eta].count += 1;
            ETAcounter[ships[i].eta].ships.push(ships[i]);
        }
    }


    console.dir(ETAcounter); // .log() prints stringies of the objects, whereas .dir() returns a NAVIGATABLE tree (it's no use in the terminal thouh...)

    // // do the correct placing
    let shipOrder = []; // the arbitrary variable to keep the correct order of the ships

    // for all the defined keys in the ETACounter
    for (k in ETAcounter) { // in such case 'k's are the actual keys apparently...
        // while the still are ships in the 'slice'
        while (ETAcounter[k].count > 0) {
            // put the ship to a correct place
            shipOrder = shipOrder.concat(ETAcounter[k].ships.slice(ETAcounter[k].count - 1, ETAcounter[k].count))
            ETAcounter[k].count -= 1;
        }
    }

    // sorted stuff
    console.dir(shipOrder);

    console.log("sorted");
    // return the ships ordered by the ETA
    return shipOrder;
}

// uncomment
// for testing purposes
// this.sortShipsByETA([{ id: 1, eta: 3 }, { id: 2, eta: 3 }, { id: 3, eta: 3 }, { id: 4, eta: 0 }, { id: 5, eta: 2 }, { id: 6, eta: 9 }, ])


module.exports.produceTiming = (configs) => {
    // sort ships by ETA
    configs.ships = this.sortShipsByETA(configs.ships);


    // for each ship calculate the loads
    for (let i = 0; i < configs.ships.length; i++) {

        let ship = configs.ships[i];
        ship.loads = this.countLoads(ship);

        console.dir(ship);
    }
}


this.produceTiming({
    "docks": [{
        "id": "448d5677-029d-4879-abe6-b5f72da6fb9e",
        "number_loaders": 2,
        "connections": [{
                "vertices": {
                    "storage": "0bc1345c-6413-454d-aa2f-81ba96a7d14d",
                    "dock": "448d5677-029d-4879-abe6-b5f72da6fb9e"
                },
                "weight": 8
            },
            {
                "vertices": {
                    "storage": "942efffe-8595-4d83-a2a6-9803599ca06a",
                    "dock": "448d5677-029d-4879-abe6-b5f72da6fb9e"
                },
                "weight": 15
            }
        ]
    }],
    "storages": [{
            "x": 5,
            "y": 2,
            "z": 1,
            "id": "0bc1345c-6413-454d-aa2f-81ba96a7d14d",
            "connections": [{
                "vertices": {
                    "storage": "0bc1345c-6413-454d-aa2f-81ba96a7d14d",
                    "dock": "448d5677-029d-4879-abe6-b5f72da6fb9e"
                },
                "weight": 8
            }],
            "containers_max": 10,
            "containers_current": [{
                "id": "1458f8c5-6ebf-4945-8e6c-0b17e77aeb77",
                "descritpion": "",
                "address": {
                    "location_id": "0bc1345c-6413-454d-aa2f-81ba96a7d14d",
                    "x": 0,
                    "y": 0,
                    "z": 0
                },
                "weight": 3372,
                "cargo_type": "type2",
                "type": "container"
            }]
        },
        {
            "x": 5,
            "y": 2,
            "z": 1,
            "id": "942efffe-8595-4d83-a2a6-9803599ca06a",
            "connections": [{
                "vertices": {
                    "storage": "942efffe-8595-4d83-a2a6-9803599ca06a",
                    "dock": "448d5677-029d-4879-abe6-b5f72da6fb9e"
                },
                "weight": 15
            }],
            "containers_max": 10,
            "containers_current": [{
                    "id": "ac63aca4-0990-4066-9cce-a1605acea890",
                    "descritpion": "",
                    "address": {
                        "location_id": "942efffe-8595-4d83-a2a6-9803599ca06a",
                        "x": 0,
                        "y": 0,
                        "z": 0
                    },
                    "weight": 13570,
                    "cargo_type": "type2",
                    "type": "container"
                },
                {
                    "id": "dc00f67d-2fb8-4b80-b279-3282b0c3e3f9",
                    "descritpion": "",
                    "address": {
                        "location_id": "942efffe-8595-4d83-a2a6-9803599ca06a",
                        "x": 0,
                        "y": 0,
                        "z": 0
                    },
                    "weight": 24948,
                    "cargo_type": "type2",
                    "type": "container"
                },
                {
                    "id": "f6ef103e-c058-42c4-bfa6-3d8bef0f06fa",
                    "descritpion": "",
                    "address": {
                        "location_id": "942efffe-8595-4d83-a2a6-9803599ca06a",
                        "x": 0,
                        "y": 0,
                        "z": 0
                    },
                    "weight": 26840,
                    "cargo_type": "type2",
                    "type": "container"
                },
                {
                    "id": "36f93d4d-08d4-4449-b2a8-2b72ef6d95d8",
                    "descritpion": "",
                    "address": {
                        "location_id": "",
                        "x": 0,
                        "y": 0,
                        "z": 0
                    },
                    "weight": 26141,
                    "cargo_type": "type2",
                    "type": "container"
                },
                {
                    "id": "de07d923-878a-4ad0-b660-73d077ce1254",
                    "descritpion": "",
                    "address": {
                        "location_id": "",
                        "x": 0,
                        "y": 0,
                        "z": 0
                    },
                    "weight": 15232,
                    "cargo_type": "type2",
                    "type": "container"
                },
                {
                    "id": "35d69825-0023-4bf3-b7ef-345a5a12e380",
                    "descritpion": "",
                    "address": {
                        "location_id": "",
                        "x": 0,
                        "y": 0,
                        "z": 0
                    },
                    "weight": 3661,
                    "cargo_type": "type1",
                    "type": "container"
                },
                {
                    "id": "b001a8f8-07b3-4e1b-b564-221647cd1a53",
                    "descritpion": "",
                    "address": {
                        "location_id": "",
                        "x": 0,
                        "y": 0,
                        "z": 0
                    },
                    "weight": 20316,
                    "cargo_type": "type1",
                    "type": "container"
                },
                {
                    "id": "e19dfb70-8d42-4114-a442-29080074d7ba",
                    "descritpion": "",
                    "address": {
                        "location_id": "",
                        "x": 0,
                        "y": 0,
                        "z": 0
                    },
                    "weight": 30492,
                    "cargo_type": "type3",
                    "type": "container"
                }
            ]
        }
    ],
    "ships": [{
            "id": "522e1048-629b-4147-906d-1d26b8c282f6",
            "eta": 6,
            "x": 1,
            "y": 2,
            "z": 2,
            "containers_max": 4,
            "containers_current": [],
            "containers_load": [{
                    "id": "1458f8c5-6ebf-4945-8e6c-0b17e77aeb77",
                    "descritpion": "",
                    "address": {
                        "location_id": "0bc1345c-6413-454d-aa2f-81ba96a7d14d",
                        "x": 0,
                        "y": 0,
                        "z": 0
                    },
                    "weight": 3372,
                    "cargo_type": "type2",
                    "type": "container"
                },
                {
                    "id": "ac63aca4-0990-4066-9cce-a1605acea890",
                    "descritpion": "",
                    "address": {
                        "location_id": "942efffe-8595-4d83-a2a6-9803599ca06a",
                        "x": 0,
                        "y": 0,
                        "z": 0
                    },
                    "weight": 13570,
                    "cargo_type": "type2",
                    "type": "container"
                },
                {
                    "id": "dc00f67d-2fb8-4b80-b279-3282b0c3e3f9",
                    "descritpion": "",
                    "address": {
                        "location_id": "942efffe-8595-4d83-a2a6-9803599ca06a",
                        "x": 0,
                        "y": 0,
                        "z": 0
                    },
                    "weight": 24948,
                    "cargo_type": "type2",
                    "type": "container"
                },
                {
                    "id": "f6ef103e-c058-42c4-bfa6-3d8bef0f06fa",
                    "descritpion": "",
                    "address": {
                        "location_id": "942efffe-8595-4d83-a2a6-9803599ca06a",
                        "x": 0,
                        "y": 0,
                        "z": 0
                    },
                    "weight": 26840,
                    "cargo_type": "type2",
                    "type": "container"
                }
            ],
            "containers_unload": []
        },
        {
            "id": "12321048-629b-4147-906d-1d26b8c282f6",
            "eta": 2,
            "x": 1,
            "y": 2,
            "z": 2,
            "containers_max": 4,
            "containers_current": [],
            "containers_load": [],
            "containers_unload": []
        },
        {
            "id": "82321048-629c-4147-906d-1d26b8c282f6",
            "eta": 0,
            "x": 1,
            "y": 2,
            "z": 2,
            "containers_max": 4,
            "containers_current": [],
            "containers_load": [],
            "containers_unload": []
        },
        {
            "id": "AA321048-629b-4147-906d-1d26b8c282f6",
            "eta": 6,
            "x": 1,
            "y": 2,
            "z": 2,
            "containers_max": 4,
            "containers_current": [],
            "containers_load": [],
            "containers_unload": []
        }
    ],
    "simulation_id": "98db10d3-db5d-4568-a1ca-ffc0fc9d4b02",
    "all": 9
});