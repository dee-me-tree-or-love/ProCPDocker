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
      <input type="button" class="btn btn-success" style="margin-bottom:30px;" value="New simulation" @click="initSim">
    </div>
  </div>
  <div id="loading" v-else-if="!api_simulation">
    <h1>Docker Simulation</h1>
    <div class="loader"></div>
    <h3>your simulation is loading please wait...</h3>
  </div>
  <div id="sim" v-else>
    <div class="col-md-8" id="CanvasPart">
      <div class="col-md-12 topSpace" style="height:100%;border:1px solid black;" id="main-simulation">
        <div class="topSpace" id="CanvasContainer">
          <CanvasDrawingComponent @context="setContext" @componentsidebarcheck="setComponentBool" :ships="ships" :docks="docks" :storages="storages" :storagesbool="storagesbool" :docksbool="docksbool" :eventsbool="eventsbool" :shipsbool="shipsbool"></CanvasDrawingComponent>
        </div>
        <div id="wrapper" class="topSpace">
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
      api_storages:false,
      api_docks:false,
      api_ships:false,
      api_ship_containers: false,
      api_storage_containers: false,
      api_dock_containers: false,
      api_ship_containers_check: [],
      api_storage_containers_check: [],
      api_dock_containers_check: [],
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
    api_simulation: function() {
      //for debugging uncomment the line below
      //return true;
      if(this.api_ships && this.api_docks && this.api_storages && this.api_ship_containers && this.api_storage_containers && this.api_dock_containers){
        return true;
      } else {
        return false;
      }
    }
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
    getAll(){
         that = this;

         this.docks.length = 0;
         this.ships.length = 0;
         this.storages.length = 0;

         axios.all([that.getAllShips(),that.getAllDocks(),that.getAllStorages()])
           .then(axios.spread(function(r_ships,r_docks,r_storages) {
             if (r_ships.status == 200 && r_docks.status == 200 && r_storages.status == 200) {

                  that.setAllDocks(r_docks.data);
                  that.setAllStorages(r_storages.data);
                  that.setAllShips(r_ships.data);

             } else {
                  //TODO : some response if things dont work out
             }
         }));

    },
    getAllShips(){
         return axios.get('https://fvrwbtsci9.execute-api.eu-central-1.amazonaws.com/prd/simulation/' + this.simulationid + '/timelines/'+this.timelineid+'/ships/all');
    },
    getAllStorages(){
         return axios.get('https://fvrwbtsci9.execute-api.eu-central-1.amazonaws.com/prd/simulation/' + this.simulationid + '/timelines/'+this.timelineid+'/storages/all');
    },
    getAllDocks(){
         return axios.get('https://fvrwbtsci9.execute-api.eu-central-1.amazonaws.com/prd/simulation/' + this.simulationid + '/timelines/'+this.timelineid+'/docks/all');
    },
    setAllDocks(response){
         for(var i = 0;i < response.length;i++){
              var connectedstorages = [];
              var scheduledships = [];

              for (var j = 0; j < response[i]["connected_storages"].length; j++) {
                connectedstorages.push(new ConnectedStorage(response[i]["connected_storages"][j].storage_id, response[i]["connected_storages"][j].weight))
              }
              for (var j = 0; j < response[i]["scheduled_ships"].length; j++) {
                scheduledships.push(new ScheduledShip(response[i]["scheduled_ships"][j].ship_id, response[i]["scheduled_ships"][j].eta))
              }
              var tempdock = new Dock(response[i].id, response[i].loaders_count, connectedstorages, response[i].container_count, response[i].connected_ship_id, scheduledships);

              tempdock.setY(i);

              that.docks.push(tempdock);

              that.getDockContainers(that.simulationid, that.timelineid,tempdock.id,i,0);
         }

         for(var i = 0;i < this.docks.length;i++){
              this.api_dock_containers_check[i] = false;
         }

         this.api_docks = true;
    },
    setAllShips(response){
         for(var i = 0;i < response.length;i++){
              var tempship = new Ship(response[i].id, new Size(response[i]["size"].x, response[i]["size"].y, response[i]["size"].z), response[i].containers_max, response[i].containers_current, response[i].containers_unload, response[i]
                .containers_load, new Destination(response[i]["destination"].id, response[i]["destination"].estimated_arrival_time), response[i].status);

              var tempdock = that.findDock(tempship.destination.id);

              tempship.setDock(tempdock);

              that.ships.push(tempship);

              that.getShipContainers(that.simulationid, that.timelineid,tempship.id,i,0);
         }

         for(var i = 0;i < this.ships.length;i++){
              this.api_ship_containers_check[i] = false;
         }

         this.api_ships = true;
    },
    setAllStorages(response){
         for(var i = 0;i < response.length;i++){
              var connections = [];

              for (var j = 0; j < response[i]["connected_docks"].length; j++) {
                 connections.push(new Connection(response[i]["connected_docks"][j].id, response[i]["connected_docks"][j].weight));
              }
              var tempstorage = new Storage(response[i].id, new Size(response[i]["size"].x, response[i]["size"].y, response[i]["size"].z), response[i].containers_max, response[i].containers_current, connections, response[i].status);

              tempstorage.setStoragePosition(i);
              that.storages.push(tempstorage);

              that.getStorageContainers(that.simulationid, that.timelineid,tempstorage.id,i,0);
         }

         for(var i = 0;i < this.storages.length;i++){
              this.api_storage_containers_check[i] = false;
         }

         this.api_storages = true;
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
                             var containers_check = true;
                             that.api_storage_containers_check[index] = true;

                             for(var i = 0;i < that.api_storage_containers_check.length;i++){
                                  if(!that.api_storage_containers_check[i]){
                                       containers_check = false;
                                  }
                             }

                             if(containers_check){
                                  that.api_storage_containers = true;
                             }
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
                        var containers_check = true;
                        that.api_ship_containers_check[index] = true;

                        for(var i = 0;i < that.api_ship_containers_check.length;i++){
                             if(!that.api_ship_containers_check[i]){
                                  containers_check = false;
                             }
                        }

                        if(containers_check){
                             that.api_ship_containers = true;
                        }
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
                        var containers_check = true;
                        that.api_dock_containers_check[index] = true;

                        for(var i = 0;i < that.api_dock_containers_check.length;i++){
                             if(!that.api_dock_containers_check[i]){
                                  containers_check = false;
                             }
                        }

                        if(containers_check){
                             that.api_dock_containers = true;
                        }
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

      app.changeInit();

      axios({
        method: 'put',
        url: 'https://fvrwbtsci9.execute-api.eu-central-1.amazonaws.com/prd/simulation/new-simulation',
        data: json,
      }).then(function(response) {
        if (response.status == 200) {
          app.timelineid = response.data.timeline_id;
          app.simulationid = response.data.simulation_id;
          app.getAll();
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
      var container_check = false;

      if (play) {
      play = false;
        timer = setInterval(function() {
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
                var tempdock = that.findDock(that.tasks[0].extra.destination);
                tempdock.connected_ship_id = tempship.id;
                tempship.setDock(tempdock);
                tempship.drawShip(that.ctx);

              } else if (that.tasks[0].description == "Ship is leaving the dock") {

                var tempdock = that.findDock(that.tasks[0].extra.destination);
                var tempship = that.findShip(tempdock.connected_ship_id);
                tempship.removeShip(that.ctx);

              } else if (that.tasks[0].description == "unloading the container from the ship to dock") {

                var tempship = that.findShip(that.tasks[0].extra.source);
                var tempcontainer = tempship.findContainer(that.tasks[0].extra.container);
                var tempdock = that.findDock(that.tasks[0].extra.destination);
                tempcontainer.selectContainer(that.ctx,'#A90000');
                tempdock.containers.push(tempcontainer);
                setTimeout(function(){tempcontainer.deselectContainer(that.ctx);},(interval - 500));

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
                setTimeout(function(){tempcontainer.deselectContainer(that.ctx);},(interval - 500));
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
    stepForwardSimulation() {
      var that = this;
      that.pauseSimulation();

      if(that.tasks.length > 0){
        if(that.tasks[0].description == "relocate the container from the storage to the dock") {
          var tempdock = that.findDock(that.tasks[0].extra.destination);
          var tempstorage = that.findStorage(that.tasks[0].extra.source);
          var tempcontainer = tempstorage.findContainer(that.tasks[0].extra.container);
          tempdock.containers.push(tempcontainer);
        } else if(that.tasks[0].description == "relocate the container from the dock to the storage"){
          var tempdock = that.findDock(that.tasks[0].extra.source);
          var tempstorage = that.findStorage(that.tasks[0].extra.destination);
          var tempcontainer = tempdock.findContainer(that.tasks[0].extra.container);
          tempstorage.containers.push(tempcontainer);
        } else if(that.tasks[0].description == "unloading the container from the ship to dock"){
          var tempship = that.findShip(that.tasks[0].extra.source);
          var tempcontainer = tempship.findContainer(that.tasks[0].extra.container);
          var tempdock = that.findDock(that.tasks[0].extra.destination);
          tempdock.containers.push(tempcontainer);
        } else if(that.tasks[0].description == "loading the container from the dock to the ship"){
          var tempdock = that.findDock(that.tasks[0].extra.source);
          var tempcontainer = tempdock.findContainer(that.tasks[0].extra.container);
          var tempship = that.findShip(that.tasks[0].extra.destination);
          tempship.containers.push(tempcontainer);
        } else if(that.tasks[0].description == "Ship arrives to the dock"){
          var tempship = that.findShip(that.tasks[0].extra.source);
          var tempdock = that.findDock(that.tasks[0].extra.destination);
          tempdock.connected_ship_id = tempship.id;
          tempship.setDock(tempdock);
          tempship.drawShip(that.ctx);
        } else if(that.tasks[0].description == "Ship is leaving the dock"){
          var tempdock = that.findDock(that.tasks[0].extra.destination);
          var tempship = that.findShip(tempdock.connected_ship_id);
          tempship.removeShip(that.ctx);
        }
        var len = that.tasks[0].events.length - 1;
        while(that.all_events[0].time_stamp != that.tasks[0].events[len].time_stamp){
          that.all_events.shift();
        }
        that.all_events.shift();
        that.tasks.shift();
        if(that.tasks.length == 0){
          that.getTasks();
        }
      } else {
        alert("No more tasks to perform");
      }

      that.playSim();
    },
    stepBackSimulation() {
      var that = this;
      that.pauseSimulation();
      var reverseTask = that.completedtasks.length - 1;

      if(that.completedtasks.length > 0){
        if(that.completedtasks[reverseTask].description == "relocate the container from the storage to the dock") {
          var tempdock = that.findDock(that.completedtasks[reverseTask].extra.destination);
          var tempstorage = that.findStorage(that.completedtasks[reverseTask].extra.source);
          tempstorage.containers.push(tempdock.containers[tempdock.containers.length - 1]);
        } else if(that.completedtasks[reverseTask].description == "relocate the container from the dock to the storage"){
          var tempdock = that.findDock(that.completedtasks[reverseTask].extra.source);
          var tempstorage = that.findStorage(that.completedtasks[reverseTask].extra.destination);
          tempdock.containers.push(tempstorage.containers[tempstorage.containers.length - 1]);
        } else if(that.completedtasks[reverseTask].description == "unloading the container from the ship to dock"){
          var tempship = that.findShip(that.completedtasks[reverseTask].extra.source);
          var tempdock = that.findDock(that.completedtasks[reverseTask].extra.destination);
          tempship.containers.push(tempdock.containers[tempdock.containers.length - 1]);
        } else if(that.completedtasks[reverseTask].description == "loading the container from the dock to the ship"){
          var tempdock = that.findDock(that.completedtasks[reverseTask].extra.source);
          var tempship = that.findShip(that.completedtasks[reverseTask].extra.destination);
          tempdock.containers.push(tempship.containers[tempship.containers.length - 1]);
        } else if(that.completedtasks[reverseTask].description == "Ship arrives to the dock"){
          var tempship = that.findShip(that.completedtasks[reverseTask].extra.source);
          var tempdock = that.findDock(that.completedtasks[reverseTask].extra.destination);
          tempdock.connected_ship_id = "";
          tempship.removeShip(that.ctx);
        } else if(that.completedtasks[reverseTask].description == "Ship is leaving the dock"){
          var tempdock = that.findDock(that.completedtasks[reverseTask].extra.destination);
          var tempship = that.findShip(tempdock.connected_ship_id);
          tempdock.connected_ship_id = tempship.id;
          tempship.drawShip(that.ctx);
        }

        var len = (that.tasks[0].end_time - that.tasks[0].start_time) - 1;
        while(that.all_events[0].time_stamp != (that.tasks[0].end_time - 1)){
          that.all_events.shift();
        }
        that.all_events.shift();

        for (var i = len; i >= 0; i--) {
          that.all_events.unshift(that.completedevents[that.completedevents.length - 1]);
        }

        var temp = [];
        len = (that.completedtasks[0].end_time - that.completedtasks[0].start_time) - 1;
        for (var i = len; i >= 0; i--) {
          temp.unshift(that.completedevents.shift());
        }
        for (var i = 0; i <= len; i++) {
          that.completedtasks[reverseTask].events.unshift(temp[i]);
          that.all_events.unshift(temp[i]);
        }

        // console.log(that.all_events);
        // while(that.all_events[that.all_events.length - 1].time_stamp != that.tasks[0].start_time){
        //   that.tasks[0].events.unshift(that.all_events[that.all_events.length - 1]);
        //   that.all_events.splice(that.all_events.length - 1, 1);
        // }
        // that.tasks[0].events.unshift(that.all_events[that.all_events.length - 1]);
        // that.all_events.splice(that.all_events.length - 1, 1);
        //
        // console.log(that.all_events);
        // while (that.all_events[that.all_events.length - 1].time_stamp != that.completedtasks[0].start_time) {
        //   that.completedtasks[that.completedtasks.length - 1].events.unshift(that.all_events[that.all_events.length - 1]);
        //   that.all_events.splice(that.all_events.length - 1, 1);
        // }
        // that.completedtasks[that.completedtasks.length - 1].events.unshift(that.all_events[that.all_events.length - 1]);
        // that.all_events.splice(that.all_events.length - 1, 1);

        that.tasks.unshift(that.completedtasks[reverseTask]);
        that.completedtasks.splice(reverseTask, 1)
      } else {
        alert("No more tasks to reverse");
      }

      that.playSim();
    },
    syncSimulation() {
      app = this;
      app.pauseSimulation();
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
            //TODO: success message maybe
            alert("Sync successful");
            app.play();
         } else {
            //TODO: handle bad response
            console.log(response);
         }
      });
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

// loading page css
#loading {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.loader {
    border: 28px solid #f3f3f3; /* Light grey */
    border-top: 28px solid #3498db; /* Blue */
    border-radius: 50%;
    width: 240px;
    height: 240px;
    animation: spin 2s linear infinite;
}

@keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
}
</style>
