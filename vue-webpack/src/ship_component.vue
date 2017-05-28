<template>
  <div class="col-md-3" id="ShipComponentContainer"><p>Ship:{{ ship.id }}</p></div>
</template>

<script>
    export default {
      props: ['ship']
    }
</script>

<style>
#ShipComponentContainer{
     top:0px;
     height:255px;
     overflow-y:scroll;
     overflow-x:hidden;
     border:1px solid black;
     overflow:false;
}
</style>
