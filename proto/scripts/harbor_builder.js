class HarborBuilder {

    constructor(pathLayer) {
        this.pathLayer = pathLayer;
    }

    setPathLayer(pathLayer) {
        this.pathLayer = pathLayer;
    }

    getPathLayer() {
        return this.pathLayer;
    }

    // assuming the validated and correctly formed input of the configuration
    constructHarbor(configs) {
        let harbor = {
            docks: configs.docks,
            storages: configs.storages,
            edges: this.createRandomEdges(configs.docks, configs.storages),
        }
        return harbor;
    }

    // adds the connections between the storages and docks
    // since the graph is undirected
    // the edges are defined as: 
    // { vertices: [] /*at most 2*/, weight: int, }
    //
    // pathLayer - an instance of the object that provides path constuction.
    // 				works like the strategy pattern
    //  			
    createRandomEdges(docks, storages) {
        return this.getPathLayer().layPaths(docks, storages);
    }
}

// only the storages to docks 
class PathLayerStoragesDocks {
    layPaths(docks, storages) {
        let edges = [];
        console.log("adding edges");

        for (let i = 0; i < storages.length; i++) {
            for (let j = 0; j < docks.length; j++) {
                edges.push({
                    vertices: [storages[i], docks[j]],
                    weight: MathStuff.getRandomInt(5, 20),
                });
            }
        }

        console.dir(edges);
        return edges;
    }
}

// storages to docks; docks to docks
class PathLayerStoragesDocksDocks {
    layPaths(docks, storages) {
        let edges = [];
        console.log("adding edges");

        for (let i = 0; i < storages.length; i++) {
            for (let j = 0; j < docks.length; j++) {
                edges.push({
                    vertices: [storages[i], docks[j]],
                    weight: MathStuff.getRandomInt(5, 20),
                });
            }
        }

        // optional:
        // adds the edges between the docs 
        for (let i = 0; i < docks.length - 1; i++) {
            edges.push({
                vertices: [docks[i], docks[i + 1]],
                weight: MathStuff.getRandomInt(5, 10),
            })
        }

        console.dir(edges);
        return edges;
    }
}

// storages to storages to docks to docks
class PathLayerStoragesStoragesDocksDocks {
    layPaths(docks, storages) {
        let edges = [];
        console.log("adding edges");

        for (let i = 0; i < storages.length; i++) {
            for (let j = 0; j < docks.length; j++) {
                edges.push({
                    vertices: [storages[i], docks[j]],
                    weight: MathStuff.getRandomInt(5, 20),
                });
            }
        }

        // optional:
        // adds the edges between the docs 
        for (let i = 0; i < docks.length - 1; i++) {
            edges.push({
                vertices: [docks[i], docks[i + 1]],
                weight: MathStuff.getRandomInt(5, 10),
            })
        }

        // optional:
        // adds the edges between the storages 
        for (let i = 0; i < storages.length - 1; i++) {
            edges.push({
                vertices: [storages[i], storages[i + 1]],
                weight: MathStuff.getRandomInt(5, 10),
            })
        }


        console.dir(edges);
        return edges;
    }
}

// for static math functions
// should not be a singleton
class MathStuff {
    static getRandomInt(min, max) {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min)) + min;
    }
}

let logConfigs = (configs) => {
    console.log("configuration file:");
    console.dir(configs);
    console.log("------")
};

let logResults = (harbor) => {
    console.log("------")
    console.log("created harbor:");
    console.log("------")
    console.log(">docks");
    console.dir(harbor.docks);
    console.log("------")
    console.log(">storages");
    console.dir(harbor.storages);
    console.log("------")
    console.log(">edges");
    for (let i = 0; i < harbor.edges.length; i++) {
        console.dir(harbor.edges[i]);
    }
};
// entry

let configs = require('./harbor_config');

logConfigs(configs)


// or you can specify other path layer methods
// maybe it should be also present in the configuraion file? 

let hb = new HarborBuilder(new PathLayerStoragesDocks());
let harbor = hb.constructHarbor(configs);

logResults(harbor);

return harbor;