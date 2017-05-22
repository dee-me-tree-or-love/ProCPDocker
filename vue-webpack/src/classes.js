//class for Container
function Container(id, description, location_id, x, y, z, weight, cargo_type){
     this.id = id;
     this.description = description;
     this.location_id = location_id;
     this.x = x;
     this.y = y;
     this.z = z;
     this.weight = weight;
     this.cargo_type = cargo_type;
}

function Event(id,type,message,time_stamp){
     this.id = id;
     this.type = type;
     this.message = message;
     this.time_stamp = time_stamp;
}

function Extra(container,storage){
     this.container = container;
     this.storage = storage;
}

//class for task
function Task(id,type,extra,description, status,time_to_complete,events){
     this.id = id;
     this.type = type;
     this.extra = extra;
     this.description = description;
     this.status = status;
     this.time_to_complete = time_to_complete;
     this.events = events;
}

//class for ship
function size(x,y,z){
     this.x = x;
     this.y = y;
     this.z = z;
}

function destination(id,estimated_arrival_time){
     this.id = id;
     this.estimated_arrival_time = estimated_arrival_time;
}

function Ship(id,size,containers_max,containers_current,containers_unload,containers_load,destination,status){
     this.id = id;
     this.size = size;
     this.containers_max = containers_max;
     this.containers_current = containers_current;
     this.containers_unload = containers_unload;
     this.containers_load = containers_load;
     this.destination = destination;
     this.status = status;

     this.height = 40;
     this.width = 10;
     this.position_x = 10;
     this.position_y = 10;
     this.drawShip = function(context){
          context.fillRect(this.position_x,this.position_y,this.width,this.height);
     }
}
