<template>
     <div id="canvas-container">
          <canvas id="canvas" ref="canvas"></canvas>
     </div>
</template>

<script>


import Ship from './models/Ship.js';

var c;
var ctx;

var testship = new Ship("id","size","containers_max","containers_current","containers_unload","containers_load","destination","status");
//testship.drawShip(ctx);

export default{
     data(){
          return{
               canvas : ''
          }
     },
     methods:{
          load(){
               ctx = this.$refs.canvas.getContext("2d");
               testship.drawShip(ctx);
          },
     }
}
</script>
<style>

</style>
