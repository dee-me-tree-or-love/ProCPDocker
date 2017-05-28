'use strict';
const DBHelper = require('db-helper').DBHelper;
const LambdaHelper = require('basic-lambda-helper');
// get general info about a ship
//
// https://github.com/dee-me-tree-or-love/ProCPDocker/blob/develop/proto/Backend/API_DOCUMENATION.md#storagesimulation_idtimeline_idstorage_id

module.exports.handler = (event, context, callback) => {

    const lhelper = new LambdaHelper(event, context, callback);
    const db = new DBHelper();

    let sim_id, timeline_id, ship_id;
    try {
        sim_id = event.pathParameters.simulation_id;
        timeline_id = event.pathParameters.timeline_id;
        ship_id = event.pathParameters.ship_id;
    } catch (err) {
        lhelper.done({
            statusCode: 400,
            body: {
                message: "Missing simulaiton_id or timeline_id or ship_id"
            }
        }, true);
        return;
    }

    db.start()
        .then(() => {

            // CH.timeline_id as timeline_id, TL.simulation_id as simulation_id
            return db.runQuery(
                "SELECT CH.id as ship_id, CH.x as x, CH.y as y, CH.z as z, " +
                "(x * y * z) as container_max, " +
                "(SELECT COUNT(*) FROM Containers WHERE container_hold = CH.id ) as containers_current, " +
                "(SELECT COUNT(*) FROM ShipContainer WHERE ship_id = CH.id AND type=\"to_unload\") as containers_unload, " +
                "(SELECT COUNT(*) FROM ShipContainer WHERE ship_id = CH.id AND type=\"to_load\") as containers_load, " +
                "S.eta as ship_eta, " +
                "(SELECT D.id " +
                "FROM Docks AS D JOIN Tasks AS T ON T.destination_id = D.id JOIN " +
                "Intervals AS I ON I.id = T.interval_id WHERE T.type = \"schedule\" AND I.ship_id = CH.id " +
                "GROUP BY D.id) as destination_id " +
                "FROM Ships AS S JOIN ContainerHold as CH ON S.container_hold = CH.id " +
                "JOIN Timelines as TL ON TL.id = CH.timeline_id " +
                "WHERE TL.simulation_id = ? AND TL.id = ? AND CH.id = ?;", [sim_id, timeline_id, ship_id],
                "getting the ship information", true);
        })
        .then(response => {
            db.commit();
            console.log(`response: ${response}`);
            if (response.length == 1) {

                let ship = {
                    id: response[0].ship_id,
                    size: {
                        x: response[0].x,
                        y: response[0].y,
                        z: response[0].z,
                    },
                    containers_max: response[0].container_max,
                    containers_current: response[0].containers_current,
                    containers_unload: response[0].containers_unload,
                    containers_load: response[0].containers_load,
                    destination: {
                        id: response[0].destination_id,
                        estimated_arrival_time: response[0].ship_eta,
                    }
                }

                // succesful response
                lhelper.done({
                    statusCode: 200,
                    body: ship
                }, true)
                return;

            } else {

                // bad query
                lhelper.done({
                    statusCode: 400,
                    body: {
                        message: "Unexpected response size, check your request for correctness..."
                    }
                });
                return;
            }
        })
        .catch(error => {
            db.rollback();
            // something messed up happened
            console.log(error);
            lhelper.done({
                statusCode: 400,
                body: {
                    error,
                    limit,
                    time_stamp
                }
            }, true);
        })


}

/*

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
*/