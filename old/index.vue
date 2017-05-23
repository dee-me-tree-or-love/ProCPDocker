<html>
<head>
     <meta name="viewport" content="width=device-width, initial-scale=1">
     <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css">
     <link rel="stylesheet" href="slider.css">
     <script src="https://code.jquery.com/jquery-3.2.1.min.js"integrity="sha256-hwg4gsxgFZhOsEEamdOYGBf13FyQuiTwlAQgxVSNgt4="crossorigin="anonymous"></script>
     <script src="https://unpkg.com/axios/dist/axios.min.js"></script>
     <script>

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

     </script>
</head>
<body>
     <div class="container" id="simulation">

          <div class="col-md-9" style="height:100%;border:1px solid black;" id="main-simulation">
               <button onclick="getTasks()">get more tasks</button>
               <button onclick="performTask()">do task</button>
               <button onclick="reverseTask()">reverse task</button>

               <div id="playground">
                    <canvas id="canvas-playground"></canvas>
               </div>

               <input type="range" min="0" max="100" value="0" step="1" oninput="sliderChanged()" id="slider"></input>
               <p></p>
          </div>
          <div class="col-md-3" style="height:100%;overflow-y:scroll;overflow-x:hidden;border:1px solid black;overflow:false" id="task-column">
               <task-view v-for="t in tasks" v-bind:task="t" v-bind:key="t.id"></task-view>
          </div>
     </div>
</body>
<script src="https://unpkg.com/vue@2.3.3"></script>
<script>

var slidervalue = 1;

var counter = 3;

//var container1 = new Container(1,45,5,3);

document.getElementById("slider").disabled = true;

var completedtasks = [];

var ships = [];

var tasks = [new Task(1,"type","extra","description", "status","time_to_complete","events"),new Task(2,"type","extra","description", "status","time_to_complete","events")];

var c = document.getElementById("canvas-playground");
var ctx = c.getContext("2d");

var testship = new Ship("id","size","containers_max","containers_current","containers_unload","containers_load","destination","status");
testship.drawShip(ctx);

function getShips(){
     ships.push(new Ship());
}


function getTasks(){

     axios.get('https://r62t8jfw01.execute-api.eu-central-1.amazonaws.com/mock/tasks/sim1/tl1')
       .then(function(response){
         console.log(response.data);

         for(i = 0;i < response.data.tasks.length;i++){
              tasks.push(new Task(response.data.tasks[i].id,response.data.tasks[i].type,"extra object",response.data.tasks[i].description,response.data.tasks[i].status,response.data.tasks[i].time_to_complete,"events object"))
         }
       });
     //axios.get(https://r62t8jfw01.execute-api.eu-central-1.amazonaws.com/mock/tasks/sim1/tl1);
     tasks.push(new Task(counter,"type","extra","description", "status","time_to_complete","events"));
     counter++;
}

function performTask(){

     if(tasks.length > 0){
          completedtasks.push(tasks.shift());
          document.getElementById('slider').value++;
     }else {
          alert("no more tasks to perform");
     }

}

function reverseTask(){


     if(completedtasks.length > 0){
          tasks.unshift(completedtasks.pop());
          document.getElementById('slider').value--;
     }else {
          alert("no more tasks to reverse");
     }
}

function sliderChanged(){

     var index = document.getElementById('slider').value;

     if(slidervalue < index){
          for(i=slidervalue-1;i < index;i++){
               performTask();
               addRandomEvent();
          }
     }
     else if (slidervalue > index) {
          for(i=slidervalue-1;i > index;i--){
               tasks.unshift(completedtasks.pop());
          }
     }

     slidervalue = index;
}

Vue.component('task-view',{
     props:['task'],
     template: '<div style="width:100%;height:80px;border:1px solid black;margin-top:10px;margin-bottom:10px"><p>{{ task.id }}-{{ task.description }}</p></div>',
})

var simulationTaskbar = new Vue({
     el: '#task-column',
     data:{
          tasks
     }
})

var simulationPlayground = new Vue({
     el: 'main-simulation',
     data:{

     }
})


</script>
</html>
