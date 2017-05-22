<template>
  <div class="container" style="height:100%;border:1px solid black;" id="app">
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
       <Simulation-Sidebar></Simulation-Sidebar>
  </div>
</template>

<script>

export default {
  name: 'app',
  data () {
    return {

    }
  }
}
</script>
<style lang="scss">
#app {
     font-family: 'Avenir', Helvetica, Arial, sans-serif;
     color: #2c3e50;
     margin-top: 60px;
}

#task-column{
     height:100%;
     overflow-y:scroll;
     overflow-x:hidden;
     border:1px solid black;
     overflow:false;
}

#main-simulation{
     height:100%;
     border:1px solid black;
}
</style>
