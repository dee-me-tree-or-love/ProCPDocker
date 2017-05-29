<template>
  <div class="fluid-container" id="app">
    <div class="init" v-if="init">
      <div class="col-md-4 topSpace text-center">
        <span>Number of ships: </span><input type="number" v-model="shipStr">
        <ShipFormComponent v-for="shipCount in shipCount" ref="ship{{shipCount}}"></ShipFormComponent>
      </div>
      <div class="col-md-4 topSpace text-center">

      </div>
      <div class="col-md-4 topSpace text-center">

      </div>
      <div class="col-md-12 text-center topSpace">
        <input type="button" value="New simulation" @click="">
      </div>
    </div>
    <div class="sim" v-else>
      <div class="col-md-8" id="CanvasPart">
        <CanvasComponent   @context="setContext" @componentsidebarcheck="setSidebarComponentBool" :completedtasks="completedtasks" :currentship="currentship" :currentdock="currentdock" :currentstorage="currentstorage" :tasks="tasks" :ships="ships" :docks="docks" :storages="storages" :storagesbool="storagesbool" :docksbool="docksbool" :eventsbool="eventsbool" :shipsbool="shipsbool"></CanvasComponent>
        <button @click="simulationLoop" >draw simulation</button>
        <button @click="getSimulation" >get simulation</button>
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
import Ship from './models/Ship.js';
import Dock from './models/Dock.js';
import Storage from './models/Storage.js';
import Size from './models/Size.js';
import Destination from './models/Destination.js';
import Event from './models/Event.js';
import Scope from './models/Scope.js';
import ConnectedStorage from './models/ConnectedStorage.js';
import Connection from './models/Connection.js';
import ScheduledShip from './models/ScheduledShip.js';
import Simulation from './models/Simulation.js';
import Canvas from './models/Canvas.js';

var that;


