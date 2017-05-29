<template>
  <div class="col-md-12 topSpace" id="DockComponentContainer">
    <ul class="list-unstyled">
        <li>Dock: {{ dock.id }}</li>
        <li>Loaders : {{ dock.loaders_count }}</li>
        <li>connected storages : (connected storage id : {{ dock.connected_storages[0].id }}, weight :  {{ dock.connected_storages[0].weight }})</li>
        <li>container count : {{ dock.container_count }}</li>
        <li>connected ship : {{ dock.connected_ship_id }}</li>
        <li>scheduled ships : (ship id : {{ dock.scheduled_ships[0].id }}, ship arrival : {{ dock.scheduled_ships[0].time_arrived }})</li>
    </ul>
  </div>
</template>

<script>
    export default {
      props: ['dock']
    }
</script>

<style media="screen">
  #DockComponentContainer{
     height: 50%;
     width: 100%;
     border: 1px solid black;
  }
</style>
