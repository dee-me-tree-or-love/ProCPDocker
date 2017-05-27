export default class Storage {
  constructor(id,size,containers_max,containers_current,connections,status) {
    this.id = id;
    this.size = size;
    this.containers_max = containers_max;
    this.containers_current = containers_current;
    this.connections = connections;
    this.status = status;

    this.height = 40;
    this.width = 60;
    this.position_x = 205;
    this.position_y = 10;

    this.drawStorage = function(context){
         context.fillStyle = '#000000';
         context.fillRect(this.position_x,this.position_y,this.width,this.height);
  }

   this.checkClick(x,y){
        return true;
   }
}
}
