<template>
     <div class="col-md-12 topSpace" style="height:100%;border:1px solid black;" id="main-simulation">
          <div class="topSpace" id="CanvasContainer" >
              <CanvasDrawingComponent  @context="setContext"  @componentsidebarcheck="setComponentBool"  :ships="ships" :docks="docks" :storages="storages" :storagesbool="storagesbool" :docksbool="docksbool" :eventsbool="eventsbool" :shipsbool="shipsbool"></CanvasDrawingComponent>
          </div>
          <div id="wrapper" class="topSpace">
            <div class="progress-bar text-center">
              <input type="range" min="0" max="100" value="0" step="1" id="slider" @mouseup="adjustTasksWithSlider"></input>
            </div>
            <div class="buttons text-center">
              <button @click="stepBackSimulation"  class="btn btn-info btn-lg"><span class="glyphicon glyphicon-step-backward" aria-hidden="true"></span></button>
              <button @click="playSimulation"  class="btn btn-success btn-lg"><span class="glyphicon glyphicon-play" aria-hidden="true"></span></button>
              <button @click="pauseSimulation"  class="btn btn-warning btn-lg"><span class="glyphicon glyphicon-pause" aria-hidden="true"></span></button>
              <button @click="stepForwardSimulation"  class="btn btn-info btn-lg"><span class="glyphicon glyphicon-step-forward" aria-hidden="true"></span></button>
              <button @click="syncSimulation" class="btn btn-danger btn-lg"><span class="glyphicon glyphicon-refresh" aria-hidden="true"></span></button>
            </div>
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
     var timer_event;
     var play = true;
     var interval = 2000;
     var completedtasks = [];
     var counter = 0;
     var currentTask;
     var events = [];

     export default {
          props:['ships','docks','storages','tasks','events','completedevents','currentship','currentdock','currentstorage','completedtasks', 'storagesbool', 'shipsbool', 'docksbool', 'eventsbool','simulationid','timelineid'],
          data() {
               return {
                    currentTask,
                    time_stamp_token : '',
                    next_time_stamp : '',
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
                    axios.get('https://fvrwbtsci9.execute-api.eu-central-1.amazonaws.com/prd/tasks/'+this.simulationid+'/'+this.timelineid+'?limit=10'+this.time_stamp_token+this.next_time_stamp)
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

                          that.next_time_stamp = response.data.next_time_stamp;

                          that.time_stamp_token = '&time_stamp=';

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

                         //setTimeout(internalCallback, factor);

                         timer = setInterval(function (){
                              var temp = that.tasks.shift();
                              if(that.tasks.length > 0){
                                   that.completedtasks.push(temp);

                                   document.getElementById('slider').value++;

                                   that.playEvent(that.tasks[0]['events'].length);
                              }else {
                                   that.getTasks();

                                   console.log(that.tasks[0]);
                                   that.playEvent(that.tasks[0]['events'].length);
                              }
                         },interval);

                         //this.$emit('currentTask', currentTask);
                    }

               },
               playEvent(time){

                    clearInterval(timer_event);
                    timer_event = setInterval(function (){
                              var tempevent = that.tasks.shift();
                              if(time > 0){
                                   that.completedevents.push(tempevent);

                              }else{
                                   clearInterval(timer_event);
                              }
                    },interval/time);
               },
               pauseSimulation(){
                    clearInterval(timer);
                    clearInterval(timer_event);
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
               adjustTasksWithSlider() {
                  that.pauseSimulation();
                  that = this;
                  var len = that.completedtasks.length;
                  var val = document.getElementById('slider').value;

                  if(len != val) {
                      if(len > val) {
                        //the user moves backwards the slider
                        for(var i = len; i >= val; i--) {
                            that.tasks.unshift(that.completedtasks.pop());
                        }
                      } else {
                        //the user moves forwards the slider
                        console.log(val);
                        console.log(len);
                        console.log(that.tasks.length);
                        for(var i = len; i < val; i++) {
                            if(len + that.tasks.length < val) {
                                that.getTasks();
                            }
                            that.completedtasks.push(that.tasks.shift());
                        }
                      }
                  }
                  that.playSimulation();
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
        overflow: scroll;
        border: 1px solid black;
    }

    .buttons{
      width: 100%;
      height: 25%;
    }

    .progress-bar{
      width: 100%;
      height: 25%;
      background-color: white;
      display: flex;
      flex-direction: row;
      justify-content: center;
    }

    #wrapper{
      width: 100%;
      height: 25%;
    }

    #slider{
      position: inherit;
    }
</style>
