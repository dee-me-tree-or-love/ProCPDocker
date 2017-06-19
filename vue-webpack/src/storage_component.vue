<template>
  <div class="col-md-12 topSpace" id="StorageComponentContainer">
    <ul class="list-unstyled">
      <li>Storage: {{ storage.id }}</li>
      <!-- <li>Storage size: ( x: {{ storage.size.x }}, y: {{ storage.size.y}}, z: {{ storage.size.z}} )</li> -->
      <li>Maximum containers: {{ storage.containers_max }}</li>
      <li>Current containers: {{ storage.containers_current }}</li>
      <!-- <li>Connections: (connection id : {{ storage.connections[0].id}} , connection weight : {{storage.connections[0].weight}})</li> -->
      <li>Status: {{ storage.status }}</li>
    </ul>
  </div>
</template>

<script>

     import Size from './models/Size.js';
     import Connection from './models/Connection.js';

    export default {
      props: ['storage']
    }
</script>

<style>
    #StorageComponentContainer {
        border: 1px solid black;
        width: 100%;
        height: 49%;
        border-radius: 7px;
    }
</style>
