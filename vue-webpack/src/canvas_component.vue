<template>
     <div class="col-md-9" style="height:100%;border:1px solid black;" id="main-simulation">
          <button v-on:click="getTasks">get more tasks</button>
          <button v-on:click="performTask">do task</button>
          <button v-on:click="reverseTask">reverse task</button>

          <div id="playground">
               <canvas id="canvas-playground"></canvas>
          </div>

          <input type="range" min="0" max="100" value="0" step="1" oninput="sliderChanged()" id="slider"></input>
          <p></p>
     </div>
</template>
<script>
     import Task from './models/Task.js';

     export default {
          data() {
               return {
                    tasks:[],
               }
          },
          methods: {
               getTasks(){
                    axios.get('https://r62t8jfw01.execute-api.eu-central-1.amazonaws.com/mock/tasks/sim1/tl1')
                      .then(function(response){
                        console.log(response.data);

                        for(var i = 0;i < response.data.tasks.length;i++){
                             tasks.push(new Task(response.data.tasks[i].id,response.data.tasks[i].type,"extra object",response.data.tasks[i].description,response.data.tasks[i].status,response.data.tasks[i].time_to_complete,"events object"))
                        }
                      });
               },
               performTask(){

               },
               reverseTask(){

               }
          }

     }
</script>
