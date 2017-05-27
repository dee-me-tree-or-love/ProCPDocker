export default class canvas {
  constructor(context) {
       this.context = context;

  this.drawBackground = function(){
       this.context.fillStyle = '#0289b3';
       this.context.fillRect(0,0,200,700);
       this.context.fillStyle = '#cccccc';
       this.context.fillRect(170,0,300,700);
       this.context.beginPath();
       this.context.moveTo(170,0);
       this.context.lineTo(170,700);
  }
}
}
