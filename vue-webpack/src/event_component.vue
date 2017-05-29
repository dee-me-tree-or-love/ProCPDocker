<template>
  <div class="col-md-12 topSpace" id="EventContainer">
       <ul class="list-unstyled topSpace">
           <li>event id : {{ event.id }}</li>
           <li>event type : {{ event.type }}</li>
           <li>event message : {{ event.extra }}</li>
           <li>event timestamp : {{ event.description }}</li>
      </ul>
  </div>
</template>

<script>
  export default {
    props: ['event']
  }
</script>

<style media="screen">
    #EventContainer {
        border: 1px solid black;
    }
</style>
