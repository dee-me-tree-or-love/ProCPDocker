import Destination from './Destination.js';
import Size from './Size.js';
import Dock from './Dock.js';
import Container from './Container.js';

export default class Ship {
  constructor(id,size,containers_max,containers_current,containers_unload,containers_load,destination,status) {
    this.id = id;
    this.size = size;
    this.containers_max = containers_max;
    this.containers_current = containers_current;
    this.containers_unload = containers_unload;
    this.containers_load = containers_load;
    this.destination = destination;
    this.status = status;
    this.dock = new Dock();
    this.containers = [];

    this.height = 40;
    this.width = 120;
    this.position_x = 140;
    this.position_y = 30;
    this.bezierCurve = 25;


    this.drawShip = function(context){
         context.beginPath();
         context.fillStyle = '#ff8400';
         context.lineWidth = 2;
         context.moveTo(this.position_x + this.width, this.position_y);
         context.bezierCurveTo(this.position_x + this.width + this.bezierCurve,  this.position_y + (this.height/2),this.position_x + this.width + this.bezierCurve,  this.position_y + (this.height/2), this.position_x + this.width, this.position_y + this.height);
         context.stroke();
         context.strokeRect(this.position_x,this.position_y,this.width,this.height);
         context.fillRect(this.position_x,this.position_y,this.width,this.height);
         context.moveTo(this.position_x + this.width, this.position_y);
         context.bezierCurveTo(this.position_x + this.width + this.bezierCurve,  this.position_y + (this.height/2),this.position_x + this.width + this.bezierCurve,  this.position_y + (this.height/2), this.position_x + this.width, this.position_y + this.height);
         context.closePath();
         context.fill();
         context.fillStyle = '#ffffff';
         context.strokeRect(this.position_x+6,this.position_y+6,this.width-12,this.height-12);
         context.fillRect(this.position_x+6,this.position_y+6,this.width-12,this.height-12);

         //this.drawContainers(context);
         this.setSize(context);

  }

  this.drawContainers = function(context){

       context.beginPath();
       context.strokeStyle = '#000000';

       var counter_x = this.position_x+6+12;
       var counter_y = this.position_y+6+7;

       for(var i = 0;i < 9;i++){
            context.moveTo(counter_x,this.position_y+6);
            context.lineTo(counter_x,this.position_y+34);
            counter_x = counter_x + 12;
       }

       for(var i = 0;i < 4;i++){
            context.moveTo(this.position_x+6,counter_y);
            context.lineTo(this.position_x+this.width-6,counter_y);
            counter_y = counter_y + 7;
       }

       context.stroke();

   }

   this.removeShip = function(context){
        context.fillStyle = '#0289b3';
        context.fillRect(this.position_x-2,this.position_y-2,this.width+this.bezierCurve+4,this.height+4);
   }

   this.moveForward = function(context){
        this.position_x += 30;
   }

   this.setY = function(index){
        this.position_y = (index+1)*this.position_y;//+20;
   }

   this.setDock = function(dock){
        this.dock = dock;
        this.position_x = this.dock.position_x + 8;
        this.position_y = this.dock.position_y - 50;
   }

   this.checkClick = function(x,y){
        if(((x >= this.position_x)&&(x <= this.position_x+this.width+this.bezierCurve))&&((y >= this.position_y)&&(y <= this.position_y+this.height)) && this.id == this.dock.connected_ship_id){
             return true;
        }else{
             return false;
        }

   }

   this.selectContainer = function(context){

   }

   this.setSize = function(context){

        var container_x = (this.width-12)/this.size.x;
        var container_y = (this.height-12)/this.size.y;
        var counter_x = this.position_x+6;
        var counter_y = this.position_y+6;
        var counter = 0;

        for(var i = 0;i < this.size.x;i++){

             var counter_y = this.position_y+6;

             for(var j = 0;j < this.size.y;j++){
                  context.fillStyle = '#ffffff';
                  context.fillRect(counter_x,counter_y,container_x,container_y);
                  context.fillStyle = '#000000';
                  context.strokeRect(counter_x,counter_y,container_x,container_y);
                  //this.containers[counter].x = i;
                  //this.containers[counter].y = j;
                  counter++;
                  counter_y = counter_y + container_y;
             }
             counter_x = counter_x + container_x;
        }
   }

   this.findContainer = function(id){
        for(var i = 0;i < this.containers.length;i++){
            if(id == this.containers[i].id){
                  var c = this.containers[i];
                  this.containers.splice(i,1);
                  return c;
            }
        }
   }
}
}
