export default class Storage {
  constructor(id,size,containers_max,containers_current,connections,status) {
    this.id = id;
    this.size = size;
    this.containers_max = containers_max;
    this.containers_current = containers_current;
    this.connections = connections;
    this.status = status;

    this.height = 50;
    this.width = 50;
    this.position_x = 300;
    this.position_y = 300;
    this.drawShip = function(context){
         context.fillRect(this.position_x,this.position_y,this.width,this.height);
  }
}
}
