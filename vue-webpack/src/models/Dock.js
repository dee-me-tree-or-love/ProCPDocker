export default class Dock {
  constructor(id,loaders_count,connected_storages,container_count,connected_ship_id,scheduled_ships) {
    this.id = id;
    this.loaders_count = loaders_count;
    this.connected_storages = connected_storages;
    this.container_count = container_count;
    this.connected_ship_id = connected_ship_id;
    this.scheduled_ships = scheduled_ships;

    this.height = 20;
    this.width = 92;
    this.position_x = 80;
    this.position_y = 40;


  this.drawDock = function(context){
       context.fillStyle = '#cccccc';
       context.fillRect(this.position_x,this.position_y,this.width,this.height);
       context.beginPath();
       context.moveTo(171,40);
       context.lineTo(80,40);
       context.lineTo(80,60);
       context.lineTo(171,60);
       context.stroke();
 }

 this.checkClick = function(x,y){
      if(((x >= this.position_x)&&(x <= this.position_x+this.width))&&((y >= this.position_y)&&(y <= this.position_y+this.height))){
           return true;
      }else{
           return false;
      }

 }
 }
}
