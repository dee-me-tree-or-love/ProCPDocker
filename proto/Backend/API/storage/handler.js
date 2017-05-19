'use strict';

// get general info about a storage
//
// https://github.com/dee-me-tree-or-love/ProCPDocker/blob/develop/proto/Backend/API_DOCUMENATION.md#storagesimulation_idtimeline_idstorage_id

module.exports.getStorage = (event, context, callback) => {

    let simID = "";
    let timelineID = "";
    let storageID = "";

    try {
        simID = event.pathParameters.simulation_id;
        timelineID = event.pathParameters.timeline_id;
        storageID = event.pathParameters.storage_id;
    } catch (err) {
        callback(new Error('Incorrect data requested'));
        // abort further processing
        return;
    }


    if (storageID == "st1") {
        const response = {
            statusCode: 200,
            body: JSON.stringify({
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
            }),
        }
        callback(null, response);
    } else {
        const response = {
            statusCode: 404,
            body: JSON.stringify({
                message: "couldn't find the storage with given parameters"
            }),
        }
        callback(null, response);
    }
}

// to get the containers of the storage
//
// https://github.com/dee-me-tree-or-love/ProCPDocker/blob/develop/proto/Backend/API_DOCUMENATION.md#storagesimulation_idtimeline_idstorage_idcontainers

// really shitty implementation and I feel ashamed of this code, buuuut whatever works for mock it works

module.exports.getStorageContainers = (event, context, callback) => {
    let simID = "";
    let timelineID = "";
    let storageID = "";

    try {
        simID = event.pathParameters.simulation_id;
        timelineID = event.pathParameters.timeline_id;
        storageID = event.pathParameters.storage_id;
    } catch (err) {
        callback(new Error('Incorrect data requested'));
        // abort further processing
        return;
    }


    if (storageID == "st1") {
        // it's awful to do so
        // to make uid like stuff
        let hashCode = (code) => {
            let hash = ""
            for (let i = 0; i < 5; i++) {
                hash = hash.concat(code, i.toString());
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
            constructor(id, storageId) {
                this.id = hashCode(id);
                this.descritpion = "Lorem ipsum";
                this.address = {
                    location_id: storageId,
                    // that's bullshit ofcourse
                    x: Math.floor(Math.random() * 1000),
                    y: Math.floor(Math.random() * 1000),
                    z: Math.floor(Math.random() * 1000),
                };
                this.weight = Math.floor(Math.random() * 100);
                this.cargo_type = "whatever";
            }
        }

        let containers_dummy = []
        for (let char in "abcdefghijklmnop") {
            containers_dummy.push(new Container(char, storageID));
        }

        const response = {
            statusCode: 200,
            body: JSON.stringify({
                "id": simID,
                "containers": containers_dummy,
            }),
        }
        callback(null, response);
    } else {
        const response = {
            statusCode: 404,
            body: JSON.stringify({
                message: "couldn't find the storage with given parameters"
            }),
        }
        callback(null, response);
    }
}