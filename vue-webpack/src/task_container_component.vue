<template>
     <div class="col-md-12" id="TaskComponentContainer">
         <TaskComponent v-for="t in tasks" :task="t" :key="t.id"></TaskComponent>
    </div>
</template>
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

<style>
#TaskComponentContainer{
   height: 49.7%;
   width: 100%;
   overflow-y:scroll;
   overflow-x:hidden;
   border:1px solid black;
   overflow:false;
   border-radius: 7px;
}
</style>
