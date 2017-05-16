var assert = require('assert');
var chai = require('chai');
var should = chai.should();

import 'babel-polyfill';
import * as HarborBuilder from "../lib/harbor_builder";

describe('Harbor Builder', function() {
    describe('constructHarbor(configs, laypaths)', function() {
        it('should return 1 edge between a storage and a dock', function() {
            let configs = {
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
    });

    // validator
    describe('verifyConfigStructure(configs)', function() {
        describe('pasing empty objects', function() {
            it('on receiving an empty object should return 3 errors', function() {
                let result = HarborBuilder.verifyConfigStructure({});
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

                let result = HarborBuilder.verifyConfigStructure(configs);
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

                let result = HarborBuilder.verifyConfigStructure(configs);
                //console.dir(configs['ships']);
                // console.dir(result);
                assert.equal(result.errors.length, 3);
            });
        });
    });
});