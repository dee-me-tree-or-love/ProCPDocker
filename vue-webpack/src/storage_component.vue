<template>
  <div class="col-md-12 topSpace" id="StorageComponentContainer">
    <ul class="list-unstyled">
      <li>storage id : {{ storage.id }}</li>
      <li>storage size : ( x :{{ storage.size.x }}, y :{{ storage.size.y}}, z :{{ storage.size.z}} )</li>
      <li>maximum containers : {{ storage.containers_max }}</li>
      <li>current containers : {{ storage.containers_current }}</li>
    </ul>
  </div>
</template>

<script>
    export default {
      props: ['storage']
    }
</script>

<style>
    #StorageComponentContainer {
        border: 1px solid black;
        width: 100%;
        height: 50%;
    }
</style>
