<template>
  <div class="fluid-container" id="app">
     <div class="init" v-if="init">
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
        <input type="button" value="New simulation" @click="initSim">
      </div>
    </div>
    <div class="sim" v-else>
      <div class="col-md-8" id="CanvasPart">
           <div class="col-md-12 topSpace" style="height:100%;border:1px solid black;" id="main-simulation">
                <div class="topSpace" id="CanvasContainer" >
                    <CanvasDrawingComponent  @context="setContext"  @componentsidebarcheck="setComponentBool"  :ships="ships" :docks="docks" :storages="storages" :storagesbool="storagesbool" :docksbool="docksbool" :eventsbool="eventsbool" :shipsbool="shipsbool"></CanvasDrawingComponent>
                </div>
                <div id="wrapper" class="topSpace">
                  <div class="progress-bar text-center">
                    <input type="range" min="0" max="100" value="0" step="1" id="slider" @mouseup="adjustTasksWithSlider"></input>
                  </div>
                  <div class="buttons text-center">
                    <button @click="stepBackSimulation"  class="btn btn-info btn-lg"><span class="glyphicon glyphicon-step-backward" aria-hidden="true"></span></button>
                    <button @click="play"  class="btn btn-success btn-lg"><span class="glyphicon glyphicon-play" aria-hidden="true"></span></button>
                    <button @click="pauseSimulation"  class="btn btn-warning btn-lg"><span class="glyphicon glyphicon-pause" aria-hidden="true"></span></button>
                    <button @click="stepForwardSimulation"  class="btn btn-info btn-lg"><span class="glyphicon glyphicon-step-forward" aria-hidden="true"></span></button>
                    <button @click="syncSimulation" class="btn btn-danger btn-lg"><span class="glyphicon glyphicon-refresh" aria-hidden="true"></span></button>
                  </div>
                </div>
           </div>
        <!-- <CanvasComponent   @context="setContext" @componentsidebarcheck="setSidebarComponentBool" :timelineid="timelineid" :simulationid="simulationid" :completedtasks="completedtasks" :completedevents="completedevents" :currentship="currentship" :currentdock="currentdock" :currentstorage="currentstorage" :tasks="tasks" :events="events" :ships="ships" :docks="docks" :storages="storages" :storagesbool="storagesbool" :docksbool="docksbool" :eventsbool="eventsbool" :shipsbool="shipsbool"></CanvasComponent> -->
        <!-- <button @click="simulationLoop" >get simulation</button> -->
      </div>
      <div class="col-md-4" id="InfoPart">
        <TaskContainerComponent :tasks="tasks"></TaskContainerComponent>
        <EventContainerComponent v-if="eventsbool" :events="events"></EventContainerComponent>
        <StorageComponent v-else-if="storagesbool" :storage="currentstorage"></StorageComponent>
        <DockComponent v-else-if="docksbool" :dock="currentdock"></DockComponent>
        <ShipComponent v-else :ship="currentship"></ShipComponent>
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

var that;
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
var first_played = true;// TODO: this will not be needed when


