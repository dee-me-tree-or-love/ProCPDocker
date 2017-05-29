<template lang="html">
  <div id="ships" class="col-md-12 ship-form topSpace">
    <p><input v-model="shipID" placeholder="ID"></p>
    <p><input v-model="eta" placeholder="ETA"></p>
    <p><input v-model="shipsX" placeholder="X"></p>
    <p><input v-model="shipsY" placeholder="Y"></p>
    <p><input v-model="shipsZ" placeholder="Z"></p>
    <p><input v-model="shipsFilled" placeholder="Filled %"></p>
    <p><input v-model="load" placeholder="Load %"></p>
    <p><input v-model="unload" placeholder="Unload %"></p>
  </div>
</template>

<script>
import Ship from './models/Ship.js';

export default {
  data() {
    return {
      shipID: "",
      eta: "",
      shipsX: "",
      shipsY: "",
      shipsZ: "",
      shipsFilled: "",
      load: "",
      unload: "",
    }
  },
  computed: {
    ship: function() {
      var temp = {
        id: this.shipID,
        eta: this.eta,
        x: this.shipsX,
        y: this.shipsY,
        z: this.shipsZ,
        filled: this.shipsFilled,
        unload: this.unload,
        load: this.load,
      }
      return temp;
    }
  },
}
</script>

<style lang="css">

.ship-form{
  border: 1px solid black;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

</style>
