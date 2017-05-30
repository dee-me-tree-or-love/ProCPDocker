<template lang="html">
  <div id="ships" class="col-md-12 ship-form topSpace">
    <input v-model="shipID" placeholder="ID">
    <input v-model="eta" placeholder="ETA">
    <input v-model="shipsX" placeholder="X">
    <input v-model="shipsY" placeholder="Y">
    <input v-model="shipsZ" placeholder="Z">
    <input v-model="shipsFilled" placeholder="Filled %">
    <input v-model="load" placeholder="Load %">
    <input v-model="unload" placeholder="Unload %">
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
