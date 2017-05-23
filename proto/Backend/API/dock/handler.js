'use strict';

// get general info about a storage
//
// https://github.com/dee-me-tree-or-love/ProCPDocker/blob/develop/proto/Backend/API_DOCUMENATION.md#storagesimulation_idtimeline_idstorage_id

module.exports.getDock = (event, context, callback) => {

    let simID = "";
    let timelineID = "";
    let dockID = "";

    try {
        simID = event.pathParameters.simulation_id;
        timelineID = event.pathParameters.timeline_id;
        dockID = event.pathParameters.dock_id;
    } catch (err) {
        callback(new Error('Incorrect data requested'));
        // abort further processing
        return;
    }



    const response = {
        statusCode: 200,
        body: JSON.stringify({
            "id": dockID,
            "loaders_count": 0,
            "connected_storages": [{
                "id": "",
                "weight": 0
            }],
            "container_count": 0,
            "connected_ship_id": "",
            "scheduled_ships": [{
                "id": "",
                "time_arrived": 0
            }]
        }),
    }
    callback(null, response);

}


// get containers
// 
// https://github.com/dee-me-tree-or-love/ProCPDocker/blob/develop/proto/Backend/API_DOCUMENATION.md#docksimulation_idtimeline_iddock_idcontainers

module.exports.getDockContainers = (event, context, callback) => {
    let simID = "";
    let timelineID = "";
    let dockID = "";

    try {
        simID = event.pathParameters.simulation_id;
        timelineID = event.pathParameters.timeline_id;
        dockID = event.pathParameters.dock_id;
    } catch (err) {
        callback(new Error('Incorrect data requested'));
        // abort further processing
        return;
    }


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
        constructor(id, dockID) {
            this.id = hashCode(id);
            this.descritpion = "Lorem ipsum";
            this.address = {
                location_id: dockID,
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
        containers_dummy.push(new Container(char, dockID));
    }

    const response = {
        statusCode: 200,
        body: JSON.stringify({
            "id": simID,
            "containers": containers_dummy,
        }),
    }
    callback(null, response);
}