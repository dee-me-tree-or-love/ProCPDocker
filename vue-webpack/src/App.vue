<template>
  <div class="fluid-container" id="app">
    <!-- <div class="init" v-if="init">
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
    <div class="sim" v-else>-->
      <div class="col-md-8" id="CanvasPart">
        <CanvasComponent   @context="setContext" @componentsidebarcheck="setSidebarComponentBool" :timelineid="timelineid" :simulationid="simulationid" :completedtasks="completedtasks" :completedevents="completedevents" :currentship="currentship" :currentdock="currentdock" :currentstorage="currentstorage" :tasks="tasks" :events="events" :ships="ships" :docks="docks" :storages="storages" :storagesbool="storagesbool" :docksbool="docksbool" :eventsbool="eventsbool" :shipsbool="shipsbool"></CanvasComponent>
        <button @click="getSimulation" >get simulation</button>
      </div>
      <div class="col-md-4" id="InfoPart">
        <TaskContainerComponent :tasks="tasks"></TaskContainerComponent>
        <EventContainerComponent v-if="eventsbool" :events="events"></EventContainerComponent>
        <StorageComponent v-else-if="storagesbool" :storage="currentstorage"></StorageComponent>
        <DockComponent v-else-if="docksbool" :dock="currentdock"></DockComponent>
        <ShipComponent v-else :ship="currentship"></ShipComponent>
      </div>
    <!-- </div> -->
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
var sim_id_global;
var timeline_id_global;


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
         //console.log("mounted")
         //this.waitForContext()
    },
    data () {
         return {
              timelineid : '569f56b9-9ccc-469d-9f63-43a5bd8aef1f',
              simulationid : '483e46a8-0994-4a39-9b57-612513468c76',
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

              console.log(this.docks[0]);

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

             //this.simulationid = '483e46a8-0994-4a39-9b57-612513468c76';

             that = this;

             axios.get('https://fvrwbtsci9.execute-api.eu-central-1.amazonaws.com/prd/simulation/'+this.simulationid+'?scope=ships%2Cdocks%2Cstorages%2Ccontainer_count')
               .then(function(response){
                 console.log(response.data);

                 if(response.status == 200){
                      //that.getTimelines(response.data.id);
                      that.timelineid = response.data.current_timeline_id;

                      that.getDocks(response.data.id,response.data.current_timeline_id,response.data.scope.docks);
                      that.getStorages(response.data.id,response.data.current_timeline_id,response.data.scope.storages);
                      that.getShips(response.data.id,response.data.current_timeline_id,response.data.scope.ships);

                      that.simulationLoop();
                 }else{

                 }
                 //console.log(response.data.scope["ships"][0].eta);
                  //response.data.tasks[i].id

               });
        },
        getTimelines(sim_id){
                 axios.get('https://fvrwbtsci9.execute-api.eu-central-1.amazonaws.com/prd/simulation/'+sim_id+'/timelines')
                    .then(function(response){
                      console.log(response.data);
                      this.timelineid = response.data.timelines.id;
                 });
        },
        getShips(sim_id,time_id,ships){
             //for(var i = 0;i < response.data.scope["ships"].length;i++){///simulation/{simulation_id}/timelines/{timeline_id}/{ docks | ships | storages }/all

                           that.ships = [];

                           for(var i = 0;i < ships.length;i++){
                                var ship = new Ship();
                                ship.id = ships[i].id;
                                that.ships.push(ship);
                           }


                           for(var i = 0; i < that.ships.length;i++){
                              axios.get('https://fvrwbtsci9.execute-api.eu-central-1.amazonaws.com/prd/ship/'+sim_id+'/'+time_id+'/'+that.ships[i].id)
                                   .then(function(response){
                                     console.log(response.data);

                                     if(response.status == 200){
                                          //that.getTimelines(response.data.id);


                                             var tempship = new Ship(response.data.id,new Size(response.data["size"].x, response.data["size"].y, response.data["size"].z),response.data.containers_max,response.data.containers_current,response.data.containers_unload,response.data.containers_load,new Destination(response.data["destination"].id,response.data["destination"].estimated_arrival_time),response.data.status);

                                             tempship.setDock(that.findDock(tempship.destination.id));
                                             that.ships.push(tempship);

                                     }else{

                                     }

                              });
                         }
             //}
        },
        getDocks(sim_id,time_id,docks){
             //for(var i = 0;i < response.data.scope["ships"].length;i++){///simulation/{simulation_id}/timelines/{timeline_id}/{ docks | ships | storages }/all

                      that.docks = [];

                           for(var i = 0;i < docks.length;i++){
                                var dock = new Dock();
                                dock.id = docks[i].id;
                                that.docks.push(dock);
                           }

                           for(var i = 0; i < that.docks.length;i++){
                              axios.get('https://fvrwbtsci9.execute-api.eu-central-1.amazonaws.com/prd/dock/'+sim_id+'/'+time_id+'/'+that.docks[i].id)
                                   .then(function(response){
                                     console.log(response.data);

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
                                          that.docks.push(tempdock);

                                          //alert(that.docks[0].id);
                                          //alert(that.docks[0].scheduled_ships);

                                     }else{
                                        alert('server error with get docks please wait a moment')
                                     }

                              });}
             //}
        },
        getStorages(sim_id,time_id,storages){
             //for(var i = 0;i < response.data.scope["ships"].length;i++){///simulation/{simulation_id}/timelines/{timeline_id}/{ docks | ships | storages }/all
                  //console.log(response.data);
                  that.storages = [];

                       for(var i = 0;i < storages.length;i++){
                            var storage = new Storage();
                            storage.id = storages[i].id;
                            that.storages.push(storage);
                       }

                       for(var i = 0; i < that.storages.length;i++){
                          axios.get('https://fvrwbtsci9.execute-api.eu-central-1.amazonaws.com/prd/storage/'+sim_id+'/'+time_id+'/'+that.storages[i].id)
                               .then(function(response){
                                 console.log(response.data);

                                 var connections = [];

                                 if(response.status == 200){
                                      //that.getTimelines(response.data.id);
                                      for(var j = 0;j < response.data["connections"].length;j++){
                                          connections.push(new Connection(response.data["connections"][j].id,response.data["connections"][j].weight));
                                     }

                                    var tempstorage = new Storage(response.data.id,new Size(response.data["size"].x, response.data["size"].y, response.data["size"].z),response.data.containers_max,response.data.containers_current,connections,response.data.status);

                                    tempstorage.setStoragePosition(i);
                                    that.storages.push(tempstorage);

                                 }else{
                                    alert('server error with get docks please wait a moment')
                                 }

                          });}

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
