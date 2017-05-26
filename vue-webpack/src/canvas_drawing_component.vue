<template>
     <div id="canvas-container">
          <canvas id="canvas" onload="setContext()"></canvas>
     </div>
</template>

<script>


import Ship from './models/Ship.js';
import Canvas from './models/Canvas.js';
import Dock from './models/Dock.js';
import Storage from './models/Storage.js';

var c;
var ctx;

$(function() {

     c = document.getElementById('canvas');

     ctx = c.getContext('2d');

     var canvas  = new Canvas(ctx);
     var testship = new Ship("id","size","containers_max","containers_current","containers_unload","containers_load","destination","status");
     var dock = new Dock("id","loaders_count","connected_storages","container_count","connected_ship_id","scheduled_ships");
     var storage = new Storage("id","size","containers_max","containers_current","connections","status");

     canvas.drawBackground();
     testship.moveForward(ctx);
     testship.drawShip(ctx);
     dock.drawDock(ctx);
     storage.drawStorage(ctx);
});

export default{
     data(){
          return{
               c : c,
               ctx : ctx,
          }
     }
}

</script>
<style>

</style>
