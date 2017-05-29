<template>
     <div class="col-md-12 topSpace" id="TaskComponentContainer">
          <ul class="list-unstyled topSpace">
               <li>task id : {{ task.id }}</li>
               <li>task type : {{ task.type }}</li>
               <li>task extra : {{ task.extra }}</li>
               <li>task description : {{ task.description }}</li>
               <li>task status : {{ task.status }}</li>
               <li>task time : {{ task.time_to_complete }}</li>
          </ul>
     </div>
</template>

<script>
     export default{
          props: ['task']
     }
</script>

<style media="screen">
    #TaskComponentContainer {
        border: 1px solid black;
    }
</style>
