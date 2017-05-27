<template>
  <div class="container" id="app">
       <CanvasComponent :completedtasks="completedtasks" :currentship="currentship" :currentdock="currentdock" :currentstorage="currentstorage" :tasks="tasks" :ships="ships" :docks="docks" :storages="storages" :storagesbool="storagesbool" :docksbool="docksbool" :eventsbool="eventsbool" :shipsbool="shipsbool"></CanvasComponent>
       <EventContainerComponent v-if="eventsbool" :events="events"></EventContainerComponent>
       <TaskContainerComponent :tasks="tasks"></TaskContainerComponent>
       <StorageComponent v-if="storagesbool" :storage="currentstorage"></StorageComponent>
       <DockComponent v-if="docksbool" :dock="currentdock"></DockComponent>
       <ShipComponent v-if="shipsbool" :ship="currentship"></ShipComponent>
  </div>
</template>

<script>

import Task from './models/Task.js';
import Ship from './models/Ship.js';
import Dock from './models/Dock.js';
import Storage from './models/Storage.js';
import Size from './models/Size.js';
import Event from './models/Event.js'

export default {
    name: 'app',
    data () {
         return {
              tasks:[],
              completedtasks:[],
              ships:[new Ship("id","size","containers_max","containers_current","containers_unload","containers_load","destination","status")],
              docks:[new Dock("id","loaders_count","connected_storages","container_count","connected_ship_id","scheduled_ships")],
              storages:[new Storage("id","size","containers_max","containers_current","connections","status")],
              currentship:new Ship("id","size","containers_max","containers_current","containers_unload","containers_load","destination","status"),
              currentdock:new Dock("id","loaders_count","connected_storages","container_count","connected_ship_id","scheduled_ships"),
              currentstorage:new Storage("id","size","containers_max","containers_current","connections","status"),
              // eventsbool: true,
              // shipsbool: false,
              // storagesbool: false,
              // docksbool: false,
         }
    },

    computed:{
          events : function(){
               if(this.tasks.length > 0){
                 return this.tasks[0].events;
               }
          }
    },
    methods:{
        getSimulation(){
             axios.get('https://r62t8jfw01.execute-api.eu-central-1.amazonaws.com/mock/simulation/sim1/?scope=ships')
               .then(function(response){
                 console.log(response.data);

                 //for(var i = 0;i < response.data.ships.length;i++){
                     // ships.push(new Ship(id,size,containers_max,containers_current,containers_unload,containers_load,destination,status))
                     // counter++;
                // }
                  //response.data.tasks[i].id

               });
        }
    }

}

</script>
<style lang="scss">
#app {
     font-family: 'Avenir', Helvetica, Arial, sans-serif;
     color: #2c3e50;
}

.container{
     border: 1px solid black;
     height: 100%;
     max-height: 100%
}

#task-column{
     height:100%;
     overflow-y:scroll;
     overflow-x:hidden;
     border:1px solid black;
     overflow:false;
}

#main-simulation{
     height:100%;
     border:1px solid black;
}
</style>
