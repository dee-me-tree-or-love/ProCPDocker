var assert = require('assert');
var chai = require('chai');
var should = chai.should;
var expect = chai.expect;

import 'babel-polyfill';
const HarborBuilder = require('../Shared/HarborBuilder')
const HarborValidator = require('../Shared/HarborValidator');

describe('Harbor Building and Verification', function() {
    describe('constructHarbor(configs, laypaths)', function() {
        describe('should return edges between a storage and a dock', function() {
            it('the edge should be 1 if there is 1 dock and 1 storage', function() {
                let configs = {
                    ships: [{
                        id: "",
                    }],
                    docks: [{
                        id: "d1" // other properties can be omitted
                    }],
                    storages: [{
                        id: "st1"
                    }],
                }

                let harbor = HarborBuilder.constructHarbor(configs);
                assert.equal(harbor.edges.length, 1);
            });
            it('the configuration should now contain the docks and storages with the specified connections by UUIDs', function() {
                let configs = {
                    ships: [{
                        id: "",
                    }],
                    docks: [{
                        id: "d1" // other properties can be omitted
                    }],
                    storages: [{
                        id: "st1"
                    }],
                }

                let harbor = HarborBuilder.constructHarbor(configs).entities;
                let allgood = true;

                for (let i = 0; i < harbor.docks.length; i++) {
                    // 0 0 -> 0
                    // 0 1 -> 0
                    // 1 0 -> 0
                    // 1 1 -> 1 -- since allgood is true from the beginning it will remain true as long as the connections are in the docks
                    allgood = ('connections' in harbor.docks[i]) && allgood;
                }
                expect(allgood).to.be.true;
                for (let i = 0; i < harbor.storages.length; i++) {
                    allgood = ('connections' in harbor.storages[i]) && allgood;
                }
                expect(allgood).to.be.true;
            })
        });
        describe('should dublicate the connections and edges in the actual storages', function() {
            it('given there is only 1 edge created, it should be equal to the connection of the dock and the connection of the ship', function() {
                let configs = {
                    ships: [{
                        id: "",
                    }],
                    docks: [{
                        id: "d1" // other properties can be omitted
                    }],
                    storages: [{
                        id: "st1"
                    }],
                }

                let harbor = HarborBuilder.constructHarbor(configs);
                // edges and storages connections
                assert.deepEqual(harbor.edges, configs.storages[0].connections);
                // storages connections and the dock connections
                assert.deepEqual(configs.docks[0].connections, configs.storages[0].connections);
            });
        })

    });

    // validator
    describe('verifyConfigStructure(configs)', function() {
        describe('pasing empty objects', function() {
            it('on receiving an empty object should return 3 errors', function() {
                let result = HarborValidator.StructureChecker.verifyConfigStructure({});
                // console.dir(result);
                chai.expect(result.isokay).to.be.false;
                assert.equal(result.errors.length, 3);
            });
        });
        describe('on receiving a configuration with ships having only ids and etas should return 9 errors', function() {
            it('2 about lacking groups and 1+6 about properties of the ships', function() {

                let configs = {
                    ships: [{
                        id: "sh1",
                        eta: 0
                    }]
                };
                // console.log(HarborValidator);
                let result = HarborValidator.StructureChecker.verifyConfigStructure(configs);
                //console.dir(configs['ships']);
                // console.dir(result);
                assert.equal(result.errors.length, 9);
            });
        });
        describe('on receiving a configuration with a ship(complete) and a dock(only id) should return 3 errors', function() {
            it('1 about lacking groups and 1+1 about properties of the dock', function() {

                let configs = {
                    ships: [{
                        "id": "ship1",
                        "eta": 6,
                        "x": 1,
                        "y": 3,
                        "z": 3,
                        "filled": 50,
                        /* % of total containers onboard*/
                        "unload": 20,
                        /* % of total containers to unload */
                        "load": 40 /* % of total containers to load */
                    }],
                    docks: [{
                        id: "d1"
                    }]
                };

                let result = HarborValidator.StructureChecker.verifyConfigStructure(configs);
                //console.dir(configs['ships']);
                // console.dir(result);
                assert.equal(result.errors.length, 3);
            });
        });
    });
    describe('verifyShipRules(ship)', function() {
        describe('check if the business rules imposed on the ship object are okay', function() {
            it('given negative time of arrival should return 1 error', function() {
                let result = HarborValidator.RuleChecker.verifyShipRules({
                    eta: -1,
                    x: 1,
                    y: 2,
                    z: 3,
                    filled: 10,
                    unload: 2,
                    load: 1
                });
                // console.log(result);
                assert.equal(result.errors.length, 1);
            })
        });
    });

    // complete validation:

    describe('Complete validation of the configurations', function() {
        describe('Given a correct and valid configuration should return a result with no errors', function() {
            it('Giving it an example config that is know to be valid -> expecting 0 errors', function() {

                let configs = {
                    "docks": [{
                        "id": "1",
                        "number_loaders": 2
                    }],
                    "storages": [{
                        "x": 2,
                        "y": 2,
                        "z": 2,
                        "id": "s1",
                        "filled": 40 /* % of total containers in storage*/
                    }],
                    "ships": [{
                        "id": "ship1",
                        "eta": 6,
                        "x": 1,
                        "y": 3,
                        "z": 3,
                        "filled": 50,
                        /* % of total containers onboard*/
                        "unload": 20,
                        /* % of total containers to unload */
                        "load": 40 /* % of total containers to load */
                    }]
                }


                let errors = HarborValidator.verifyConfiguration(configs);
                assert.equal(errors.length, 0);
            });
            it('Giving it a cinfiguration without any data', function() {
                let errors = HarborValidator.verifyConfiguration({});
                // console.log(errors);
                assert.notEqual(errors.length, 0);
            })
            it('Giving it the data with logical problems', function() {
                let configs = {
                    "docks": [{
                        "id": "1",
                        "number_loaders": 2
                    }],
                    "storages": [{
                        "x": 2,
                        "y": 2,
                        "z": 2,
                        "id": "s1",
                        "filled": 110 /* % of total containers in storage*/
                    }],
                    "ships": [{
                        "id": "ship1",
                        "eta": 6,
                        "x": 1,
                        "y": 3,
                        "z": 3,
                        "filled": 50,
                        /* % of total containers onboard*/
                        "unload": 60,
                        /* % of total containers to unload */
                        "load": 40 /* % of total containers to load */
                    }]
                }
                let errors = HarborValidator.verifyConfiguration(configs);
                console.log(errors);
                assert.notEqual(errors.length, 0);
            });
            it('Try to test with 100 filled, 100 unload and 100 load -> should be okay', function() {
                let configs = {
                    "docks": [{
                        "id": "1",
                        "number_loaders": 2
                    }],
                    "storages": [{
                        "x": 2,
                        "y": 2,
                        "z": 2,
                        "id": "s1",
                        "filled": 20 /* % of total containers in storage*/
                    }],
                    "ships": [{
                        "id": "ship1",
                        "eta": 6,
                        "x": 1,
                        "y": 3,
                        "z": 3,
                        "filled": 100,
                        /* % of total containers onboard*/
                        "unload": 100,
                        /* % of total containers to unload */
                        "load": 100 /* % of total containers to load */
                    }]
                }
                let errors = HarborValidator.verifyConfiguration(configs);
                console.log(errors);
                assert.equal(errors.length, 0);
            });
        })
    })

});