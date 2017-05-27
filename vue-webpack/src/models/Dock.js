export default class Dock {
  constructor(id,loaders_count,connected_storages,container_count,connected_ship_id,scheduled_ships) {
    this.id = id;
    this.loaders_count = loaders_count;
    this.connected_storages = connected_storages;
    this.container_count = container_count;
    this.connected_ship_id = connected_ship_id;
    this.scheduled_ships = scheduled_ships;


  this.drawDock = function(context){
       context.fillStyle = '#cccccc';
       context.fillRect(80,40,172,20);
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
