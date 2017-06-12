import Connection from './Connection.js';
import Size from './Size.js';

export default class Storage {
  constructor(id,size,containers_max,containers_current,connections,status) {
    this.id = id;
    this.size = size;
    this.containers_max = containers_max;
    this.containers_current = containers_current;
    this.connections = connections;
    this.status = status;
    this.side = 'left';

    this.height = 60;
    this.width = 100;
    this.position_x = 360;
    this.position_y = 10;

    this.roadheight = 10;
    this.roadwidth = 52;
    this.roadposition_x = this.position_x + 100;
    this.roadposition_y = this.position_y + 25;

    this.drawStorage = function(context){

         context.fillStyle = '#ffffff';
         context.fillRect(this.position_x,this.position_y,this.width,this.height);
         context.fillStyle = '#ffffff';
         context.beginPath();
         context.strokeStyle = '#000000';
         context.lineWidth = 2;
         context.strokeRect(this.position_x,this.position_y,this.width,this.height);
         context.strokeRect(this.position_x+5,this.position_y+5,this.width-10,this.height-10);
         context.moveTo(this.position_x+this.width-5,this.position_y+5);
         context.lineTo(this.position_x+5,this.position_y+this.height-5);
         context.moveTo(this.position_x+this.width-5,this.position_y+this.height-5);
         context.lineTo(this.position_x+5,this.position_y+5);
         context.stroke();

         context.fillStyle = '#ffffff';
         context.fillRect(this.roadposition_x,this.roadposition_y,this.roadwidth,this.roadheight);

    }

    this.checkClick = function(x,y){
        if(((x >= this.position_x)&&(x <= this.position_x+this.width))&&((y >= this.position_y)&&(y <= this.position_y+this.height))){
             return true;
        }else{
             return false;
        }

    }

    this.setStoragePosition = function(index){
         if(index % 2 == 0){
              //this.setX(index);
              var num = index/2;

              if(index != 0){
                   this.setY(num);
              }
         }else{
              var num = (index - 1)/2;

              this.setX(index);

              if(index != 1){
                   this.setY(num);
              }
         }
    }


    this.setY = function(index){
         //this.position_y = (index+1)*this.position_y;//+20;
         this.position_y = ((index)*(150))+this.position_y;
         this.roadposition_y = this.position_y + 25;
    }

    this.setX = function(index){
         this.position_x = this.position_x + this.width * 2 - 10
         this.roadposition_x = this.position_x - 52;
         this.side = 'right';
         //this.setY(index/2);
    }
  }
}
