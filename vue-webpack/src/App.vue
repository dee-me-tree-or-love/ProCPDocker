<template>
  <div class="container" id="app">
       <CanvasComponent @tasks="setTasks" :ships="ships" :docks="docks" :storages="storages"></CanvasComponent>
       <!-- TODO: add other components and fix currentTask problem -->

       <EventContainerComponent :events="events"></EventContainerComponent>
       <TaskContainerComponent :tasks="tasks"></TaskContainerComponent>
       <button @click="getSimulation" >get mock simulation</button>
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
              ships:[new Ship("id","size","containers_max","containers_current","containers_unload","containers_load","destination","status")],
              docks:[new Dock("id","loaders_count","connected_storages","container_count","connected_ship_id","scheduled_ships")],
              storages:[new Storage("id","size","containers_max","containers_current","connections","status")],
              events:[],
         }
    },
    methods:{
         setTasks(value){
             this.tasks = value;
             if(this.tasks.length > 0){
                  this.events = tasks[0].events;
             }

        },
        getSimulation(){
             axios.get('https://r62t8jfw01.execute-api.eu-central-1.amazonaws.com/mock/simulation/sim1')
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
