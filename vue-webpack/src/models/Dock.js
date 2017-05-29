export default class Dock {
  constructor(id,loaders_count,connected_storages,container_count,connected_ship_id,scheduled_ships) {
    this.id = id;
    this.loaders_count = loaders_count;
    this.connected_storages = connected_storages;
    this.container_count = container_count;
    this.connected_ship_id = connected_ship_id;
    this.scheduled_ships = scheduled_ships;

    this.height = 50;
    this.width = 170;
    this.position_x = 132;
    this.position_y = 80;

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
     this.position_y = ((index+1)*(150))+this.position_y;//+20;
     this.loadingposition_y = this.position_y+10;//+30;
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
