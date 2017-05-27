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

    this.height = 20;
    this.width = 80;
    this.position_x = 40;
    this.position_y = 10;
    this.bezierCurve = 18;

    this.drawShip = function(context){
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
         context.strokeRect(this.position_x+4,this.position_y+4,this.width-8,this.height-8);
         context.fillRect(this.position_x+4,this.position_y+4,this.width-8,this.height-8);

  }

   this.moveForward = function(context){
        this.position_x += 30;
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
