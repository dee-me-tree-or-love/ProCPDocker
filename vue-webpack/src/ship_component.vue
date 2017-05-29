<template>
  <div class="col-md-12 topSpace" id="ShipComponentContainer">
    <p>Ship:{{ ship.id }}</p>
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
