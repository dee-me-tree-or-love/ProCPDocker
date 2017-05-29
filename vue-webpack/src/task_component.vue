<template>
     <div class="col-md-12 topSpace" id="TaskComponentContainer">
          <ul class="list-unstyled topSpace">
               <li>Task: {{ task.id }}</li>
               <li>Type: {{ task.type }}</li>
               <li>Extra: {{ task.extra }}</li>
               <li>Description: {{ task.description }}</li>
               <li>Status: {{ task.status }}</li>
               <li>Time: {{ task.time_to_complete }}</li>
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
