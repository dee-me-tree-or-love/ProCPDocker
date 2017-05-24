<template>
  <div class="col-md-3" style="top:270px;height:255px;overflow-y:scroll;overflow-x:hidden;border:1px solid black;overflow:false">
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
