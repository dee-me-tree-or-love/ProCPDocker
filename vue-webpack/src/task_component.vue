<template>
     <div style="width:100%;border:1px solid black;margin-top:10px;margin-bottom:10px">
          <ul class="list-unstyled">
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