export default {
    name: 'app',
    mounted() {
         this.eventsbool= false,
         this.shipsbool= false,
         this.storagesbool= false,
         this.docksbool= true,
         this.simulationid = '483e46a8-0994-4a39-9b57-612513468c76',
         //this.getTimelines(this.simulationid),
         this.timelineid = '569f56b9-9ccc-469d-9f63-43a5bd8aef1f'
         //this.waitForContext()
         //this.waitForContext()
    },
    data () {
         return {
              timelineid : '569f56b9-9ccc-469d-9f63-43a5bd8aef1f',
              simulationid : '483e46a8-0994-4a39-9b57-612513468c76',
              currenttimeline : 'timeline1',
              ctx: null,
              tasks:[],
              schedule:[],
              completedtasks:[],
              ships:[new Ship("id","size","containers_max","containers_current","containers_unload","containers_load","destination","status")],
              docks:[new Dock("id","loaders_count","connected_storages","container_count","connected_ship_id","scheduled_ships")],
              storages:[new Storage("id","size","containers_max","containers_current","connections","status")],
              currentship:new Ship("id","size","containers_max","containers_current","containers_unload","containers_load","destination","status"),
              currentdock:new Dock("id","loaders_count","connected_storages","container_count","connected_ship_id","scheduled_ships"),
              currentstorage:new Storage("id","size","containers_max","containers_current","connections","status"),
              trucks:[],
              eventsbool: false,
              shipsbool: false,
              storagesbool: false,
              docksbool: false,
              canvas: null,
              init: true,
              shipStr: 1,
              storStr: 1,
              dockStr: 1,
              completedevents :[],
              empty :[],
              //current_time : 0,
              time_stamp_token : '',
              next_time_stamp : 0,
              interval_tasks : 2000,
              taskCheck:true,
              all_events: [],

         }
    },

    computed:{
          events : function(){
               if(this.tasks.length > 0){
                  return this.tasks[0].events;
             }else {
                  return this.empty;
             }
          },
          current_time : function(){
              return this.tasks[0].start_time;
          },
          interval_events: function() {
             return Math.floor(this.interval_tasks/this.events.length);
          },
          shipCount: function() {
              return parseInt(this.shipStr);
          },
          storageCount: function(){
              return parseInt(this.storStr);
          },
          dockCount: function(){
            return parseInt(this.dockStr);
          },
    },
    methods:{
      setContext(value){
            this.ctx = value;
            //alert(this.ctx);
            //for(var i = 0;i < this.ships.length;i++){
                 //this.ships[i].setY(i);
                 //this.ships[i].drawShip(this.ctx);
            //}
      },
      setComponentBool(value){
            //alert(value);
            this.shipsbool= false;
            this.storagesbool= false;
            this.docksbool= false;
            this.eventsbool = false;

            if(value.includes("ship")){
                 this.shipsbool = true;
                 var index = value.split("ship");
                 this.currentship = this.ships[index[1]];
            }else if (value.includes("dock")) {
                 this.docksbool = true;
                 var index = value.split("dock");
                 this.currentdock = this.docks[index[1]];
            }else if (value.includes("storage")) {
                 this.storagesbool = true;
                 var index = value.split("storage");
                 this.currentstorage = this.storages[index[1]];
            }else if (value.includes("event")) {
                 this.eventsbool = true;
            }

      },
      getSimulation(){

        //this.simulationid = '483e46a8-0994-4a39-9b57-612513468c76';
          that = this;
          axios.get('https://fvrwbtsci9.execute-api.eu-central-1.amazonaws.com/prd/simulation/'+this.simulationid+'?scope=ships%2Cdocks%2Cstorages%2Ccontainer_count')
            .then(function(response){
              if(response.status == 200){
                   console.log(response.data);
                   that.timelineid = response.data.current_timeline_id;
                   that.getDocks(response.data.id,response.data.current_timeline_id,response.data.scope.docks);
                   that.getStorages(response.data.id,response.data.current_timeline_id,response.data.scope.storages);
                   that.getShips(response.data.id,response.data.current_timeline_id,response.data.scope.ships);
                   //that.simulationLoop();
                   //console.log(that.completedevents);
                   //console.log(that.storages);
                   //console.log(that.ships);
              }else{
              }
            });
      },
      getTimelines(sim_id){
               axios.get('https://fvrwbtsci9.execute-api.eu-central-1.amazonaws.com/prd/simulation/'+sim_id+'/timelines')
                  .then(function(response){
                    this.timelineid = response.data.timelines.id;
               });
      },
      getShips(sim_id,time_id,ships){
        //for(var i = 0;i < response.data.scope["ships"].length;i++){///simulation/{simulation_id}/timelines/{timeline_id}/{ docks | ships | storages }/all
                 that = this;
                 that.ships = [];
                 for(var i = 0;i < ships.length;i++){
                      var ship = new Ship();
                      ship.id = ships[i].id;
                      that.ships.push(ship);
                 }
                 //alert(that.ships.length);
                 for(var i = 0; i < that.ships.length;i++){
                    axios.get('https://fvrwbtsci9.execute-api.eu-central-1.amazonaws.com/prd/ship/'+sim_id+'/'+time_id+'/'+that.ships[i].id)
                         .then(function(response){
                           if(response.status == 200){
                                //that.getTimelines(response.data.id);
                                   //var containers = [];
                                   that.getContainers(sim_id,time_id,'ship',response.data.id,'/onboard',i);
                                   //console.log(containers);
                                   var tempship = new Ship(response.data.id,new Size(response.data["size"].x, response.data["size"].y, response.data["size"].z),response.data.containers_max,response.data.containers_current,response.data.containers_unload,response.data.containers_load,new Destination(response.data["destination"].id,response.data["destination"].estimated_arrival_time),response.data.status);
                                   //TODO take this out and change over to production
                                   if(tempship.id == "72bc34f2-14c8-4245-b86e-0a5ea4687e9c" && tempship.destination != undefined){
                                        tempship.destination.estimated_arrival_time = 10;
                                   }
                                   tempship.setDock(that.findDock(tempship.destination.id));
                                   //console.log(tempship);
                                   that.ships.push(tempship);
                                   //console.log(tempship);
                                   //console.log(response);
                           }else{
                           }
                    });
               }
         //}
      },
      getDocks(sim_id,time_id,docks){
        //for(var i = 0;i < response.data.scope["ships"].length;i++){///simulation/{simulation_id}/timelines/{timeline_id}/{ docks | ships | storages }/all
          that = this;
          that.docks = [];
            for(var i = 0;i < docks.length;i++){
                 var dock = new Dock();
                 dock.id = docks[i].id;
                 that.docks.push(dock);
            }
            for(var i = 0; i < that.docks.length;i++){
               axios.get('https://fvrwbtsci9.execute-api.eu-central-1.amazonaws.com/prd/dock/'+sim_id+'/'+time_id+'/'+that.docks[i].id)
                    .then(function(response){
                      var connectedstorages = [];
                      var scheduledships = [];
                      if(response.status == 200){
                           //that.getTimelines(response.data.id);
                           for(var j = 0;j < response.data["connections"].length;j++){
                                connectedstorages.push(new ConnectedStorage(response.data["connections"][j].storage_id,response.data["connections"][j].weight))
                           }
                           for(var j = 0;j < response.data["scheduled_ships"].length;j++){
                                scheduledships.push(new ScheduledShip(response.data["scheduled_ships"][j].ship_id,response.data["scheduled_ships"][j].eta))
                           }
                           //alert(connectedstorages[0].id);
                           //alert(scheduledships[0].id);
                           var tempdock = new Dock(response.data.id,response.data.loaders_count,connectedstorages,response.data.container_count,response.data.connected_ship_id,scheduledships);
                           //alert(tempdock.connected_storages[0].id);
                           //alert(tempdock.scheduled_ships[0].id);
                           tempdock.setY(i);
                           tempdock.containers = that.getContainers(sim_id,time_id,'dock',tempdock.id,'',i);
                           that.docks[i] = tempdock;
                           //alert(that.docks[0].id);
                           //alert(that.docks[0].scheduled_ships);
                      }else{
                         alert('server error with get docks please wait a moment')
                      }
               });}
          //}
      },
      getStorages(sim_id,time_id,storages){
        this.storages = [];
           for(var i = 0;i < storages.length;i++){
                var storage = new Storage();
                storage.id = storages[i].id;
                that.storages.push(storage);
           }
           //alert(storages.length+" storages length");
           //console.log(storages);
           for(var i = 0; i < that.storages.length;i++){
              axios.get('https://fvrwbtsci9.execute-api.eu-central-1.amazonaws.com/prd/storage/'+sim_id+'/'+time_id+'/'+that.storages[i].id)
                   .then(function(response){
                     var connections = [];
                     if(response.status == 200){
                          //that.getTimelines(response.data.id);
                          for(var j = 0;j < response.data["connections"].length;j++){
                              connections.push(new Connection(response.data["connections"][j].id,response.data["connections"][j].weight));
                         }
                        var tempstorage = new Storage(response.data.id,new Size(response.data["size"].x, response.data["size"].y, response.data["size"].z),response.data.containers_max,response.data.containers_current,connections,response.data.status);
                        //alert(i);
                        tempstorage.containers = that.getContainers(sim_id,time_id,'storage',tempstorage.id,'',i);
                        tempstorage.setStoragePosition(i);
                        that.storages[i] = tempstorage;
                     }else{
                        alert('server error with get docks please wait a moment')
                     }
              });}
              //alert(this.storages.length+" storages length");
      },
      getContainers(sim_id,time_id,type,id,extra,index){
            //containers = [];
             axios.get('https://fvrwbtsci9.execute-api.eu-central-1.amazonaws.com/prd/'+type+'/'+sim_id+'/'+time_id+'/'+id+'/containers'+extra)
                  .then(function(response){
                   if(response.status == 200){
                         //that.getTimelines(response.data.id);
                        var containers = [];
                        for(var j = 0;j < response.data["containers"].length;j++){
                             containers.push(new Container(response.data["containers"][j].id,response.data["containers"][j].description,response.data["containers"][j]["address"].location_id,response.data["containers"][j]["address"].x,response.data["containers"][j]["address"].y,response.data["containers"][j]["address"].z,response.data["containers"][j].weight,response.data["containers"][j].cargo_type));
                        }
                        //console.log(response);
                        console.log(containers);
                        if(type == 'ship'){
                             that.ships[index].containers = containers;
                             console.log(that.ships[index].containers);
                        }else if(type == 'dock'){
                             that.docks[index].containers = containers;
                        }else {
                             that.storages[index].containers = containers;
                        }
                        //that.storages[i] = new Storage(response.data.id,new Size(response.data["size"].x, response.data["size"].y, response.data["size"].z),response.data.containers_max,response.data.containers_current,connections,response.data.status);
                        //alert(i);
                        //that.storages[i].setStoragePosition(i);
                        //that.storages[i] = tempstorage;
                   }else{
                       alert('server error with get containers please wait a moment')
                   }
                   //console.log(containers);
                   //return containers;
             });
             //console.log(containers);
             //return containers;
      },
      play(){
             if(first_played){
                  first_played = false;
                  this.getSimulation();
                  this.simulationLoop();
             }
             that.getTasks();
             this.playSim();
      },
      simulationLoop(){
          this.canvas  = new Canvas(this.ctx);
          //var testship = new Ship("id","size","containers_max","containers_current","containers_unload","containers_load","destination","status");
          //var dock = new Dock("id","loaders_count","connected_storages","container_count","connected_ship_id","scheduled_ships");
          //var storage = new Storage("id","size","containers_max","containers_current","connections","status");
          this.canvas.drawBackground();
          //var tempship = new Ship("id","size","containers_max","containers_current","containers_unload","containers_load","destination","status");
          //tempship.setDock();
          //that.ships.push(tempship);
       //    for(var i = 0;i < 10;i++){
       //         var dock = new Dock("id","loaders_count","connected_storages","container_count","connected_ship_id","scheduled_ships");
       //         dock.setY(i);
       //         this.docks.push(dock);
          //
       //         var storage = new Storage("id","size","containers_max","containers_current","connections","status");
       //         storage.setStoragePosition(i);
       //         this.storages.push(storage);
          //
       //         var tempship = new Ship("id","size","containers_max","containers_current","containers_unload","containers_load","destination","status");
       //         tempship.setDock(dock);
       //         this.ships.push(tempship);
       //    }
          for(var i = 0; i < this.docks.length;i++){
               this.docks[i].drawDock(this.ctx);
          }
          console.log(this.docks);
          for(var i = 0; i < this.storages.length;i++){
              this.storages[i].drawStorage(this.ctx);
          }
          console.log(this.storages);
       //    for(var i = 0; i < this.ships.length;i++){
       //         this.ships[i].drawShip(this.ctx);
       //    }
          var road = new Road(this.docks[this.docks.length-1],this.storages[this.storages.length-1]);
       //    var truck = new Truck(this.docks[0],this.storages[0]);
       //    truck.setDirection();
          road.drawRoad(this.ctx);
       //    truck.setDistance();
       //    truck.drawTruck(this.ctx);
       //    var pos = 0;
       //    canvas_sim_id = setInterval(frame, 33);
       //    var check = true;
       //
       //    function frame() {
       //       if (pos == truck.distance) {
       //             //clearInterval(id);
       //             check = false;
       //        } else if (pos == -1) {
       //                check = true;
       //        }
       //
       //        if(check){
       //             pos++;
       //             truck.moveTruckDockToStorage(that.ctx);
       //        }else if (!check) {
       //             pos--;
       //             truck.moveTruckStorageToDock(that.ctx);
       //        }
       //      }
          //testship.moveForward(ctx);
          //testship.drawShip(this.ctx);
          //dock.drawDock(this.ctx);
          //storage.drawStorage(this.ctx);
      },
      moveTruck(truck){
        truck.move(this.ctx);
      },
      findStorage(storageid){
           for(var i = 0;i < this.storages.length;i++){
                if(storageid == this.storages[i].id){
                     return this.storages[i];
                }
           }
      },
      findDock(dockid){
           for(var i = 0;i < this.docks.length;i++){
                if(dockid == this.docks[i].id){
                     return this.docks[i];
                }
           }
      },
      findShip(shipid){
           for(var i = 0;i < this.ships.length;i++){
                if(shipid == this.ships[i].id){
                     return this.ships[i];
                }
           }
      },
      changeInit() {
          this.init = !this.init;
      },
      initSim() {
          var shipArr = [];
          var dockArr = [];
          var storageArr = [];
          var app = this;

          //set up the request data
          this.$children.forEach((child) => {
              if(child.ship){
                  shipArr.push(child.ship);
              } else if(child.dock) {
                  dockArr.push(child.dock);
              } else {
                  storageArr.push(child.storage);
              }
          });
          var test = {
            "docks": dockArr,
            "storages": storageArr,
            "ships": shipArr
          };

          axios({
            method: 'put',
            url: 'https://fvrwbtsci9.execute-api.eu-central-1.amazonaws.com/prd/simulation/new-simulation',
            data: test,
          }).then(function(response) {
               if(response.status == 200) {
                  app.timelineid = response.data.timeline_id;
                  app.simulationid = response.data.simulation_id;
                  app.changeInit();
                  app.getSimulation();
               } else {
                  alert("Fill in all fields!");
               }
          }).catch(function(error) {
              console.log(error.response);
          });
       },
       getTasks() {
            axios.get('https://fvrwbtsci9.execute-api.eu-central-1.amazonaws.com/prd/tasks/'+this.simulationid+'/'+this.timelineid+'?limit=10&time_stamp='+this.next_time_stamp)
              .then(function(response){
               //console.log(response.data);

               if(response.status == 200){

                   //event_lengths = [];

                  for(var i = 0;i < response.data.tasks.length;i++){
                      for(var j = 0;j < response.data.tasks[i].events.length;j++){
                        //TODO set the task id for events.task_id and tasks.id to replace counter
                        events.push(new Event(response.data.tasks[i].events[j].id,response.data.tasks[i].events[j].type,response.data.tasks[i].events[j].message,response.data.tasks[i].events[j].time_stamp,counter));
                        //event_lengths[i].push(response.data.tasks[i].events.length);
                        that.all_events.push(events[j]);

                      }
                      that.tasks.push(new Task(counter,response.data.tasks[i].type,new Extra(response.data.tasks[i].extra.container_id,response.data.tasks[i].extra.source_id,response.data.tasks[i].extra.destination_id),response.data.tasks[i].description,response.data.tasks[i].status,response.data.tasks[i].start_time,response.data.tasks[i].end_time,events))
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



                  that.time_stamp_token = '&time_stamp=';

               } else {
                  //TODO: handle bad responses
                  console.log("get tasks dropped out with error "+response.status);
               }
                 //response.data.tasks[i].id

              });


       },
       playSim(){
            that = this;
            //var tempship;
            //var tempdock;

            if(play){
                 play = false;

                 timer = setInterval(function(){

                      if(that.all_events.length > 0){

                           if(that.tasks.length != 0){
                                if(that.tasks[0].description == "relocate the container from the storage to the dock" && that.tasks[0].start_time == that.all_events[0].time_stamp){

                                    var truck = new Truck(that.findDock(that.tasks[0].extra.destination),that.findStorage(that.tasks[0].extra.source));

                                    truck.setDirection();
                                    truck.setDistance();
                                    truck.setStart('storage');

                                    canvas_sim_id = setInterval(frame, (((interval-10)*(that.tasks[0].events.length-1))/truck.distance));

                                    function frame() {
                                             truck.moveTruckStorageToDock(that.ctx);
                                    }
                               }
                               else if(that.tasks[0].description == "relocate the container from the dock to the storage" && that.tasks[0].start_time == that.all_events[0].time_stamp){

                                    var truck = new Truck(that.findDock(that.tasks[0].extra.source),that.findStorage(that.tasks[0].extra.destination));

                                    truck.setDirection();
                                    truck.setDistance();

                                    truck.setStart('dock');

                                    canvas_sim_id = setInterval(frame, (((interval-10)*(that.tasks[0].events.length)-1)/truck.distance));

                                    function frame() {
                                             truck.moveTruckStorageToDock(that.ctx);
                                    }

                               }else if(that.tasks[0].description == "Ship arrives to the dock"){

                                    var tempship = that.getShipByEta(that.events[0].time_stamp);
                                    //tempship.drawShip(that.ctx);
                                    //alert(that.events[0].time_stamp);

                                    var tempdock = that.findDock(that.tasks[0].extra.destination);
                                    //console.log(that.events[0].time_stamp);
                                    //console.log(that.ships);
                                    tempdock.connected_ship_id = tempship.id;
                                    tempship.setDock(tempdock);
                                    console.log(tempship);
                                    tempship.drawShip(that.ctx);

                                    //alert(tempdock.scheduled_ships);

                               }
                               else if(that.tasks[0].description == "Ship is leaving the dock"){

                                    var tempdock = that.findDock(that.tasks[0].extra.destination);
                                    var tempship = that.findShip(tempdock.connected_ship_id);
                                    //alert(tempship);

                                    tempship.removeShip(that.ctx);
                               }
                               else if(that.tasks[0].description == "unloading the container from the ship to dock"){
                                    var tempship = that.findShip(that.tasks[0].extra.source);
                                    var tempcontainer = tempship.findContainer(that.tasks[0].extra.container);
                                    var tempdock = that.findDock(that.tasks[0].extra.destination);
                                    tempdock.containers.push(tempcontainer);
                               }
                               else if(that.tasks[0].description == "loading the container from the dock to the ship"){
                                    var tempdock = that.findShip(that.tasks[0].extra.destination);
                                    var tempcontainer = tempship.findContainer(that.tasks[0].extra.container);
                                    var tempship = that.findDock(that.tasks[0].extra.source);

                                    tempship.containers.push(tempcontainer);
                               }
                           }

                           that.completedevents.push(that.all_events.shift());
                           that.tasks[0].events.shift();

                           if(that.tasks[0].events.length == 0){
                                that.completedtasks.push(that.tasks.shift());
                                clearInterval(canvas_sim_id);
                           }

                      }else{
                           alert("press play to get more tasks");
                           clearInterval(canvas_sim_id);
                           play = true;
                           clearInterval(timer);
                      }

                 },interval);


            }
       },
      playEvent(n){
            var inter = 2900;

            that = this;
            inter = (inter)/n;

            timer_event = setInterval(function (){

                      var tempevent = that.tasks[0].events.shift();

                      if(that.events.length > 0){
                           that.completedevents.push(tempevent);
                      }//else{
                           //clearInterval(timer_event);
                      //}
            },inter);
       },
      getShipByEta(eta){

            for(var i = 0;i < this.ships.length;i++){
                 //console.log(this.ships[i]);
                 if(this.ships[i].destination != undefined){
                      if(eta == this.ships[i].destination.estimated_arrival_time){
                          return this.ships[i];
                      }
                 }
            }
       },
      wait(ms){
            var start = new Date().getTime();
            var end = start;
            while(end < start + ms) {
                 end = new Date().getTime();
            }
       },
      pauseSimulation(){
            clearInterval(timer);
            clearInterval(timer_event);
            clearInterval(canvas_sim_id);
            play = true;
       },
      stepBackSimulation(){
            this.pauseSimulation();

            if(that.completedevents.length > 0){

                 if(that.completedevents[that.completedevents.length-1].time_stamp >= that.tasks[0].start_time && that.completedevents[that.completedevents.length-1].task_id == that.tasks[0].id){
                      var e = that.completedevents.pop();
                      that.tasks[0].events.unshift(e);
                      that.all_events.unshift(e);
                      //document.getElementById('slider').value--;
                 }else if(that.completedevents[that.completedevents.length-1].time_stamp < that.tasks[0].start_time){
                      var e = that.completedevents.pop();
                      that.tasks.unshift(that.completedtasks.pop());
                      that.tasks[0].events.unshift(e);
                      that.all_events.unshift(e);
                      document.getElementById('slider').value--;
                 }else if(that.completedevents[that.completedevents.length-1].time_stamp == that.tasks[0].start_time && that.completedevents[that.completedevents.length-1].task_id != that.tasks[0].id){
                      var e = that.completedevents.pop();
                      that.tasks.unshift(that.completedtasks.pop());
                      that.tasks[0].events.unshift(e);
                      that.all_events.unshift(e);
                      document.getElementById('slider').value--;
                 }
            }else {
                 alert("no more tasks to reverse");
            }
       },
      stepForwardSimulation(){
            this.pauseSimulation();
            if(that.all_events.length > 0){
                 that.completedevents.push(that.all_events.shift());
                 that.tasks[0].events.shift();

                 if(that.tasks[0].events.length == 0){
                      that.completedtasks.push(that.tasks.shift());
                      document.getElementById('slider').value++;
                 }
            }else {
                 alert("no more tasks to perform");
            }
       },
      syncSimulation(){
          // this.pauseSimulation();
          // var ts = this.
          // var sid = this.simulationid;
          // var tid = this.timelineid;
          //
          // var test = {}
          // axios({
          //   method: 'patch',
          //   url: 'https://r62t8jfw01.execute-api.eu-central-1.amazonaws.com/mock/sync',
          //   data: {
          //     'simulation_id': sid,
          //     'timeline_id': tid,
          //     'time_stamp': ts
          //   }
          // }).then(function(response) {
          //    if(response.status == 200) {
          //       //TODO: success message maybe
          //    } else {
          //       //TODO: handle bad response
          //    }
          // });
       },
      adjustTasksWithSlider() {
          that.pauseSimulation();
          that = this;
          var len = that.completedtasks.length;
          var val = document.getElementById('slider').value;

          if(len != val) {
              if(len > val) {
               //the user moves backwards the slider
               for(var i = len; i >= val; i--) {
                   that.tasks.unshift(that.completedtasks.pop());
               }
              } else {
               //the user moves forwards the slider
               console.log(val);
               console.log(len);
               console.log(that.tasks.length);
               for(var i = len; i < val; i++) {
                   if(len + that.tasks.length < val) {
                        that.getTasks();
                   }
                   that.completedtasks.push(that.tasks.shift());
               }
              }
          }
          that.playSimulation();
       },
 },
 components:{
       'CanvasDrawingComponent': CanvasDrawingComponent
 }
}


</script>
<style lang="scss">
#CanvasContainer{
    width: 100%;
    height: 80%;
    overflow: scroll;
    border: 1px solid black;
}

.buttons{
 width: 100%;
 height: 25%;
}

.progress-bar{
 width: 100%;
 height: 25%;
 background-color: white;
 display: flex;
 flex-direction: row;
 justify-content: center;
}

#wrapper{
 width: 100%;
 height: 25%;
}

#slider{
 position: inherit;
}

#app {
    height: 100%;
    width: 100%;
    font-family: 'Avenir', Helvetica, Arial, sans-serif;
    color: #2c3e50;
}

.container-fluid{
     border: 1px solid black;
     height: 100%;
     max-height: 100%
}

.topSpace{
    margin-top: 2%;
}

#main-simulation{
     height:100%;
     border:1px solid black;
}

#CanvasPart {
    height: 87%;
}

#InfoPart {
    height: 87%;
}

.init_components{
  height: 100%;
  width: 33%;
  float: left;
}
</style>
