export default class canvas {
  constructor(context) {
       this.context = context;

  this.drawBackground = function(){

       this.context.lineWidth = 2;
       this.context.fillStyle = '#0289b3';
       this.context.fillRect(0,0,300,2000);
       this.context.fillStyle = '#cccccc';
       this.context.fillRect(300,0,700,2000);
       this.context.beginPath();
       this.context.strokeStyle = '#000000';
       this.context.moveTo(300,0);
       this.context.lineTo(300,2000);
       this.context.stroke();
  }
}
}
