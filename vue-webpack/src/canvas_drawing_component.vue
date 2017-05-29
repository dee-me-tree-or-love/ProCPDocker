<template>
     <div id="canvas-container topSpace">
          <canvas id="canvas" height="500px" width="700px" onload="setContext()" v-on:click="check"></canvas>
     </div>
</template>

<script>


import Ship from './models/Ship.js';
import Canvas from './models/Canvas.js';
import Dock from './models/Dock.js';
import Storage from './models/Storage.js';

var c;
var ctx;
var ships;
var docks;
var storages;
var testship;

export default{
     mounted() {
          this.c = document.getElementById('canvas')

          this.ctx = this.c.getContext('2d')

          //alert(this.ctx)
     },
     name: 'CanvasComponentVue',
     props:['ships','docks','storages','currentship','currentdock','currentstorage', 'storagesbool', 'shipsbool', 'docksbool', 'eventsbool'],
     data(){
          return{
               c : c,
               ctx : ctx,
          }
     },
     computed:{
          returncontext : function(){
               this.$emit('context', this.ctx)

               return this.ctx
          }
     },
     methods:{
          getContext(){
               this.$emit('context', this.ctx)
          },
          check(event){
            // this.eventsbool = false;
            var docksbool = false;
            var storagesbool = false;
            var shipsbool = false;

            for(var i = 0;i < this.ships.length;i++){
                  if(this.ships[i].checkClick(event.offsetX,event.offsetY)){
                       shipsbool = true;
                       //this.currentship = this.ships[i];
                       //alert(this.shipsbool);
                       //alert(this.ctx)
                       this.$emit('componentsidebarcheck', 'ship'+i);
                  }
             }
             for(var i = 0;i < this.storages.length;i++){
                  if(this.storages[i].checkClick(event.offsetX,event.offsetY)){
                       storagesbool = true;
                       //this.currentstorage = this.storages[i];
                       this.$emit('componentsidebarcheck', 'storage'+i);
                  }
             }
             for(var i = 0;i < this.docks.length;i++){
                  if(this.docks[i].checkClick(event.offsetX,event.offsetY)){
                       docksbool = true;
                       //this.currentdock = this.docks[i];
                       this.$emit('componentsidebarcheck', 'dock'+i);
                  }
             }
             if(!docksbool && !shipsbool && !storagesbool){
                         //this.eventsbool = true;
                         this.$emit('componentsidebarcheck', 'event');
             }
         },
     }
}

$(function() {

     c = document.getElementById('canvas');

     ctx = c.getContext('2d');

     var canvas  = new Canvas(ctx);
     var testship = new Ship("id","size","containers_max","containers_current","containers_unload","containers_load","destination","status");
     var dock = new Dock("id","loaders_count","connected_storages","container_count","connected_ship_id","scheduled_ships");
     var storage = new Storage("id","size","containers_max","containers_current","connections","status");

     canvas.drawBackground();
     //testship.moveForward(ctx);
     testship.drawShip(ctx);
     dock.drawDock(ctx);
     storage.drawStorage(ctx);

});

</script>
<style>

</style>
