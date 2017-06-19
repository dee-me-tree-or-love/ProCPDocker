<template>
<div class="fluid-container" id="app">
  <div id="init" v-if="init">
    <div class="jumbotron text-center no-margin-bot">
    <h1>Docker</h1>
    <p>Set up your environment!</p>
  </div>
    <div class="col-md-4 topSpace text-center">
      <span>Number of ships: </span><input type="number" v-model="shipStr">
      <ShipFormComponent v-for="shipCount in shipCount" ref="ship{{shipCount}}"></ShipFormComponent>
    </div>
    <div class="col-md-4 topSpace text-center">
      <span>Number of storages: </span><input type="number" v-model="storStr">
      <StorageFormComponent v-for="storageCount in storageCount" ref="storage{{storageCount}}"></StorageFormComponent>
    </div>
    <div class="col-md-4 topSpace text-center">
      <span>Number of docks: </span><input type="number" v-model="dockStr">
      <DockFormComponent v-for="dockCount in dockCount" ref="dock{{dockCount}}"></DockFormComponent>
    </div>
    <div class="col-md-12 text-center topSpace">
      <input type="button" class="btn btn-success" value="New simulation" @click="initSim">
    </div>
  </div>
  <div id="sim" v-else>
    <div class="col-md-8" id="CanvasPart">
      <div class="col-md-12 topSpace" style="height:100%;border:1px solid black;" id="main-simulation">
        <div class="topSpace" id="CanvasContainer">
          <CanvasDrawingComponent @context="setContext" @componentsidebarcheck="setComponentBool" :ships="ships" :docks="docks" :storages="storages" :storagesbool="storagesbool" :docksbool="docksbool" :eventsbool="eventsbool" :shipsbool="shipsbool"></CanvasDrawingComponent>
        </div>
        <div id="wrapper" class="topSpace">
          <!-- <div class="progress-bar text-center">
            <input type="range" min="0" max="100" value="0" step="1" id="slider" @mouseup="adjustTasksWithSlider"></input>
          </div> -->
          <div class="buttons text-center">
            <button @click="stepBackSimulation" class="btn btn-info btn-lg"><span class="glyphicon glyphicon-step-backward" aria-hidden="true"></span></button>
            <button @click="play" class="btn btn-success btn-lg"><span class="glyphicon glyphicon-play" aria-hidden="true"></span></button>
            <button @click="pauseSimulation" class="btn btn-warning btn-lg"><span class="glyphicon glyphicon-pause" aria-hidden="true"></span></button>
            <button @click="stepForwardSimulation" class="btn btn-info btn-lg"><span class="glyphicon glyphicon-step-forward" aria-hidden="true"></span></button>
            <button @click="syncSimulation" class="btn btn-danger btn-lg"><span class="glyphicon glyphicon-refresh" aria-hidden="true"></span></button>
          </div>
        </div>
      </div>
      <div class="col-md-4 topSpace" id="InfoPart">
        <TaskContainerComponent :tasks="tasks"></TaskContainerComponent>
        <EventContainerComponent v-if="eventsbool" :events="events"></EventContainerComponent>
        <StorageComponent v-else-if="storagesbool" :storage="currentstorage"></StorageComponent>
        <DockComponent v-else-if="docksbool" :dock="currentdock"></DockComponent>
        <ShipComponent v-else :ship="currentship"></ShipComponent>
      </div>
    </div>
  </div>
</div>
</template>

<script>
import Task from './models/Task.js';
import Truck from './models/Truck.js';
import Ship from './models/Ship.js';
import Dock from './models/Dock.js';
import Storage from './models/Storage.js';
import Size from './models/Size.js';
import Destination from './models/Destination.js';
import Event from './models/Event.js';
import Extra from './models/Extra.js';
import Scope from './models/Scope.js';
import ConnectedStorage from './models/ConnectedStorage.js';
import Connection from './models/Connection.js';
import Container from './models/Container.js';
import ScheduledShip from './models/ScheduledShip.js';
import Simulation from './models/Simulation.js';
import Canvas from './models/Canvas.js';
import Road from './models/Road.js';
import CanvasDrawingComponent from './canvas_drawing_component.vue';

