<template>
  <div class="container" style="height:100%;border:1px solid black;" id="app">
       <CanvasComponent></CanvasComponent>
       <TaskContainerComponent></TaskContainerComponent>
  </div>
</template>

<script>

export default {
  name: 'app',
  data () {
    return {
         Tasks:[],
         Ships:[]
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
