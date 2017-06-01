<template>
        <canvas id="canvas" height="2000px" width="700px" onload="setContext()" v-on:click="check"></canvas>
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
          this.c = document.getElementById('canvas');

          this.ctx = this.c.getContext('2d');

          this.getContext();

          console.log("mounted canvas_drawing_component");
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

</script>
<style>
  #canvas{
    position: relative;
  }
</style>
