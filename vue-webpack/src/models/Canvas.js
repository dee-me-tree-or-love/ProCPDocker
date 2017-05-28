export default class canvas {
  constructor(context) {
       this.context = context;

  this.drawBackground = function(){
       this.context.fillStyle = '#0289b3';
       this.context.fillRect(0,0,300,700);
       this.context.fillStyle = '#cccccc';
       this.context.fillRect(300,0,700,500);
       this.context.beginPath();
       this.context.moveTo(300,0);
       this.context.lineTo(300,500);
  }
}
}
