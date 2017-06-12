'use strict';
const conf = require('./meta/testConfig').development;
const simulationCorrect = require('./meta/simulationCorrect');

const expect = require('chai').expect;

const qs = require('querystring');
const request = require('request');

describe('Docker API End-to-End test', function() {

    this.timeout(10000);
    describe('PUT /simulation/new-simulation', function() {

        it('should create a new simulation and give back it\'s details', function(done) {

            request({
                method: 'PUT',
                url: `${conf.apiURL}/simulation/new-simulation`,
                json: simulationCorrect
            }, function(error, response, body) {

                expect(response.statusCode).to.equal(200);
                expect(body).to.be.an('object');
                expect(body).to.have.property('simulation_id');
                expect(body).to.have.property('timeline_id');
                expect(body).to.have.property('download_url');
                done();

            });

        });

        it('should return 400 an error if input is missing something', function(done) {

            let simulationWrong = Object.assign({}, simulationCorrect);
            delete simulationWrong.docks;

            request({
                method: 'PUT',
                url: `${conf.apiURL}/simulation/new-simulation`,
                json: simulationWrong
            }, function(error, response, body) {

                expect(response.statusCode).to.equal(400);
                expect(body).to.be.an('array').that.is.not.empty;
                done();

            });

        });
    });

    describe('GET /simulation/{simulation_id}', function() {

        it('should return details about a simulation', function(done) {

            request({
                method: 'GET',
                url: `${conf.apiURL}/simulation/${conf.simulationId}`
            }, function(error, response, body) {

                body = JSON.parse(body);
                expect(response.statusCode).to.equal(200);
                expect(body).to.be.an('object');
                expect(body).to.have.property('id');
                expect(body).to.have.property('date_created');
                expect(body).to.have.property('current_time');
                expect(body).to.have.property('current_timeline_id');
                expect(body).to.have.property('scope');
                expect(body.scope.storages).to.be.an('array').that.is.not.empty;
                expect(body.scope.ships).to.be.an('array').that.is.not.empty;
                expect(body.scope.docks).to.be.an('array').that.is.not.empty;
                expect(body.scope.timelines).to.be.an('array').that.is.not.empty;
                expect(body.scope.container_count).to.be.a('number');
                done();

            });

        });

        it('should give specific scope details about a simulation', function(done) {

            const scope = qs.stringify({
                scope: "docks,container_count"
            });
            request({
                method: 'GET',
                url: `${conf.apiURL}/simulation/${conf.simulationId}?${scope}`
            }, function(error, response, body) {

                body = JSON.parse(body);
                expect(response.statusCode).to.equal(200);
                expect(body.scope.docks).to.be.an('array').that.is.not.empty;
                expect(body.scope.container_count).to.be.a('number');

                expect(body.scope).not.to.have.property('storages');
                expect(body.scope).not.to.have.property('ships');
                expect(body.scope).not.to.have.property('timelines');
                done();

            });

        });

        it('should return empty object if the simulation doesn\'t exist', function(done) {

            request({
                method: 'GET',
                url: `${conf.apiURL}/simulation/${conf.simulationId}000`
            }, function(error, response, body) {

                body = JSON.parse(body);
                expect(response.statusCode).to.equal(200);
                expect(body).to.be.an('object').that.is.empty;
                done();

            });

        });

    });


    // testing for the get {option}/all

    describe.only('GET /simulation/{simulation_id}/timelines/{timeline_id}/{ docks | ships | storages }/all', function() {

        it('should return 400 if asking for an options not in {"docks","ships","storages"}', function(done) {

            console.log(`${conf.apiURL}/simulation/${conf.simulationId}/timelines/${conf.timeLineId}/bullshit/all`);

            request({
                    method: 'GET',
                    url: `${conf.apiURL}/simulation/${conf.simulationId}/timelines/${conf.timeLineId}/bullshit/all`
                },
                function(error, response, body) {

                    console.log(error);
                    console.log(body);
                    // body = JSON.parse(body);
                    expect(response.statusCode).to.equal(400);
                    // expect(body).to.be.an('array').that.is.not.empty;
                    done();
                })
        })
    })



    describe('GET /tasks/{simulation_id/{timeline_id}', function() {

        it('should return an array with 10 tasks', function(done) {

            request({
                method: 'GET',
                url: `${conf.apiURL}/tasks/${conf.simulationId}/${conf.timeLineId}`
            }, function(error, response, body) {

                body = JSON.parse(body);
                expect(response.statusCode).to.equal(200);
                expect(body).to.be.an('object');
                expect(body.tasks).to.be.an('array').that.is.not.empty;
                expect(body.tasks).to.have.lengthOf(10);
                expect(body.next_time_stamp).to.be.a('number');
                expect(body.next_time_stamp_url).to.be.a('string');
                expect(body.tasks[0].id).to.equal(conf.taskFirstTaskFirstPage);
                expect(body.tasks[0].type).to.be.a('string');
                expect(body.tasks[0].start_time).to.be.a('number');
                expect(body.tasks[0].end_time).to.be.a('number');
                expect(body.tasks[0].description).to.be.a('string');
                expect(body.tasks[0].status).to.be.a('string');

                expect(body.tasks[0].extra.destination_id).to.be.a('string');
                expect(body.tasks[0].extra).to.have.property('source_id');
                expect(body.tasks[0].extra).to.have.property('container_id');

                expect(body.tasks[0].events[0].id).to.be.a('string');
                expect(body.tasks[0].events[0].type).to.be.a('string');
                expect(body.tasks[0].events[0].message).to.be.a('string');
                expect(body.tasks[0].events[0].time_stamp).to.be.a('number');
                done();

            });

        });

        it('should return an array with 5 tasks when limit is set', function(done) {

            const query = qs.stringify({
                limit: 5,
                time_stamp: conf.taskPaginationToken
            });
            request({
                method: 'GET',
                url: `${conf.apiURL}/tasks/${conf.simulationId}/${conf.timeLineId}?${query}`
            }, function(error, response, body) {

                body = JSON.parse(body);
                expect(response.statusCode).to.equal(200);
                expect(body).to.be.an('object');
                expect(body.tasks).to.be.an('array').that.is.not.empty;
                expect(body.tasks).to.have.lengthOf(5);
                expect(body.tasks[0].id).to.equal(conf.taskFirstTaskSecondPage);
                done();

            });

        });

        it('should return an empty array if the simulation or time line don\'t exists', function(done) {

            const query = qs.stringify({
                limit: 3
            });
            request({
                method: 'GET',
                url: `${conf.apiURL}/tasks/notExists/${conf.timeLineId}?${query}`
            }, function(error, response, body) {

                body = JSON.parse(body);
                expect(response.statusCode).to.equal(200);
                expect(body).to.be.an('object');
                expect(body.tasks).to.be.an('array').that.is.empty;
                done();

            });

        });

    });

    describe('GET /storage/{simulation_id/{timeline_id}/{storage_id}', function() {

        it('should give information about a specific storage', function(done) {

            request({
                method: 'GET',
                url: `${conf.apiURL}/storage/${conf.simulationId}/${conf.timeLineId}/${conf.storageId}`
            }, function(error, response, body) {

                body = JSON.parse(body);
                expect(response.statusCode).to.equal(200);
                expect(body).to.be.an('object');
                expect(body.id).to.be.a('string').that.is.not.empty;
                expect(body.size).to.be.an('object');
                expect(body.size).to.have.property('x').that.is.a('number');
                expect(body.size).to.have.property('y').that.is.a('number');
                expect(body.size).to.have.property('z').that.is.a('number');
                expect(body.containers_max).to.be.a('number');
                expect(body.containers_current).to.be.a('number');
                expect(body.connections).to.be.an('array').that.is.not.empty;
                done();

            });

        });

        it('should give a 404 if there is no such storage or time line or simulation', function(done) {

            request({
                method: 'GET',
                url: `${conf.apiURL}/storage/notExists/${conf.timeLineId}/${conf.storageId}`
            }, function(error, response, body) {

                body = JSON.parse(body);
                expect(response.statusCode).to.equal(404);
                expect(body).to.be.an('object');
                expect(body.message).to.be.a('string').that.is.not.empty;
                done();

            });

        });

    });

    describe('GET /storage/{simulation_id/{timeline_id}/{storage_id}/containers', function() {

        it('should retrieve the first 10 containers for a specific storage', function(done) {

            request({
                method: 'GET',
                url: `${conf.apiURL}/storage/${conf.simulationId}/${conf.timeLineId}/${conf.storageId}/containers`
            }, function(error, response, body) {

                body = JSON.parse(body);
                expect(response.statusCode).to.equal(200);
                expect(body).to.be.an('object');
                expect(body.pagination_token).to.be.a('string').that.is.not.empty;
                expect(body.pagination_url).to.be.a('string').that.is.not.empty;
                expect(body.containers).to.be.an('array').with.lengthOf(10);
                expect(body.containers[0].id).to.equal(conf.storageFirstContainerFirstPage);
                done();

            });

        });

        it('should retrieve the next page of containers for a specific storage', function(done) {

            const query = qs.stringify({
                limit: 5,
                pagination_token: conf.storagePaginationToken
            });
            request({
                method: 'GET',
                url: `${conf.apiURL}/storage/${conf.simulationId}/${conf.timeLineId}/${conf.storageId}/containers?${query}`
            }, function(error, response, body) {

                body = JSON.parse(body);
                expect(response.statusCode).to.equal(200);
                expect(body).to.be.an('object');
                expect(body.pagination_token).to.be.a('string').that.is.not.empty;
                expect(body.pagination_url).to.be.a('string').that.is.not.empty;
                expect(body.containers).to.be.an('array').with.lengthOf(5);
                expect(body.containers[0].id).to.equal(conf.storageFirstContainerSecondPage);
                done();

            });

        });

        it('should return 0 containers if simulation, time line or storage id doesn\'t exsits', function(done) {

            request({
                method: 'GET',
                url: `${conf.apiURL}/storage/notExists/${conf.timeLineId}/${conf.storageId}/containers`
            }, function(error, response, body) {

                body = JSON.parse(body);
                expect(response.statusCode).to.equal(200);
                expect(body).to.be.an('object');
                expect(body.pagination_token).to.equal(null);
                expect(body.pagination_url).to.equal(null);
                expect(body.containers).to.be.an('array').that.is.empty;
                done();

            });

        });

    });

    describe('GET /dock/{simulation_id/{timeline_id}/{dock_id}', function() {

        it('should give information about a specific dock', function(done) {

            request({
                method: 'GET',
                url: `${conf.apiURL}/dock/${conf.simulationId}/${conf.timeLineId}/${conf.dockId}`
            }, function(error, response, body) {

                body = JSON.parse(body);
                expect(response.statusCode).to.equal(200);
                expect(body).to.be.an('object');
                expect(body.id).to.be.a('string').that.is.not.empty;
                expect(body.loaders_count).to.be.a('number');
                expect(body.containers_count).to.be.a('number');
                expect(body.connections).to.be.an('array').that.is.not.empty;
                expect(body.connected_ship_id).to.equal(null);
                expect(body.scheduled_ships).to.be.an('array').that.is.not.empty;
                done();

            });

        });

        it('should give a 404 if there is no such dock or time line or simulation', function(done) {

            request({
                method: 'GET',
                url: `${conf.apiURL}/storage/notExists/${conf.timeLineId}/${conf.dockId}`
            }, function(error, response, body) {

                body = JSON.parse(body);
                expect(response.statusCode).to.equal(404);
                expect(body).to.be.an('object');
                expect(body.message).to.be.a('string').that.is.not.empty;
                done();

            });

        });

    });

    describe('GET /dock/{simulation_id/{timeline_id}/{dock_id}/containers', function() {


        it('should return 0 containers for the new simulation', function(done) {

            request({
                method: 'GET',
                url: `${conf.apiURL}/storage/${conf.simulationId}/${conf.timeLineId}/${conf.dockId}/containers`
            }, function(error, response, body) {

                body = JSON.parse(body);
                expect(response.statusCode).to.equal(200);
                expect(body).to.be.an('object');
                expect(body.pagination_token).to.equal(null);
                expect(body.pagination_url).to.equal(null);
                expect(body.containers).to.be.an('array').that.is.empty;
                done();

            });

        });

    });

    describe('GET /ship/{simulation_id/{timeline_id}/{ship_id}', function() {

        it('should give information for a specific ship', function(done) {

            request({
                method: 'GET',
                url: `${conf.apiURL}/storage/${conf.simulationId}/${conf.timeLineId}/${conf.storageId}`
            }, function(error, response, body) {

                body = JSON.parse(body);
                expect(response.statusCode).to.equal(200);
                expect(body).to.be.an('object');
                expect(body.id).to.be.a('string').that.is.not.empty;
                expect(body.size).to.be.an('object');
                expect(body.size).to.have.property('x').that.is.a('number');
                expect(body.size).to.have.property('y').that.is.a('number');
                expect(body.size).to.have.property('z').that.is.a('number');
                expect(body.containers_max).to.be.a('number');
                expect(body.containers_current).to.be.a('number');
                expect(body.connections).to.be.an('array').that.is.not.empty;
                done();

            });

        });

        it('should give a 400 if there is no such storage or time line or simulation', function(done) {

            request({
                method: 'GET',
                url: `${conf.apiURL}/ship/notExists/${conf.timeLineId}/${conf.shipId}`
            }, function(error, response, body) {

                body = JSON.parse(body);
                expect(response.statusCode).to.equal(400);
                expect(body).to.be.an('object');
                expect(body.message).to.be.a('string').that.is.not.empty;
                done();

            });

        });

    });

    describe('GET /ship/{simulation_id/{timeline_id}/{storage_id}/containers/unload', function() {

        it('should retrieve the first 2 containers to unload for a specific ship', function(done) {

            const query = qs.stringify({
                limit: 2
            });
            request({
                method: 'GET',
                url: `${conf.apiURL}/ship/${conf.simulationId}/${conf.timeLineId}/${conf.shipId}/containers/unload?${query}`
            }, function(error, response, body) {

                body = JSON.parse(body);
                expect(response.statusCode).to.equal(200);
                expect(body).to.be.an('object');
                expect(body.pagination_token).to.be.a('string').that.is.not.empty;
                expect(body.pagination_url).to.be.a('string').that.is.not.empty;
                expect(body.containers).to.be.an('array').with.lengthOf(2);
                expect(body.containers[0].id).to.equal(conf.shipUnloadFirstContainerFirstPage);
                done();

            });

        });

        it('should retrieve the next page of containers for a specific storage', function(done) {

            const query = qs.stringify({
                limit: 2,
                pagination_token: conf.shipPaginationToken
            });
            request({
                method: 'GET',
                url: `${conf.apiURL}/ship/${conf.simulationId}/${conf.timeLineId}/${conf.shipId}/containers/unload?${query}`
            }, function(error, response, body) {

                body = JSON.parse(body);
                expect(response.statusCode).to.equal(200);
                expect(body).to.be.an('object');
                expect(body.pagination_token).to.be.a('string').that.is.not.empty;
                expect(body.pagination_url).to.be.a('string').that.is.not.empty;
                expect(body.containers).to.be.an('array').with.lengthOf(2);
                expect(body.containers[0].id).to.equal(conf.shipUnloadFirstContainerSecondPage);
                done();

            });

        });

        it('should return 0 containers if simulation, time line or storage id doesn\'t exsits', function(done) {

            request({
                method: 'GET',
                url: `${conf.apiURL}/storage/notExists/${conf.timeLineId}/${conf.shipId}/containers`
            }, function(error, response, body) {

                body = JSON.parse(body);
                expect(response.statusCode).to.equal(200);
                expect(body).to.be.an('object');
                expect(body.pagination_token).to.equal(null);
                expect(body.pagination_url).to.equal(null);
                expect(body.containers).to.be.an('array').that.is.empty;
                done();

            });

        });

    });

    describe('GET /container/{simulation_id/{timeline_id}/{container_id}', function() {

        it('should give information about a specific container', function(done) {

            request({
                method: 'GET',
                url: `${conf.apiURL}/container/${conf.simulationId}/${conf.timeLineId}/${conf.containerId}`
            }, function(error, response, body) {

                body = JSON.parse(body);
                expect(response.statusCode).to.equal(200);
                expect(body).to.be.an('object');
                expect(body.address).to.be.an('object');
                expect(body.id).to.be.a('string').that.is.not.empty;
                expect(body.description).to.equal(null);
                expect(body.address).to.have.property('location_id').that.is.a('string').which.is.not.empty;
                expect(body.address).to.have.property('x').that.is.a('number');
                expect(body.address).to.have.property('y').that.is.a('number');
                expect(body.address).to.have.property('z').that.is.a('number');
                expect(body.weight).to.be.a('number');
                expect(body.cargo_type).to.be.a('string').that.is.not.empty;
                done();

            });

        });

        it('should give a 400 if there is no such container or time line or simulation', function(done) {

            request({
                method: 'GET',
                url: `${conf.apiURL}/ship/notExists/${conf.timeLineId}/${conf.shipId}`
            }, function(error, response, body) {

                body = JSON.parse(body);
                expect(response.statusCode).to.equal(400);
                expect(body).to.be.an('object');
                expect(body.message).to.be.a('string').that.is.not.empty;
                done();

            });

        });

    });

    describe('PATCH /sync', function() {

        const params = {
            simulation_id: conf.simulationId,
            timeline_id: conf.timeLineId,
            time_stamp: 20,
            return_tasks: true
        };

        it('should return an acknowledgment and tasks when you sync a simulation', function(done) {

            request({
                method: 'PATCH',
                url: `${conf.apiURL}/sync`,
                json: params
            }, function(error, response, body) {

                expect(response.statusCode).to.equal(200);
                expect(body).to.be.an('object');
                expect(body.acknowledged).to.be.a('number').to.equal(20);
                expect(body.tasks).to.be.an('array').that.is.not.empty;

                request({
                    method: 'GET',
                    url: `${conf.apiURL}/simulation/${conf.simulationId}`
                }, function(error, response, body) {

                    body = JSON.parse(body);
                    expect(response.statusCode).to.equal(200);
                    expect(body.current_time).to.equal(20);
                    done();

                });
            });

        });

        it('should return an acknowledgment when you sync a simulation', function(done) {

            params.return_tasks = false;
            request({
                method: 'PATCH',
                url: `${conf.apiURL}/sync`,
                json: params
            }, function(error, response, body) {

                expect(response.statusCode).to.equal(200);
                expect(body).to.be.an('object');
                expect(body).not.to.have.property('tasks');
                expect(body.acknowledged).to.be.a('number').to.equal(20);
                done();

            });

        });

        after(function(done) {

            params.time_stamp = 0;
            request({
                method: 'PATCH',
                url: `${conf.apiURL}/sync`,
                json: params
            }, function(error, response, body) {

                done();
                if (error) console.log(error);
            });

        })

    });

});