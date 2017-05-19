'use strict';

// get general info about a ship
//
// https://github.com/dee-me-tree-or-love/ProCPDocker/blob/develop/proto/Backend/API_DOCUMENATION.md#storagesimulation_idtimeline_idstorage_id

module.exports.getShip = (event, context, callback) => {

    let simID = "";
    let timelineID = "";
    let shipID = "";

    try {
        simID = event.pathParameters.simulation_id;
        timelineID = event.pathParameters.timeline_id;
        shipID = event.pathParameters.ship_id;
    } catch (err) {
        callback(new Error('Incorrect data requested'));
        // abort further processing
        return;
    }



    const response = {
        statusCode: 200,
        body: JSON.stringify({
            "id": shipID,
            "size": {
                "x": 10,
                "y": 12,
                "z": 2,
            },
            "containers_max": 240,
            "containers_current": 100,
            "containers_unload": 20,
            "containers_load": 45,
            "destination": {
                "id": "d1",
                "estimated_arrival_time": 1
            },
            "status": "I AM A DUMMY SHIP"
        }),
    }
    callback(null, response);

}


// to make uid like stuff
let hashCode = (code) => {
    let hash = ""
    for (let i = 0; i < 5; i++) {
        hash = hash.concat(Math.floor(Math.random() * 10).toString(), code, i.toString());
    }
    let shuffelWord = (word) => {
        var shuffledWord = '';
        var charIndex = 0;
        word = word.split('');
        while (word.length > 0) {
            charIndex = word.length * Math.random() << 0;
            shuffledWord += word[charIndex];
            word.splice(charIndex, 1);
        }
        return shuffledWord;
    }
    return shuffelWord(hash);
};

// dummy container constructor
class Container {
    constructor(id, locationId) {
        this.id = hashCode(id);
        this.descritpion = "Lorem ipsum";
        this.address = {
            location_id: locationId,
            // that's bullshit ofcourse
            x: Math.floor(Math.random() * 1000),
            y: Math.floor(Math.random() * 1000),
            z: Math.floor(Math.random() * 1000),
        };
        this.weight = Math.floor(Math.random() * 100);
        this.cargo_type = "dummies";
    }
}


// get all the containers of the ship
//
// https://github.com/dee-me-tree-or-love/ProCPDocker/blob/develop/proto/Backend/API_DOCUMENATION.md#shipsimulation_idtimeline_idship_idcontainersall

module.exports.getShipContainersAll = (event, context, callback) => {
    let shipID = "";
    try {
        shipID = event.pathParameters.ship_id;
    } catch (err) {
        callback(new Error('Incorrect data requested'));
        // abort further processing
        return;
    }

    let containers_onboard = []
    for (let char in "abcdefghijklmnop") {
        containers_onboard.push(new Container(char, shipID));
    }

    let containers_unload = containers_onboard.splice(1, 5);

    let containers_load = []
    for (let char in "abcdefghijklmnop") {
        containers_load.push(new Container(char, "st1"));
    }

    const response = {
        statusCode: 200,
        body: JSON.stringify({
            ship_id: shipID,
            "containers_onboard": containers_onboard,
            "containers_load": containers_load,
            "containers_unload": containers_unload,
        })
    }
    callback(null, response);
}


// to get the containers linked to the ship: either onboard/toload/tounload 
//
// 

module.exports.getShipContainersOnLocation = (event, context, callback) => {
    let shipID = "";
    let locationReference = "";
    try {
        shipID = event.pathParameters.ship_id;
        locationReference = event.pathParameters.location;
        // oh god I can't believe I made a mistake here
        if (locationReference.toLowerCase() != "onboard" && locationReference.toLowerCase() != "load" && locationReference.toLowerCase() != "unload") {
            throw "bad request..."
        }
    } catch (err) {
        callback(null, {
            statusCode: 400,
            body: JSON.stringify({ message: "wrong request, be sure to ask for either onboard/load/unload containers " })
        });
        // abort further processing
        return;
    }
    let lID = shipID;
    if (locationReference == "load") {
        lID = "st1"
    }
    let c_Dummy = [];
    for (let char in "abcdefghijklmnop") {
        c_Dummy.push(new Container(char, lID));
    }

    callback(null, {
        statusCode: 200,
        body: JSON.stringify({ "containers": c_Dummy })
    });
}