import Destination from './Destination.js';
import Size from './Size.js';

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

         this.drawContainers(context);

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

   this.moveForward = function(context){
        this.position_x += 30;
   }

   this.setY = function(index){
        this.position_y = (index+1)*this.position_y;//+20;
   }

   this.setDock = function(dock){
        this.position_x = dock.position_x + 8;
        this.position_y = dock.position_y - 50;
   }

   this.checkClick = function(x,y){
        if(((x >= this.position_x)&&(x <= this.position_x+this.width+this.bezierCurve))&&((y >= this.position_y)&&(y <= this.position_y+this.height))){
             return true;
        }else{
             return false;
        }

   }
}
}
