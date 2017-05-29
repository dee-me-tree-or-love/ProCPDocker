<template>
  <div class="col-md-12 topSpace" id="DockComponentContainer">
    <p>Dock: {{ dock.id }}</p>
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
