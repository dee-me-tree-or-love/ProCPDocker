<template>
  <div class="col-md-12 topSpace" id="EventContainer">
       <ul class="list-unstyled topSpace">
           <li>Event: {{ event.id }}</li>
           <li>Type: {{ event.type }}</li>
           <li>Message: {{ event.extra }}</li>
           <li>Timestamp: {{ event.description }}</li>
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
