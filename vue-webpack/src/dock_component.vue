<template>
  <div class="col-md-12 topSpace" id="DockComponentContainer">
    <ul class="list-unstyled">
        <li>Dock: {{ dock.id }}</li>
        <li>Width: {{ dock.width }}</li>
        <li>Height: {{ dock.height }}</li>
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