export default {
    name: 'app',
    mounted() {
         this.eventsbool= false,
         this.shipsbool= false,
         this.storagesbool= false,
         this.docksbool= true
         //this.waitForContext()
         //console.log("mounted")
         //this.waitForContext()
    },
    data () {
         return {
              currenttimeline : 'timeline1',
              ctx: null,
              tasks:[],
              completedtasks:[],
              ships:[new Ship("id","size","containers_max","containers_current","containers_unload","containers_load","destination","status")],
              docks:[new Dock("id","loaders_count","connected_storages","container_count","connected_ship_id","scheduled_ships")],
              storages:[new Storage("id","size","containers_max","containers_current","connections","status")],
              currentship:new Ship("id","size","containers_max","containers_current","containers_unload","containers_load","destination","status"),
              currentdock:new Dock("id","loaders_count","connected_storages","container_count","connected_ship_id","scheduled_ships"),
              currentstorage:new Storage("id","size","containers_max","containers_current","connections","status"),
              eventsbool: false,
              shipsbool: false,
              storagesbool: false,
              docksbool: false,
              canvas: null,
              init: true,
              shipStr: 0,
         }
    },

    computed:{
          events : function(){
               if(this.tasks.length > 0){
                 return this.tasks[0].events;
               }
          },
          shipCount: function() {
              return parseInt(this.shipStr);
          }
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
         setSidebarComponentBool(value){
              //alert(value);
              this.shipsbool= false;
              this.storagesbool= false;
              this.docksbool= false;
              this.eventsbool = false;

              //alert(value);

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
              console.log("dock: " + this.docksbool + ", ship: " + this.shipsbool + ", storage: " + this.storagesbool + ", event: " + this.eventsbool);
         },
        getSimulation(){

             that = this;

             axios.get('https://fvct5ola1b.execute-api.eu-central-1.amazonaws.com/dev/simulation/483e46a8-0994-4a39-9b57-612513468c76?scope=ships%2Cdocks%2Cstorages%2Ccontainer_count')
               .then(function(response){
                 console.log(response.data);

                 if(response.status == 200){
                      //that.getTimelines(response.data.id);
                      that.getDocks(response.data.id,response.data.current_timeline_id);
                      that.getStorages(response.data.id,response.data.current_timeline_id);
                      that.getShips(response.data.id,response.data.current_timeline_id);


                 }else{

                 }
                 //console.log(response.data.scope["ships"][0].eta);
                  //response.data.tasks[i].id

               });
        },
        getTimelines(sim_id){
                 axios.get('https://fvct5ola1b.execute-api.eu-central-1.amazonaws.com/dev/simulation/'+sim_id+'/timelines')
                    .then(function(response){
                      console.log(response.data);
                 });
        },
        getShips(sim_id,time_id){
             //for(var i = 0;i < response.data.scope["ships"].length;i++){///simulation/{simulation_id}/timelines/{timeline_id}/{ docks | ships | storages }/all
                 axios.get('https://r62t8jfw01.execute-api.eu-central-1.amazonaws.com/mock/simulation/'+sim_id+'/timelines/'+time_id+'/ships/all')
                    .then(function(response){
                      console.log(response.data);

                      if(response.status == 200){
                           //that.getTimelines(response.data.id);
                         for(var i = 0;i < response.data.ships.length;i++){

                              that.ships = [];

                              var tempship = new Ship(response.data.ships[i].id,new Size(response.data.ships[i]["size"].x, response.data.ships[i]["size"].y, response.data.ships[i]["size"].z),response.data.ships[i].containers_max,response.data.ships[i].containers_current,response.data.ships[i].containers_unload,response.data.ships[i].containers_load,new Destination(response.data.ships[i]["destination"].id,response.data.ships[i]["destination"].estimated_arrival_time),response.data.ships[i].status);

                              tempship.setDock(that.findDock(tempship.destination.id));
                              that.ships.push(tempship);
                         }
                      }else{

                      }
                      //that.ships.push(new Ship(id,size,containers_max,containers_current,containers_unload,containers_load,destination,status));
                 });
             //}
        },
        getDocks(sim_id,time_id){
             //for(var i = 0;i < response.data.scope["ships"].length;i++){///simulation/{simulation_id}/timelines/{timeline_id}/{ docks | ships | storages }/all
                 axios.get('https://r62t8jfw01.execute-api.eu-central-1.amazonaws.com/mock/simulation/'+sim_id+'/timelines/'+time_id+'/docks/all')
                    .then(function(response){
                      console.log(response.data);

                      var connectedstorages = [];
                      var scheduledships = [];
                      that.docks = [];

                      if(response.status == 200){
                           //that.getTimelines(response.data.id);
                         for(var i = 0;i < response.data.docks.length;i++){
                              for(var j = 0;j < response.data.docks[i]["connected_storages"].length;j++){
                                   connectedstorages.push(new ConnectedStorage(response.data.docks[i]["connected_storages"][j].id,response.data.docks[i]["connected_storages"][j].weight))
                              }
                              for(var j = 0;j < response.data.docks[i]["scheduled_ships"].length;j++){
                                   scheduledships.push(new ScheduledShip(response.data.docks[i]["scheduled_ships"][j].id,response.data.docks[i]["scheduled_ships"][j].time_arrived))
                              }



                              var tempdock = new Dock(response.data.docks[i].id,response.data.docks[i].loaders_count,connectedstorages,response.data.docks[i].container_count,response.data.docks[i].connected_ship_id,scheduledships);

                              tempdock.setY(i);
                              that.docks.push(tempdock);
                         }
                      }else{

                      }
                      //that.ships.push(new Ship(id,size,containers_max,containers_current,containers_unload,containers_load,destination,status));
                 });
             //}
        },
        getStorages(sim_id,time_id){
             //for(var i = 0;i < response.data.scope["ships"].length;i++){///simulation/{simulation_id}/timelines/{timeline_id}/{ docks | ships | storages }/all
                 axios.get('https://r62t8jfw01.execute-api.eu-central-1.amazonaws.com/mock/simulation/'+sim_id+'/timelines/'+time_id+'/storages/all')
                    .then(function(response){
                      console.log(response.data);



                      if(response.status == 200){


                           var connections = [];
                           that.storages = [];

                           for(var i = 0;i < response.data.storages.length;i++){
                              for(var j = 0;j < response.data.storages[i]["connections"].length;j++){
                                   connections.push(new Connection(response.data.storages[i]["connections"][j].id,response.data.storages[i]["connections"][j].weight));
                              }

                              var tempstorage = new Storage(response.data.storages[i].id,new Size(response.data.storages[i]["size"].x, response.data.storages[i]["size"].y, response.data.storages[i]["size"].z),response.data.storages[i].containers_max,response.data.storages[i].containers_current,connections,response.data.storages[i].status);
                              tempstorage.setStoragePosition(i);
                              that.storages.push(tempstorage);
                           }
                           }else{

                      }

                 });
             //}
        },

        simulationLoop(){

             //c = document.getElementById('canvas');

             //ctx = c.getContext('2d');
             //console.log(this.ctx);
             //this.getSimulation();

             this.canvas  = new Canvas(this.ctx);
             //var testship = new Ship("id","size","containers_max","containers_current","containers_unload","containers_load","destination","status");
             //var dock = new Dock("id","loaders_count","connected_storages","container_count","connected_ship_id","scheduled_ships");
             //var storage = new Storage("id","size","containers_max","containers_current","connections","status");

             this.canvas.drawBackground();

             //var tempship = new Ship("id","size","containers_max","containers_current","containers_unload","containers_load","destination","status");

             //tempship.setDock();
             //that.ships.push(tempship);

             for(var i = 0;i < 10;i++){
                  var dock = new Dock("id","loaders_count","connected_storages","container_count","connected_ship_id","scheduled_ships");
                  dock.setY(i);
                  this.docks.push(dock);

                  var storage = new Storage("id","size","containers_max","containers_current","connections","status");
                  storage.setStoragePosition(i);
                  this.storages.push(storage);

                  var tempship = new Ship("id","size","containers_max","containers_current","containers_unload","containers_load","destination","status");
                  tempship.setDock(dock);
                  this.ships.push(tempship);
             }


             for(var i = 0; i < this.docks.length;i++){
                  this.docks[i].drawDock(this.ctx);
             }

             for(var i = 0; i < this.storages.length;i++){
                 this.storages[i].drawStorage(this.ctx);
             }

             for(var i = 0; i < this.ships.length;i++){
                  this.ships[i].drawShip(this.ctx);
             }

             //testship.moveForward(ctx);
             //testship.drawShip(this.ctx);
             //dock.drawDock(this.ctx);
             //storage.drawStorage(this.ctx);

        },
        findDock(dockid){
             for(var i = 0;i < this.docks.length;i++){
                  if(dockid == this.docks[i].id){
                       return this.docks[i];
                  }
             }
        },
        // getSim() {
        //   let test = this.$refs.ship1.ship;
        // }
    }

}

</script>
<style lang="scss">
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
