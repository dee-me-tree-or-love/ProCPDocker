<template lang="html">
  <div id="ships" class="col-md-12 ship-form topSpace">
    <span>ID</span><input v-model="shipID" placeholder="ID">
    <span>ETA</span><input v-model="eta" placeholder="ETA">
    <span>X</span><input v-model="shipsX" placeholder="X">
    <span>Y</span><input v-model="shipsY" placeholder="Y">
    <span>Z</span><input v-model="shipsZ" placeholder="Z">
    <span>Filled %</span><input v-model="shipsFilled" placeholder="Filled %">
    <span>Load %</span><input v-model="load" placeholder="Load %">
    <span>Unload %</span><input v-model="unload" placeholder="Unload %">
  </div>
</template>

<script>
import Ship from './models/Ship.js';

export default {
  data() {
    return {
      shipID: "1",
      eta: 6,
      shipsX: "2",
      shipsY: "4",
      shipsZ: "4",
      shipsFilled: 50,
      load: 20,
      unload: 10,
    }
  },
  computed: {
    ship: function() {
      var temp = {
        id: this.shipID,
        eta: parseInt(this.eta),
        x: parseInt(this.shipsX),
        y: parseInt(this.shipsY),
        z: parseInt(this.shipsZ),
        filled: parseInt(this.shipsFilled),
        unload: parseInt(this.unload),
        load: parseInt(this.load),
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
