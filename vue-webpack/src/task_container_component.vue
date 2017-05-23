<template>
     <div class="col-md-3" style="top:270px;height:255px;overflow-y:scroll;overflow-x:hidden;border:1px solid black;overflow:false" id="task-column">
         <TaskComponent v-for="t in tasks" v-bind:task="t" v-bind:key="t.id"></TaskComponent>
    </div>
</template>
<script src="classes.js"></script>
<script>


     import Task from './models/Task.js';
     import TaskComponent from './task_component.vue';

     export default {
          props:['tasks'],
          data() {
               return {

               }
          },
          components: {
               'TaskComponent': TaskComponent
          }
     }
</script>