var sim_id_global;
var timeline_id_global;
var that;
var timer;
var timer_event;
var timer_tasks;
var play = true;
var interval = 1000;
var completedtasks = [];
var counter = 0;
var currentTask;
var events = [];
var canvas_sim_id;
var first_played = true; // TODO: this will not be needed when



export default {
  name: 'app',
  mounted() {
    this.eventsbool = false,
      this.shipsbool = false,
      this.storagesbool = false,
      this.docksbool = true,
      this.simulationid = '483e46a8-0994-4a39-9b57-612513468c76',
      //this.getTimelines(this.simulationid),
      this.timelineid = '569f56b9-9ccc-469d-9f63-43a5bd8aef1f'
    //this.waitForContext()
    //this.waitForContext()
  },
  data() {
    return {
      timelineid: '569f56b9-9ccc-469d-9f63-43a5bd8aef1f',
      simulationid: '483e46a8-0994-4a39-9b57-612513468c76',
      currenttimeline: 'timeline1',
      ctx: null,
      tasks: [],
      schedule: [],
      completedtasks: [],
      ships: [new Ship("id", "size", "containers_max", "containers_current", "containers_unload", "containers_load", "destination", "status")],
      docks: [new Dock("id", "loaders_count", "connected_storages", "container_count", "connected_ship_id", "scheduled_ships")],
      storages: [new Storage("id", "size", "containers_max", "containers_current", "connections", "status")],
      currentship: new Ship("id", "size", "containers_max", "containers_current", "containers_unload", "containers_load", "destination", "status"),
      currentdock: new Dock("id", "loaders_count", "connected_storages", "container_count", "connected_ship_id", "scheduled_ships"),
      currentstorage: new Storage("id", "size", "containers_max", "containers_current", "connections", "status"),
      trucks: [],
      eventsbool: false,
      shipsbool: false,
      storagesbool: false,
      docksbool: false,
      canvas: null,
      init: true,
      shipStr: 1,
      storStr: 1,
      dockStr: 1,
      completedevents: [],
      empty: [],
      //current_time : 0,
      time_stamp_token: '',
      next_time_stamp: 0,
      interval_tasks: 2000,
      taskCheck: true,
      all_events: [],
      all_containers: [],
      storage_pagination_url:"https://fvrwbtsci9.execute-api.eu-central-1.amazonaws.com/prd/storage/",
      ship_pagination_url:"https://fvrwbtsci9.execute-api.eu-central-1.amazonaws.com/prd/ship/",
      dock_pagination_url:"https://fvrwbtsci9.execute-api.eu-central-1.amazonaws.com/prd/dock/",
      api_storages:false,
      api_docks:false,
      api_ships:false,
      api_ship_containers: false,
      api_storage_containers: false,
      api_simulation: false,

    }
  },
  computed: {
    events: function() {
      if (this.tasks.length > 0) {
        return this.tasks[0].events;
      } else {
        return this.empty;
      }
    },
    current_time: function() {
      return this.tasks[0].start_time;
    },
    interval_events: function() {
      return Math.floor(this.interval_tasks / this.events.length);
    },
    shipCount: function() {
      return parseInt(this.shipStr);
    },
    storageCount: function() {
      return parseInt(this.storStr);
    },
    dockCount: function() {
      return parseInt(this.dockStr);
    },
  },
  methods: {
    setContext(value) {
      this.ctx = value;
      //this.ctx);
      //for(var i = 0;i < this.ships.length;i++){
      //this.ships[i].setY(i);
      //this.ships[i].drawShip(this.ctx);
      //}
    },
    setComponentBool(value) {
      //alert(value);
      this.shipsbool = false;
      this.storagesbool = false;
      this.docksbool = false;
      this.eventsbool = false;

      if (value.includes("ship")) {
        this.shipsbool = true;
        var index = value.split("ship");
        this.currentship = this.ships[index[1]];
      } else if (value.includes("dock")) {
        this.docksbool = true;
        var index = value.split("dock");
        this.currentdock = this.docks[index[1]];
      } else if (value.includes("storage")) {
        this.storagesbool = true;
        var index = value.split("storage");
        this.currentstorage = this.storages[index[1]];
      } else if (value.includes("event")) {
        this.eventsbool = true;
      }

    },
    getSimulation() {

      //this.simulationid = '483e46a8-0994-4a39-9b57-612513468c76';
      that = this;
      axios.get('https://fvrwbtsci9.execute-api.eu-central-1.amazonaws.com/prd/simulation/' + this.simulationid + '?scope=ships%2Cdocks%2Cstorages%2Ccontainer_count')
        .then(function(response) {
          if (response.status == 200) {
            //console.log(response.data);
            that.timelineid = response.data.current_timeline_id;

            that.getDocks(response.data.id, response.data.current_timeline_id, response.data.scope.docks);
            that.getStorages(response.data.id, response.data.current_timeline_id, response.data.scope.storages);
            //console.log(that.docks);
            setTimeout(function(){
               that.getShips(response.data.id, response.data.current_timeline_id, response.data.scope.ships);
          },2000);
               that.api_simulation = true;
               console.log(that.api_simulation);
            //that.simulationLoop();
            //console.log(that.completedevents);
            //console.log(that.storages);
            //console.log(that.ships);
          } else {}
        });
    },
    getTimelines(sim_id) {
      axios.get('https://fvrwbtsci9.execute-api.eu-central-1.amazonaws.com/prd/simulation/' + sim_id + '/timelines')
        .then(function(response) {
          this.timelineid = response.data.timelines.id;
        });
    },
    getDocks(sim_id, time_id, docks) {
      //for(var i = 0;i < response.data.scope["ships"].length;i++){///simulation/{simulation_id}/timelines/{timeline_id}/{ docks | ships | storages }/all
      that = this;
      that.docks.length = 0;

     var docks_counter = 0;
      for (var i = 0; i < docks.length; i++) {
        axios.get('https://fvrwbtsci9.execute-api.eu-central-1.amazonaws.com/prd/dock/' + sim_id + '/' + time_id + '/' + docks[i].id)
          .then(function(response) {
            var connectedstorages = [];
            var scheduledships = [];
            if (response.status == 200) {
              //that.getTimelines(response.data.id);
              for (var j = 0; j < response.data["connections"].length; j++) {
                connectedstorages.push(new ConnectedStorage(response.data["connections"][j].storage_id, response.data["connections"][j].weight))
              }
              for (var j = 0; j < response.data["scheduled_ships"].length; j++) {
                scheduledships.push(new ScheduledShip(response.data["scheduled_ships"][j].ship_id, response.data["scheduled_ships"][j].eta))
              }
              var tempdock = new Dock(response.data.id, response.data.loaders_count, connectedstorages, response.data.container_count, response.data.connected_ship_id, scheduledships);

              tempdock.setY(docks_counter);

              that.docks.push(tempdock);

              that.getDockContainers(sim_id, time_id,tempdock.id,docks_counter,0);

              docks_counter++;

              if(docks_counter == docks.length){
                   console.log("docks");
                   that.api_docks = true;
                   console.log(that.api_docks);
              }

              //this.timelineid = response.data.timelines.id;


            } else {
              alert('server error with get docks please wait a moment')
            }
          });
      }
    },
    getShips(sim_id, time_id, ships) {

      that = this;

      that.ships.length = 0;
      var ships_counter = 0;
      for (var i = 0; i < ships.length; i++) {
        axios.get('https://fvrwbtsci9.execute-api.eu-central-1.amazonaws.com/prd/ship/' + sim_id + '/' + time_id + '/' + ships[i].id)
          .then(function(response) {

            if (response.status == 200) {

              var tempship = new Ship(response.data.id, new Size(response.data["size"].x, response.data["size"].y, response.data["size"].z), response.data.containers_max, response.data.containers_current, response.data.containers_unload, response.data
                .containers_load, new Destination(response.data["destination"].id, response.data["destination"].estimated_arrival_time), response.data.status);

              var tempdock = that.findDock(tempship.destination.id);

              tempship.setDock(tempdock);

              that.ships.push(tempship);

              that.getShipContainers(sim_id, time_id,tempship.id,ships_counter,0);

              ships_counter++;

              if(ships_counter == ships.length){
                   that.api_ships = true;
                   console.log("api ships");
                   console.log(that.api_ships);
              }

              console.dir(that.ships);

            } else {

            }

          });
      }

      //console.log(that.ships);
      //}
    },
    getStorages(sim_id, time_id, storages) {
      this.storages.length = 0;

      var storages_counter = 0;
      for (var i = 0; i < storages.length; i++) {
        axios.get('https://fvrwbtsci9.execute-api.eu-central-1.amazonaws.com/prd/storage/' + sim_id + '/' + time_id + '/' + storages[i].id)
          .then(function(response) {
            var connections = [];
            if (response.status == 200) {
              //that.getTimelines(response.data.id);
              for (var j = 0; j < response.data["connections"].length; j++) {
                connections.push(new Connection(response.data["connections"][j].id, response.data["connections"][j].weight));
              }
              var tempstorage = new Storage(response.data.id, new Size(response.data["size"].x, response.data["size"].y, response.data["size"].z), response.data.containers_max, response.data.containers_current, connections, response.data.status);

              tempstorage.setStoragePosition(storages_counter);
              that.storages.push(tempstorage);

              that.getStorageContainers(sim_id, time_id,tempstorage.id,storages_counter,0);

              storages_counter++;

              if(storages_counter == storages.length){
                   that.api_storages = true;
                   console.log("api storages");
                   console.log(that.api_storages);
              }

            } else {
              alert('server error with get docks please wait a moment')
            }
          });
      }

      //alert(this.storages.length+" storages length");
    },
    getStorageContainers(sim_id, time_id, id,index,token){

         //that.storages[index].containers = [];
         var container_storages_counter = 0;

              axios.get('https://fvrwbtsci9.execute-api.eu-central-1.amazonaws.com/prd/storage/' + sim_id + '/' + time_id + '/' + id + '/containers?limit=10&pagination_token='+token).then(function(response){

                   for (var j = 0; j < response.data["containers"].length; j++) {
                   that.storages[index].containers.push(new Container(response.data["containers"][j].id, response.data["containers"][j].description, response.data["containers"][j]["address"].location_id, response.data["containers"][j]["address"].x, response.data[
                       "containers"][j]["address"].y, response.data["containers"][j]["address"].z, response.data["containers"][j].weight, response.data["containers"][j].cargo_type));
                   }
                   //console.log(response.data["pagination_token"]);
                   //that.storages[index].containers.concat(containers);
                   if(response.data["pagination_token"] != null){
                        that.getStorageContainers(sim_id, time_id, id,index,response.data["pagination_token"]);
                   }else{
                             that.api_containers = true;
                             console.log("api storages containers");
                             console.log(that.api_storage_containers);
                   }
              });

    },
    getShipContainers(sim_id, time_id, id,index,token){

         var containers = [];
         var container_storages_counter = 0;

              axios.get('https://fvrwbtsci9.execute-api.eu-central-1.amazonaws.com/prd/ship/' + sim_id + '/' + time_id + '/' + id + '/containers/onboard?limit=10&pagination_token='+token).then(function(response){

                   for (var j = 0; j < response.data["containers"].length; j++) {
                   that.ships[index].containers.push(new Container(response.data["containers"][j].id, response.data["containers"][j].description, response.data["containers"][j]["address"].location_id, response.data["containers"][j]["address"].x, response.data[
                       "containers"][j]["address"].y, response.data["containers"][j]["address"].z, response.data["containers"][j].weight, response.data["containers"][j].cargo_type));
                   }
                   //console.log(response.data["pagination_url"]);
                   //that.ships[index].containers.concat(containers);
                   if(response.data["pagination_token"] != ""){
                        that.getShipContainers(sim_id, time_id, id,index,response.data["pagination_token"]);
                   }else{
                             that.api_containers = true;
                             console.log("api ship containers");
                             console.log(that.api_ship_containers);
                   }
              });

    },
    getDockContainers(sim_id, time_id, id,index,token){

         var containers = [];
         var container_storages_counter = 0;

              axios.get('https://fvrwbtsci9.execute-api.eu-central-1.amazonaws.com/prd/dock/' + sim_id + '/' + time_id + '/' + id + '/containers?limit=10&pagination_token='+token).then(function(response){

                   for (var j = 0; j < response.data["containers"].length; j++) {
                   that.docks[index].containers.push(new Container(response.data["containers"][j].id, response.data["containers"][j].description, response.data["containers"][j]["address"].location_id, response.data["containers"][j]["address"].x, response.data[
                       "containers"][j]["address"].y, response.data["containers"][j]["address"].z, response.data["containers"][j].weight, response.data["containers"][j].cargo_type));
                   }
                   //console.log(response.data["pagination_token"]);
                   //that.docks[index].containers.concat(containers);
                   if(response.data["pagination_token"] != null){
                        that.getDockContainers(sim_id, time_id, id,index,response.data["pagination_token"]);
                   }
                   else{

                   }
              });

    },
    play() {
      if (first_played) {
        first_played = false;
        //this.getSimulation();
        this.simulationLoop();
        that.getTasks();
      }
      this.playSim();
    },
    simulationLoop() {
      this.canvas = new Canvas(this.ctx);

      this.canvas.drawBackground();

      for (var i = 0; i < this.docks.length; i++) {
        this.docks[i].drawDock(this.ctx);
      }
      //console.log(this.docks);
      for (var i = 0; i < this.storages.length; i++) {
        this.storages[i].drawStorage(this.ctx);
      }

      var road = new Road(this.docks[this.docks.length - 1], this.storages[this.storages.length - 1]);
      //    var truck = new Truck(this.docks[0],this.storages[0]);
      //    truck.setDirection();
      road.drawRoad(this.ctx);
    },
    moveTruck(truck) {
      truck.move(this.ctx);
    },
    findStorage(storageid) {
      for (var i = 0; i < this.storages.length; i++) {
        if (storageid == this.storages[i].id) {
          return this.storages[i];
        }
      }
    },
    findDock(dockid) {
      for (var i = 0; i < this.docks.length; i++) {
        if (dockid == this.docks[i].id) {
          return this.docks[i];
        }
      }
    },
    findShip(shipid) {
      for (var i = 0; i < this.ships.length; i++) {
        if (shipid == this.ships[i].id) {
          return this.ships[i];
        }
      }
    },
    changeInit() {
      this.init = !this.init;
    },
    initSim() {
      var app = this;
      var init = {
        "docks": [],
        "storages": [],
        "ships": []
      }

      //set up the request data
      this.$children.forEach((child) => {
        if (child.ship) {
          init.ships.push({
            "id": child.ship.id,
            "eta": child.ship.eta,
            "x": child.ship.x,
            "y": child.ship.y,
            "z": child.ship.z,
            "filled": child.ship.filled,
            "unload": child.ship.unload,
            "load": child.ship.load
          });
        } else if (child.dock) {
          init.docks.push({
            "id": child.dock.id,
            "number_loaders": child.dock.number_loaders
          });
        } else if (child.storage){
          init.storages.push({
            "x": child.storage.x,
            "y": child.storage.y,
            "z": child.storage.z,
            "id": child.storage.id,
            "filled": child.storage.filled
          })
        }
      });
      var json = JSON.stringify(init);

      axios({
        method: 'put',
        url: 'https://fvrwbtsci9.execute-api.eu-central-1.amazonaws.com/prd/simulation/new-simulation',
        data: json,
      }).then(function(response) {
        if (response.status == 200) {
          app.timelineid = response.data.timeline_id;
          app.simulationid = response.data.simulation_id;
          app.changeInit();
          app.getSimulation();
        } else {
          alert("Fill in all fields!");
        }
      }).catch(function(error) {
        console.log(error);
      });

      //alternative
      // var xhr = new XMLHttpRequest();
      // xhr.open("PUT", "https://fvrwbtsci9.execute-api.eu-central-1.amazonaws.com/prd/simulation/new-simulation", true);
      // xhr.setRequestHeader('Content-type', 'application/json');
      // xhr.onload = function () {
      //     var response = JSON.parse(xhr.responseText);
      //     if (xhr.readyState == 4 && xhr.status == "200") {
      //       app.timelineid = response.data.timeline_id;
      //       app.simulationid = response.data.simulation_id;
      //       app.changeInit();
      //       app.getSimulation();
      //     } else {
      //         console.error(response);
      //     }
      // };
      // xhr.send(json);
    },
    getTasks() {
      axios.get('https://fvrwbtsci9.execute-api.eu-central-1.amazonaws.com/prd/tasks/' + this.simulationid + '/' + this.timelineid + '?limit=10&time_stamp=' + this.next_time_stamp)
        .then(function(response) {
          //console.log(response.data);

          if (response.status == 200) {

            //event_lengths = [];

            for (var i = 0; i < response.data.tasks.length; i++) {
              for (var j = 0; j < response.data.tasks[i].events.length; j++) {
                //TODO set the task id for events.task_id and tasks.id to replace counter
                events.push(new Event(response.data.tasks[i].events[j].id, response.data.tasks[i].events[j].type, response.data.tasks[i].events[j].message, response.data.tasks[i].events[j].time_stamp, counter));
                //event_lengths[i].push(response.data.tasks[i].events.length);
                that.all_events.push(events[j]);
              }
              that.tasks.push(new Task(counter, response.data.tasks[i].type, new Extra(response.data.tasks[i].extra.container_id, response.data.tasks[i].extra.source_id, response.data.tasks[i].extra.destination_id), response.data.tasks[i].description,
                response.data.tasks[i].status, response.data.tasks[i].start_time, response.data.tasks[i].end_time, events))
              events = [];
              counter++;
              that.schedule.push(response.data.tasks[i].start_time);
            }

            //var number = that.all_events.length*interval;
            //alert(number);
            //timer_tasks = setTimeout(that.getTasks(),number);

            //that.current_time = that.tasks[0].end_time;

            //console.log(that.tasks);
            //console.log(that.completedtasks);

            //that.events.push(that.tasks[0].events);

            that.next_time_stamp = response.data.next_time_stamp;
            //alert(that.next_time_stamp);
            that.time_stamp_token = '&time_stamp=';

          } else {
            //TODO: handle bad responses
            console.log("get tasks dropped out with error " + response.status);
          }
          //response.data.tasks[i].id

        });


    },
    playSim() {
      that = this;
      //var tempship;
      //var tempdock;
      //var tempstorage;
      //var tempcontainer;
      var container_check = false;

      if (play) {
      play = false;
        timer = setInterval(function() {

          // if(tempcontainer != undefined){
          //      tempcontainer.deselectContainer(that.ctx);
          //
          //      if(that.completedtasks[that.completedtasks.length-1].description == "Ship is leaving the dock"){
          //           tempship.removeShip(that.ctx);
          //           for(var j = 0;j < that.ships.length;j++){
          //               if(tempship.id == that.ships[j]){
          //                    that.ships.splice(j,1);
          //               }
          //          }
          //      }
          // }

          if (that.all_events.length > 0) {

            if (that.tasks.length != 0) {
              if (that.tasks[0].description == "relocate the container from the storage to the dock" && that.tasks[0].start_time == that.all_events[0].time_stamp) {

                var tempdock = that.findDock(that.tasks[0].extra.destination);
                var tempstorage = that.findStorage(that.tasks[0].extra.source);

                var tempcontainer = tempstorage.findContainer(that.tasks[0].extra.container);

                tempdock.containers.push(tempcontainer);

                var truck = new Truck(tempdock,tempstorage);

                truck.setDirection();
                truck.setDistance();
                truck.setStart('storage');

                canvas_sim_id = setInterval(frame, (((interval - 10) * (that.tasks[0].events.length - 1)) / truck.distance));

                function frame() {
                  truck.moveTruckStorageToDock(that.ctx);
                }
              } else if (that.tasks[0].description == "relocate the container from the dock to the storage" && that.tasks[0].start_time == that.all_events[0].time_stamp) {

                var tempdock = that.findDock(that.tasks[0].extra.source);
                var tempstorage = that.findStorage(that.tasks[0].extra.destination);

                var tempcontainer = tempdock.findContainer(that.tasks[0].extra.container);
                tempstorage.containers.push(tempcontainer);
                console.log(tempcontainer);

                var truck = new Truck(tempdock, tempstorage);

                truck.setDirection();
                truck.setDistance();

                truck.setStart('dock');

                canvas_sim_id = setInterval(frame, (((interval - 10) * (that.tasks[0].events.length) - 1) / truck.distance));

                function frame() {
                  truck.moveTruckDockToStorage(that.ctx);
                }

              } else if (that.tasks[0].description == "Ship arrives to the dock") {

                var tempship = that.findShip(that.tasks[0].extra.source);
                //tempship.drawShip(that.ctx);
                //alert(that.events[0].time_stamp);

                var tempdock = that.findDock(that.tasks[0].extra.destination);
                //console.log(that.events[0].time_stamp);
                //console.log(that.ships);
                tempdock.connected_ship_id = tempship.id;
                tempship.setDock(tempdock);
                //console.log(tempship);
                tempship.drawShip(that.ctx);

                //alert(tempdock.scheduled_ships);

              } else if (that.tasks[0].description == "Ship is leaving the dock") {

                var tempdock = that.findDock(that.tasks[0].extra.destination);
                var tempship = that.findShip(tempdock.connected_ship_id);
                //alert(tempship);

                tempship.removeShip(that.ctx);

              } else if (that.tasks[0].description == "unloading the container from the ship to dock") {

                var tempship = that.findShip(that.tasks[0].extra.source);
                //console.dir(tempship);
                var tempcontainer = tempship.findContainer(that.tasks[0].extra.container);
                var tempdock = that.findDock(that.tasks[0].extra.destination);
                //alert(tempcontainer.id);
                tempcontainer.selectContainer(that.ctx,'#A90000');
                tempdock.containers.push(tempcontainer);
                setTimeout(function(){tempcontainer.deselectContainer(that.ctx);},interval);

              } else if (that.tasks[0].description == "loading the container from the dock to the ship") {

                var tempdock = that.findDock(that.tasks[0].extra.source);
                var tempcontainer = tempdock.findContainer(that.tasks[0].extra.container);
                var tempship = that.findShip(that.tasks[0].extra.destination);
                console.dir(tempship);
                console.dir(tempdock);
                console.dir(that.storages);
                tempcontainer.setContainer(tempship.position_x+6,tempship.position_y+6,(tempship.width-12)/tempship.size.x,(tempship.height-12)/tempship.size.y);
                tempcontainer.selectContainer(that.ctx,'#006F0A');
                //container_check = true;
                tempship.containers.push(tempcontainer);
                setTimeout(function(){tempcontainer.deselectContainer(that.ctx);},(interval));
              }
            }

            that.completedevents.push(that.all_events.shift());
            that.tasks[0].events.shift();

            if (that.tasks[0].events.length == 0) {
              that.completedtasks.push(that.tasks.shift());
              clearInterval(canvas_sim_id);
            }

            if (that.all_events.length == 2){
                 that.getTasks();
            }

          } else {
            alert("simulation has ended");
            clearInterval(canvas_sim_id);
            play = true;
            clearInterval(timer);
          }

        }, interval);


      }
    },
    getShipByEta(eta) {

      for (var i = 0; i < this.ships.length; i++) {
        //console.log(this.ships[i]);
        if (this.ships[i].destination != undefined) {
          if (eta == this.ships[i].destination.estimated_arrival_time) {
            return this.ships[i];
          }
        }
      }
    },
    wait(ms) {
      var start = new Date().getTime();
      var end = start;
      while (end < start + ms) {
        end = new Date().getTime();
      }
    },
    pauseSimulation() {
      clearInterval(timer);
      clearInterval(timer_event);
      clearInterval(canvas_sim_id);
      play = true;
    },
    stepBackSimulation() {
      this.pauseSimulation();

      if (that.completedevents.length > 0) {

        if (that.completedevents[that.completedevents.length - 1].time_stamp >= that.tasks[0].start_time && that.completedevents[that.completedevents.length - 1].task_id == that.tasks[0].id) {
          var e = that.completedevents.pop();
          that.tasks[0].events.unshift(e);
          that.all_events.unshift(e);
          //document.getElementById('slider').value--;
        } else if (that.completedevents[that.completedevents.length - 1].time_stamp < that.tasks[0].start_time) {
          var e = that.completedevents.pop();
          that.tasks.unshift(that.completedtasks.pop());
          that.tasks[0].events.unshift(e);
          that.all_events.unshift(e);
          document.getElementById('slider').value--;
        } else if (that.completedevents[that.completedevents.length - 1].time_stamp == that.tasks[0].start_time && that.completedevents[that.completedevents.length - 1].task_id != that.tasks[0].id) {
          var e = that.completedevents.pop();
          that.tasks.unshift(that.completedtasks.pop());
          that.tasks[0].events.unshift(e);
          that.all_events.unshift(e);
          document.getElementById('slider').value--;
        }
      } else {
        alert("no more tasks to reverse");
      }
    },
    stepForwardSimulation() {
      this.pauseSimulation();
      if (that.all_events.length > 0) {
        that.completedevents.push(that.all_events.shift());
        that.tasks[0].events.shift();

        if (that.tasks[0].events.length == 0) {
          that.completedtasks.push(that.tasks.shift());
          document.getElementById('slider').value++;
        }
      } else {
        alert("no more tasks to perform");
      }
    },
    syncSimulation() {
      this.pauseSimulation();
      var ts = this.events[0].time_stamp;
      var sid = this.simulationid;
      var tid = this.timelineid;

      var test = {}
      axios({
        method: 'patch',
        url: 'https://r62t8jfw01.execute-api.eu-central-1.amazonaws.com/mock/sync',
        data: {
          'simulation_id': sid,
          'timeline_id': tid,
          'time_stamp': ts
        }
      }).then(function(response) {
         if(response.status == 200) {
           console.log('opsa');
            //TODO: success message maybe
         } else {
           console.log('kurec');
            //TODO: handle bad response
         }
      });
    },
    adjustTasksWithSlider() {
      that.pauseSimulation();
      that = this;
      var len = that.completedtasks.length;
      var val = document.getElementById('slider').value;

      if (len != val) {
        if (len > val) {
          //the user moves backwards the slider
          for (var i = len; i >= val; i--) {
            that.tasks.unshift(that.completedtasks.pop());
          }
        } else {
          //the user moves forwards the slider
          console.log(val);
          console.log(len);
          console.log(that.tasks.length);
          for (var i = len; i < val; i++) {
            if (len + that.tasks.length < val) {
              that.getTasks();
            }
            that.completedtasks.push(that.tasks.shift());
          }
        }
      }
      that.playSimulation();
    },
  },
  components: {
    'CanvasDrawingComponent': CanvasDrawingComponent
  }
}


