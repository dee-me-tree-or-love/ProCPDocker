import ScheduledShip from './ScheduledShip.js';
import ConnectedStorage from './ConnectedStorage.js';
import Container from './Container.js';

export default class Dock {
  constructor(id,loaders_count,connected_storages,container_count,connected_ship_id,scheduled_ships) {
    this.id = id;
    this.loaders_count = loaders_count;
    this.connected_storages = connected_storages;
    this.container_count = container_count;
    this.connected_ship_id = connected_ship_id;
    this.scheduled_ships = scheduled_ships;
    this.containers = [];

    this.height = 50;
    this.width = 170;
    this.position_x = 132;
    this.position_y = 80;

    this.roadheight = 10;
    this.roadwidth = 470;
    this.roadposition_x = 192;
    this.roadposition_y = 100;

    this.loadingwidth = this.height-20;
    this.loadingheight = this.height-20;
    this.loadingposition_x = this.position_x+10;
    this.loadingposition_y = this.position_y+10;


  this.drawDock = function(context){
       context.fillStyle = '#cccccc';
       context.fillRect(this.position_x,this.position_y,this.width,this.height);
       context.beginPath();

       context.strokeStyle = '#000000';
       context.moveTo(this.position_x+this.width-1,this.position_y);
       context.lineTo(this.position_x,this.position_y);
       context.lineTo(this.position_x,this.height+this.position_y);
       context.lineTo(this.position_x+this.width-1,this.height+this.position_y);
       context.stroke();
       context.closePath();

       this.drawLoadingZone(context);

       context.fillStyle = '#ffffff';
       context.fillRect(this.roadposition_x,this.roadposition_y,this.roadwidth,this.roadheight);

 }

 this.drawLoadingZone = function(context){

      context.beginPath();
      context.lineWidth = 12;
      context.strokeStyle = '#fffc22';
      context.strokeRect(this.loadingposition_x,this.loadingposition_y,this.loadingwidth,this.loadingheight);
      context.fillStyle = '#ffffff';
      context.fillRect(this.loadingposition_x,this.loadingposition_y,this.loadingwidth,this.loadingheight);
      context.lineWidth = 5;
      context.moveTo(this.loadingposition_x,this.loadingposition_y+this.loadingheight/2);
      context.lineTo(this.loadingposition_x+this.loadingwidth/2,this.loadingposition_y);
      context.moveTo(this.loadingposition_x,this.loadingposition_y+this.loadingheight);
      context.lineTo(this.loadingposition_x+this.loadingwidth,this.loadingposition_y);
      context.moveTo(this.loadingposition_x+this.loadingwidth/2,this.loadingposition_y+this.loadingheight);
      context.lineTo(this.loadingposition_x+this.loadingwidth,this.loadingposition_y+this.loadingheight/2);
      context.stroke();
      context.lineWidth = 2;
}

this.setY = function(index){
     this.position_y = ((index)*(150))+this.position_y;//+20;
     this.loadingposition_y = this.position_y+10;//+30;
     this.roadposition_y = this.position_y+20;
}

 this.checkClick = function(x,y){
      if(((x >= this.position_x)&&(x <= this.position_x+this.width))&&((y >= this.position_y)&&(y <= this.position_y+this.height))){
           return true;
      }else{
           return false;
      }

 }

 this.findContainer = function(id){
      for(var i = 0;i < this.containers.length;i++){
           if(this.containers[i] != undefined){
                if(id == this.containers[i].id){
                     var c = this.containers[i];
                     this.containers.splice(i,1);
                     return c;
                }
           }
      }
}
 }
}
