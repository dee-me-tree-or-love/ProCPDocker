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
    this.width = 10;
    this.position_x = 10;
    this.position_y = 10;
    this.drawShip = function(context){
         context.fillRect(this.position_x,this.position_y,this.width,this.height);
  }
}
}
