<template>
  <div class="container" style="border:1px solid black;" id="app">
       <CanvasComponent @tasks="setTasks"></CanvasComponent>
       <TaskContainerComponent v-bind:tasks="tasks"></TaskContainerComponent>
  </div>
</template>

<script>

import Task from './models/Task.js';

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
    }

}
</script>
<style lang="scss">
#app {
     font-family: 'Avenir', Helvetica, Arial, sans-serif;
     color: #2c3e50;
     margin-top: 60px;
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
