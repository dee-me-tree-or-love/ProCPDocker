const expect = require('chai').expect;
const ShipLoader = require('./').ShipLoader;
describe('Ship Loading Algorithm', function() {

    describe('Calculate total mass for all containers on ship', function() {

        let ship = {
            x: 10,
            y: 10,
            z: 20,
            containers_in: [{
                    "address": {
                        "location_id": "",
                        "x": 0,
                        "y": 0,
                        "z": 0
                    },
                    "weight": 20
                },
                {
                    "address": {
                        "location_id": "",
                        "x": 0,
                        "y": 0,
                        "z": 0
                    },
                    "weight": 30
                },
                {
                    "address": {
                        "location_id": "",
                        "x": 0,
                        "y": 0,
                        "z": 0
                    },
                    "weight": 50
                }
            ]
        };

        it('up getTotalMass', function() {

            let sl = new ShipLoader(ship);
            expect(sl).to.respondsTo('getTotalMass');
        });

        it('create a proper object', function() {

            let sl = new ShipLoader(ship);
            expect(sl.center.x).to.equal(5);
            expect(sl.center.y).to.equal(5);
            expect(sl.center.z).to.equal(0);

        });

        it('should give the correct total mass for a filled ship', function() {

            let sl = new ShipLoader(ship);
            let totalMass = sl.getTotalMass();
            expect(totalMass).to.equal(100);
        });

        it('should return 0 if there are no containers on the ship', function() {

            let shipWithoutcontainers = Object.assign({}, ship);
            delete shipWithoutcontainers.containers_in;
            let sl = new ShipLoader(shipWithoutcontainers);
            let totalMass = sl.getTotalMass();
            expect(totalMass).to.equal(0);
        });

        it('should skip container if it doesn\'t have weight property', function() {

            let shipWithWeightlessContainers = Object.assign({}, ship);
            delete shipWithWeightlessContainers.containers_in[0].weight;
            let sl = new ShipLoader(ship);
            let totalMass = sl.getTotalMass();
            expect(totalMass).to.equal(80);
        });
    });

    describe('Get distance between 2 points in 3D space', function() {

        const ship = {
            x: 10,
            y: 10,
            z: 10
        };
        it('up getDistanceBetweenTwoPoints', function() {

            let sl = new ShipLoader(ship);
            expect(sl).to.respondsTo('getDistanceBetweenTwoPoints');
        });
        it('');
    });


    // [ DMITIRII's SHIT ]

    describe('Get a list of all the placement possibilities', () => {
        it("up getPlacementPossibilities()", () => {
            let Ship = {
                x: 4,
                y: 4,
                z: 4,
                containers_in: []
            };
            let SL = new ShipLoader(Ship);
            expect(SL).to.respondsTo("getPlacementPossibilities");
        });
        it("returns (0,0,0) to (3,3,0) ofr an empty 4x4x4 container hold", () => {
            let Ship = {
                x: 4,
                y: 4,
                z: 4,
                containers_in: []
            };
            let SL = new ShipLoader(Ship);
            let optionsResult = SL.getPlacementPossibilities();

            let expectedOptions = [];
            for (let xPos = 0; xPos < 4; xPos++) {
                for (let yPos = 0; yPos < 4; yPos++) {
                    expectedOptions.push({ x: xPos, y: yPos, z: 0 });
                }
            }

            expect(optionsResult.length).to.be.equal(16);
            expect(optionsResult).to.be.deep.equal(expectedOptions);
        });
        it("in a storage hold with 1 container at (1,1,0) returns the list of (0,0,0) to (3,3,0) with (1,1,1)", () => {

            let Ship = {
                x: 4,
                y: 4,
                z: 4,
                containers_in: [{ x: 1, y: 1, z: 0 }]
            };
            let SL = new ShipLoader(Ship);
            let optionsResult = SL.getPlacementPossibilities();

            let expectedOptions = [];
            for (let xPos = 0; xPos < 4; xPos++) {
                for (let yPos = 0; yPos < 4; yPos++) {
                    let zPos = 0;
                    if (xPos == 1 && yPos == 1) {
                        zPos = 1;
                    }
                    expectedOptions.push({ x: xPos, y: yPos, z: zPos });
                }
            }

            expect(optionsResult.length).to.be.equal(16);
            expect(optionsResult).to.be.deep.equal(expectedOptions);
        });

        it("in a storage hold with 3 container at (1,1,0); (1,0,0); (3,0,0)" +
            " returns the list of (0,0,0) to (3,3,0) " +
            "with (1,1,1);(1,0,1);(3,0,1)", () => {

                let Ship = {
                    x: 4,
                    y: 4,
                    z: 4,
                    containers_in: [
                        { x: 1, y: 1, z: 0 },
                        { x: 1, y: 0, z: 0 },
                        { x: 3, y: 0, z: 0 }
                    ]
                };
                let SL = new ShipLoader(Ship);
                let optionsResult = SL.getPlacementPossibilities();

                let expectedOptions = [];
                for (let xPos = 0; xPos < 4; xPos++) {
                    for (let yPos = 0; yPos < 4; yPos++) {
                        let zPos = 0;
                        if ((xPos == 1 && yPos == 1) ||
                            (xPos == 1 && yPos == 0) ||
                            (xPos == 3 && yPos == 0)) {
                            zPos = 1;
                        }
                        expectedOptions.push({ x: xPos, y: yPos, z: zPos });
                    }
                }

                expect(optionsResult.length).to.be.equal(16);
                expect(optionsResult).to.be.deep.equal(expectedOptions);
                expect(SL.allPossibilities).to.be.deep.equal(expectedOptions);
            });


        it("in a storage hold with 4 containers at (1,1,0); (1,0,0); (3,0,0); (3,0,1)" +
            " returns the list of (0,0,0) to (3,3,0) " +
            "with (1,1,1);(1,0,1);(3,0,2)", () => {

                let Ship = {
                    x: 4,
                    y: 4,
                    z: 4,
                    containers_in: [
                        { x: 1, y: 1, z: 0 },
                        { x: 1, y: 0, z: 0 },
                        { x: 3, y: 0, z: 0 },
                        { x: 3, y: 0, z: 1 }
                    ]
                };
                let SL = new ShipLoader(Ship);
                let optionsResult = SL.getPlacementPossibilities();

                let expectedOptions = [];
                for (let xPos = 0; xPos < 4; xPos++) {
                    for (let yPos = 0; yPos < 4; yPos++) {
                        let zPos = 0;
                        if ((xPos == 1 && yPos == 1) ||
                            (xPos == 1 && yPos == 0)) {
                            zPos = 1;
                        }
                        if ((xPos == 3 && yPos == 0)) {
                            zPos = 2;
                        }
                        expectedOptions.push({ x: xPos, y: yPos, z: zPos });
                    }
                }

                expect(optionsResult.length).to.be.equal(16);
                expect(optionsResult).to.be.deep.equal(expectedOptions);
            });
    });
    describe('Get Center Of Mass', () => {

    });
});