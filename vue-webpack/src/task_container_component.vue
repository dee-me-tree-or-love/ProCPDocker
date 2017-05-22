<template>
     <div class="col-md-3" style="height:100%;overflow-y:scroll;overflow-x:hidden;border:1px solid black;overflow:false" id="task-column">
         <TaskComponent v-for="t in tasks" v-bind:task="t" v-bind:key="t.id"></TaskComponent>
    </div>
</template>
<script src="classes.js"></script>
<script>


     import Task from './classes.js';
     import TaskComponent from './task_component.vue';

     export default {
          data() {
               return {
                    tasks: [new Task(1,"type","extra","description", "status","time_to_complete","events"),new Task(2,"type","extra","description", "status","time_to_complete","events")]
               }
          },
          components: {
               'TaskComponent': TaskComponent
          }
     }
</script>
