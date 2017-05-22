<template>
  <div class="container" id="app">
       <CanvasComponent @tasks="setTasks"></CanvasComponent>
       <TaskContainerComponent v-bind:tasks="tasks"></TaskContainerComponent>
       <button v-on:click="getSimulation" >get mock simulation</button>
  </div>
</template>

<script>

import Task from './models/Task.js';
import Ship from './models/Ship.js';
import Dock from './models/Dock.js';
import Storage from './models/Storage.js';
import Size from './models/Size.js';

export default {
    name: 'app',
    data () {
         return {
              tasks:[],
              ships:[]
         }
    },
    methods:{
         setTasks(value){
             this.tasks = value;
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
