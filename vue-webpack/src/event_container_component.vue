<template>
  <EventComponent></EventComponent>
</template>

<script src="classes.js"></script>
<script>
     import Event from './models/Event.js';
     import EventComponent from './event_component.vue';

     export default {
          data() {
               return {
                    events: [Event(1, "move", "dunno", Date.now()), Event(2, "move", "dunno", Date.now()), Event(3, "move", "dunno", Date.now())]
               }
          },
          components: {
               'EventComponent': EventComponent
          }
     }
</script>