</script>
<style lang="scss">
html{
  background-color: #eee;
}

#CanvasContainer {
    width: 100%;
    height: 80%;
    overflow: scroll;
    border: 1px solid black;
}

.buttons {
    width: 100%;
    height: 25%;
}

.progress-bar {
    width: 100%;
    height: 25%;
    background-color: white;
    display: flex;
    flex-direction: row;
    justify-content: center;
}

#wrapper {
    width: 100%;
    height: 25%;
}

#slider {
    position: inherit;
}

#app {
    height: 100%;
    width: 100%;
    font-family: 'Avenir', Helvetica, Arial, sans-serif;
    color: #2c3e50;
}

.container-fluid {
    border: 1px solid black;
    height: 100%;
    max-height: 100%;
}

.topSpace {
    margin-top: 2%;
}

#main-simulation {
    width: 70%;
    height: 100%;
    border: 1px solid black;
    border-radius: 7px;
}

#CanvasPart {
    width: 100%;
    height: 86%;
}

#InfoPart {
    width: 30%;
    height: 100%;
}

.init_components {
    height: 100%;
    width: 33%;
    float: left;
}

#sim {
    width: 100%;
    height: 100%;
}

#init {
    width: 100%;
    height: 100%;
    background-color: #eee;
}

.no-margin-bot {
  margin-bottom: 0;
}

.margin-bot {
  margin-bottom: 3%;
}

.form-component {
  border: 1px solid black;
  border-radius: 7px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}
</style>
