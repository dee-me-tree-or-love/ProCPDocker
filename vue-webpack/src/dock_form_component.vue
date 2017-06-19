<template lang="html">
  <div id="storages" class="col-md-12 form-component topSpace">
    <span>ID</span class="topSpace"><input v-model="dockID" placeholder="ID" class="top">
    <span>Number of Loaders</span><input v-model="numberLoaders" placeholder="Number of Loaders" class="margin-bot">
  </div>
</template>

<script>
import Dock from './models/Dock.js';

export default {
  data() {
    return {
      dockID: "1",
      numberLoaders: 2,
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
</style>
