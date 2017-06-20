<template>
  <div class="col-md-3 topSpace" id="EventComponentContainer">
    <EventComponent v-for="e in events" :event="e" :key="e.id"></EventComponent>
  </div>
</template>

<script>
     import Event from './models/Event.js';
     import EventComponent from './event_component.vue';

     export default {
          props: ['events'],
          data() {
               return {
                    //events: [Event(1, "move", "dunno", Date.now()), Event(2, "move", "dunno", Date.now()), Event(3, "move", "dunno", Date.now())]
               }
          },
          components: {
               'EventComponent': EventComponent
          }
     }
</script>

<style>
#EventComponentContainer{
     height: 49%;
     width: 100%;
     overflow-y:scroll;
     overflow-x:hidden;
     border:1px solid black;
     overflow:false;
     border-radius: 7px;
}

</style>
