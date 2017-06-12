import Storage from './Storage.js';
import Dock from './Dock.js';

export default class Truck {
  constructor(dock,storage) {

     this.speed = 1;
     this.storage = storage;
     this.dock = dock;

     //if this is true then the direction from dock to storage is up
     //and if it is false then the direction is down.
     this.direction = true;

     this.check1 = true;
     this.check2 = true;
     this.check3 = true;

     this.width = 6;
     this.height = 6;
     this.position_x = this.dock.roadposition_x+2;
     this.position_y = this.dock.roadposition_y+2;

     this.setStart = function(startplace){
          if(startplace == 'storage'){
               //
          }else{
               //
          }
     }

     this.setDirection = function(){
          if(this.storage.position_y < this.dock.position_y){
               this.direction = true;
          }else{
               this.direction = false;
          }
     }

     this.drawTruck = function(context){
          context.fillStyle = '#000000';
          context.fillRect(this.position_x,this.position_y,this.width,this.height);
     }

     this.moveTruckDockToStorage = function(context){
          context.fillStyle = '#ffffff';
          context.fillRect(this.position_x,this.position_y,this.width,this.height);
          context.fillStyle = '#000000';

          if(this.position_x < 504 && this.check1){//travel right
               this.position_x = this.position_x+this.speed;
               context.fillRect(this.position_x,this.position_y,this.width,this.height);
          }else if (this.position_y > this.storage.roadposition_y+2 && this.check2 && this.direction) {//travel up
               this.position_y = this.position_y-this.speed;
               context.fillRect(this.position_x,this.position_y,this.width,this.height);
               this.check1 = false;
          }else if (this.position_y < this.storage.roadposition_y+2 && this.check2 && !this.direction) {//travel down
               this.position_y = this.position_y+this.speed;
               context.fillRect(this.position_x,this.position_y,this.width,this.height);
               this.check1 = false;
          }else if (this.position_x >= this.storage.roadposition_x+2 && this.check3 && this.storage.side == 'left') {//travel left
               this.position_x = this.position_x-this.speed;
               context.fillRect(this.position_x,this.position_y,this.width,this.height);
               this.check2 = false;
          }else if (this.position_x < this.storage.roadposition_x+this.storage.roadwidth-7 && this.check3 && this.storage.side == 'right') {//travel right
               this.position_x = this.position_x+this.speed;
               context.fillRect(this.position_x,this.position_y,this.width,this.height);
               this.check2 = false;
          }else{
               context.fillRect(this.position_x,this.position_y,this.width,this.height);
               this.check1 = true;
               this.check2 = true;
               this.check3 = true;
          }
     }


     this.moveTruckStorageToDock = function(context){
          context.fillStyle = '#ffffff';
          context.fillRect(this.position_x,this.position_y,this.width,this.height);
          context.fillStyle = '#000000';

          if (this.position_x < 504 && this.check1 && this.position_y == this.storage.roadposition_y+2 && this.storage.side == 'left') {//travel right
               this.position_x = this.position_x+this.speed;
               context.fillRect(this.position_x,this.position_y,this.width,this.height);
          } else if (this.position_x > 504 && this.check1 && this.position_y == this.storage.roadposition_y+2  && this.storage.side == 'right') {//travel left
               this.position_x = this.position_x-this.speed;
               context.fillRect(this.position_x,this.position_y,this.width,this.height);
          } else if (this.position_y < this.dock.roadposition_y+2 && this.check2 && this.position_x == 504 && this.direction) {//travel down
               this.position_y = this.position_y+this.speed;
               context.fillRect(this.position_x,this.position_y,this.width,this.height);
               this.check1 = false;
          } else if (this.position_y > this.dock.roadposition_y+2 && this.check2 && this.position_x == 504 && !this.direction) {//travel up
               this.position_y = this.position_y-this.speed;
               context.fillRect(this.position_x,this.position_y,this.width,this.height);
               this.check1 = false;
          }else if (this.position_x > this.dock.roadposition_x+2 && this.check3 && this.position_y == this.dock.roadposition_y+2) {//travel left
               this.position_x = this.position_x-this.speed;
               context.fillRect(this.position_x,this.position_y,this.width,this.height);
               this.check2 = false;
          }else{
               context.fillRect(this.position_x,this.position_y,this.width,this.height);
               this.check1 = true;
               this.check2 = true;
               this.check3 = true;
          }
     }
  }
}
