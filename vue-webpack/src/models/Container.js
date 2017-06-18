export default class Container {
  constructor(id, description, location_id, x, y, z, weight, cargo_type) {
    this.id = id;
    this.description = description;
    this.location_id = location_id;
    this.x = x;
    this.y = y;
    this.z = z;
    this.weight = weight;
    this.cargo_type = cargo_type;

    this.height = 0;
    this.width = 0;
    this.position_x = 0;
    this.position_y = 0;

    this.setContainer = function(counter_x,counter_y,container_x,container_y){
         this.height = container_y;
         this.width = container_x;
         this.position_x = counter_x;
         this.position_y = counter_y;
    }

    this.selectContainer = function(context){
         context.fillStyle = '#A90000';
         context.fillRect(this.position_x,this.position_y,this.width,this.height);
         context.fillStyle = '#000000';
         context.strokeRect(this.position_x,this.position_y,this.width,this.height);
    }

    this.deselectContainer = function(context){
         context.fillStyle = '#ffffff';
         context.fillRect(this.position_x,this.position_y,this.width,this.height);
         context.fillStyle = '#000000';
         context.strokeRect(this.position_x,this.position_y,this.width,this.height);
    }
  }
}
