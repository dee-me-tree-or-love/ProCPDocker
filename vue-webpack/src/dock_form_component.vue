<template lang="html">
  <div id="storages" class="col-md-12 ship-form topSpace">
    <input v-model="dockID" placeholder="ID">
    <input v-model="numberLoaders" placeholder="Number of Loaders">
  </div>
</template>

<script>
import Dock from './models/Dock.js';

export default {
  data() {
    return {
      dockID: "",
      numberLoaders: "",
    }
  },
  computed: {
    dock: function() {
      var temp = {
        id: this.dockID,
        number_loaders: parseInt(this.numberLoaders),
      }
      return temp;
    }
  },
}
</script>

<style lang="css">

.dock-form{
  border: 1px solid black;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

</style>
