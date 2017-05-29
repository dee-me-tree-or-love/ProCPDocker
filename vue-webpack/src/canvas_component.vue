<template>
     <div class="col-md-12 topSpace" style="height:100%;border:1px solid black;" id="main-simulation">
          <div class="topSpace" id="CanvasContainer">
              <CanvasDrawingComponent  @context="setContext"  @componentsidebarcheck="setComponentBool"  :ships="ships" :docks="docks" :storages="storages" :storagesbool="storagesbool" :docksbool="docksbool" :eventsbool="eventsbool" :shipsbool="shipsbool"></CanvasDrawingComponent>
              <input type="range" min="0" max="100" value="0" step="1" id="slider"></input>
          </div>
          <div class="text-center">
               <button @click="stepBackSimulation"  class="btn btn-info btn-lg"><span class="glyphicon glyphicon-step-backward" aria-hidden="true"></span></button>
               <button @click="playSimulation"  class="btn btn-success btn-lg"><span class="glyphicon glyphicon-play" aria-hidden="true"></span></button>
               <button @click="pauseSimulation"  class="btn btn-warning btn-lg"><span class="glyphicon glyphicon-pause" aria-hidden="true"></span></button>
               <button @click="stepForwardSimulation"  class="btn btn-info btn-lg"><span class="glyphicon glyphicon-step-forward" aria-hidden="true"></span></button>
               <button @click="syncSimulation" class="btn btn-danger btn-lg"><span class="glyphicon glyphicon-refresh" aria-hidden="true"></span></button>
          </div>
     </div>
</template>
<script>
     import Task from './models/Task.js';
     import Event from './models/Event.js';
     import CanvasDrawingComponent from './canvas_drawing_component.vue';
     import Simulation from './models/Simulation.js';

     var that;
     var timer;
     var play = true;
     var interval = 1000;
     var completedtasks = [];
     var counter = 0;
     var currentTask;
     var events = [];

    //  document.getElementById('slider').addEventListener('change', function() {
    //     that = this;
    //     if(that.completedtasks.length != document.getElementById('slider').value) {
    //         that.pauseSimulation();
    //         if(that.completedtasks.length > document.getElementById('slider').value) {
    //           //the user moves backwards the slider
    //           for(var i = that.completedtasks.length; i >= document.getElementById('slider').value; i--) {
    //               that.tasks.unshift(that.completedtasks.pop());
    //           }
    //         } else {
    //           //the user moves forwards the slider
    //           for(var i = that.completedtasks.length; i < document.getElementById('slider').value; i++) {
    //               if(that.completedtasks.length + that.tasks.length < document.getElementById('slider').value) {
    //                   that.getTasks();
    //               }
    //               that.completedtasks.push(that.tasks.shift());
    //           }
    //         }
    //         that.playSimulation();
    //     }
    //  });

     export default {
          props:['ships','docks','storages','tasks','currentship','currentdock','currentstorage','completedtasks', 'storagesbool', 'shipsbool', 'docksbool', 'eventsbool'],
          data() {
               return {
                    currentTask,
                    events,
               }
          },
          methods: {
               setContext(value){
                    this.$emit('context', value);
               },
               setComponentBool(value){
                    this.$emit('componentsidebarcheck', value);
               },
               getTasks() {
                    axios.get('https://r62t8jfw01.execute-api.eu-central-1.amazonaws.com/mock/tasks/sim1/tl1')
                      .then(function(response){
                        //console.log(response.data);

                        if(response.status == 200){
                          for(var i = 0;i < response.data.tasks.length;i++){
                              for(var j = 0;j < response.data.tasks[i].events.length;j++){
                                events.push(new Event(response.data.tasks[i].events[j].id,response.data.tasks[i].events[j].type,response.data.tasks[i].events[j].message,response.data.tasks[i].events[j].time_stamp));
                              }
                              that.tasks.push(new Task(counter,response.data.tasks[i].type,"extra object",response.data.tasks[i].description,response.data.tasks[i].status,response.data.tasks[i].time_to_complete,events))
                              events = [];
                              counter++;
                          }
                        } else {
                          //TODO: handle bad responses
                        }
                         //response.data.tasks[i].id

                      });


               },
               ///not used anymore during play simulation only for testing Dotask button
               performTask(){
                    if(that.tasks.length > 0){
                        var temp = that.tasks.shift();
                        that.completedtasks.push(temp);
                        document.getElementById('slider').value++;
                        //this.$emit('currentTask', currentTask);
                    }else {
                         alert("no more tasks to perform");
                    }
               },
               ///not used anymore during play simulation only for testing reverse task button
               reverseTask(){
                    if(that.completedtasks.length > 0){
                         that.tasks.unshift(that.completedtasks.pop());
                         document.getElementById('slider').value--;
                    }else {
                         alert("no more tasks to reverse");
                    }
               },
               playSimulation(){

                    that = this;

                    if(play){
                         play = false;
                         timer = setInterval(function (){
                              var temp = that.tasks.shift();
                              if(that.tasks.length > 0){
                                   that.completedtasks.push(temp);
                                   console.log(that.completedtasks);
                                   document.getElementById('slider').value++;
                              }else {
                                   that.getTasks();
                              }
                         },interval);
                         //this.$emit('currentTask', currentTask);
                    }

               },
               pauseSimulation(){
                    clearInterval(timer);
                    play = true;
               },
               stepBackSimulation(){
                    this.pauseSimulation();
                    if(that.completedtasks.length > 0){
                         that.tasks.unshift(that.completedtasks.pop());
                         document.getElementById('slider').value--;
                    }else {
                         alert("no more tasks to reverse");
                    }
               },

               stepForwardSimulation(){
                    this.pauseSimulation();
                    if(that.tasks.length > 0){
                         that.completedtasks.push(that.tasks.shift());
                         document.getElementById('slider').value++;
                    }else {
                         alert("no more tasks to perform");
                    }
               },
               syncSimulation(){
                  //TODO: create a global variable for simulation and get the ids
                  //var ts = this.completedtasks[this.completedtasks.length - 1].events[this.completedtasks[this.completedtasks.length - 1].events.length - 1].time_stamp;
                  //var s_id = this.simulation.sim_id;
                  //var t_id = this.simulation.timeline_id;
                  // axios({
                  //   method: 'patch',
                  //   url: 'https://r62t8jfw01.execute-api.eu-central-1.amazonaws.com/mock/sync',
                  //   data: {
                  //     'simulation_id': s_id,
                  //     'timeline_id': t_id,
                  //     'time_stamp': ts
                  //   }
                  // }).then(function(response) {
                  //    if(response.status == 200) {
                  //       //TODO: success message maybe
                  //    } else {
                  //       //TODO: handle bad response
                  //    }
                  // });
               },
          },
          components:{
               'CanvasDrawingComponent': CanvasDrawingComponent
          }

     }
</script>

<style media="screen">
    #CanvasContainer{
        width: 100%;
        height: 80%;
    }
</style>
