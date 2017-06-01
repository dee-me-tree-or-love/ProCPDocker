<template>
  <div class="col-md-12 topSpace" id="ShipComponentContainer">
    <ul class="list-unstyled">
      <li>Ship: {{ ship.id }}</li>
      <li>Ship size:  ( x: {{ ship.size.x }}, y: {{ ship.size.y}}, z: {{ ship.size.z}} )</li>
      <li>Max containers: {{ ship.containers_max }}</li>
      <li>Current containers: {{ ship.containers_current }}</li>
      <li>Containers to unload: {{ ship.containers_unload }}</li>
      <li>Containers to load: {{ ship.containers_load }}</li>
      <li>Destination: ( Dock id: {{ ship.destination.id }}, ETA: {{ ship.destination.estimated_arrival_time}} )</li>
      <li>Status: {{ ship.status }}</li>
    </ul>
  </div>
</template>

<script>
    export default {
      props: ['ship']
    }
</script>

<style>
#ShipComponentContainer{
    border: 1px solid black;
    width: 100%;
    height: 50%;
    overflow-y:scroll;
    overflow-x:hidden;
    border:1px solid black;
    overflow:false;
}
</style>
