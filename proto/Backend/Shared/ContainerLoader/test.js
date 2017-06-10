const expect = require('chai').expect;
const ShipLoader = require('./').ShipLoader;
describe('Ship Loading Algorithm', function () {

    describe('Calculate total mass for all containers on ship', function () {

        let ship = {
            x: 10,
            y: 10,
            z: 20,
            containers_in: [
                {
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

        it('up getTotalMass', function () {

            let sl = new ShipLoader(ship);
            expect(sl).to.respondsTo('getTotalMass');
        });

        it('create a proper object', function () {

            let sl = new ShipLoader(ship);
            expect(sl.center.x).to.equal(5);
            expect(sl.center.y).to.equal(5);
            expect(sl.center.z).to.equal(0);

        });

        it('should give the correct total mass for a filled ship', function () {

            let sl = new ShipLoader(ship);
            let totalMass = sl.getTotalMass();
            expect(totalMass).to.equal(100);
        });

        it('should return 0 if there are no containers on the ship', function () {

            let shipWithoutcontainers = Object.assign({}, ship);
            delete shipWithoutcontainers.containers_in;
            let sl = new ShipLoader(shipWithoutcontainers);
            let totalMass = sl.getTotalMass();
            expect(totalMass).to.equal(0);
        });

        it('should skip container if it doesn\'t have weight property', function () {

            let shipWithWeightlessContainers = Object.assign({}, ship);
            delete shipWithWeightlessContainers.containers_in[0].weight;
            let sl = new ShipLoader(ship);
            let totalMass = sl.getTotalMass();
            expect(totalMass).to.equal(80);
        });
    });

    describe('Get distance between 2 points in 3D space', function () {

        const ship = {
            x: 10, y: 10, z: 10
        };
        it('up getDistanceBetweenTwoPoints', function () {

            let sl = new ShipLoader(ship);
            expect(sl).to.respondsTo('getDistanceBetweenTwoPoints');
        });
        it('');
    });
});