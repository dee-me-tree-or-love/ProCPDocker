<template>
     <div class="col-md-12 topSpace" id="TaskComponent">
          <ul class="list-unstyled topSpace">
               <li>Task: {{ task.id }}</li>
               <li>Type: {{ task.type }}</li>
               <li>Extra: {{ task.extra }}</li>
               <li>Description: {{ task.description }}</li>
               <li>Status: {{ task.status }}</li>
               <li>Start Time: {{ task.start_time }}</li>
               <li>End Time: {{ task.end_time }}</li>
          </ul>
     </div>
</template>

<script>
     export default{
          props: ['task']
     }
</script>

<style media="screen">
    #TaskComponent {
        border: 1px solid black;

    }
</style>
