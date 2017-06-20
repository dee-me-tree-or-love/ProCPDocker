import Storage from './Storage.js';
import Dock from './Dock.js';

export default class Road {
     constructor(lastdock,laststorage) {

          this.laststorage = laststorage;
          this.lastdock = lastdock;
//horizontal road from dock
          // this.height = 50-40;
          // this.width = 170+300;
          // this.position_x = 132+60;
          // this.position_y = 80+20;

//vertical road
          this.height = 50-40+50;
          this.width = 10;
          this.position_x = 502;
          this.position_y = 40;

//left road for storage
          // this.height3 = 10;
          // this.width3 = 50;
          // this.position_x3 = 460;
          // this.position_y3 = 35;

//right road for storage
          // this.height4 = 10;
          // this.width4 = 45;
          // this.position_x4 = 505;
          // this.position_y4 = 35;

//road between storage rows
          this.height5 = 50-40+60+90;
          this.width5 = 10;
          this.position_x5 = 132+370;
          this.position_y5 = 80+20;


          this.drawRoad = function(context){

               this.roadLength();
               context.fillStyle = '#ffffff';
               context.fillRect(this.position_x,this.position_y,this.width,this.height);
               //context.fillRect(this.position_x5,this.position_y5,this.width5,this.height5);
          }

          this.roadLength = function(){
               if(this.lastdock.position_y > this.laststorage.position_y){
                    this.height = this.lastdock.roadposition_y-this.position_y+10;
               }else{
                    this.height = this.laststorage.roadposition_y-this.position_y+10;
               }
          }
     }
}
