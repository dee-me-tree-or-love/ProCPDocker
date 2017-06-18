<template lang="html">
  <div id="storages" class="col-md-12 ship-form topSpace">
    <span>ID</span><input v-model="storageID" placeholder="ID">
    <span>X</span><input v-model="storageX" placeholder="X">
    <span>Y</span><input v-model="storageY" placeholder="Y">
    <span>Z</span><input v-model="storageZ" placeholder="Z">
    <span>Filled %</span><input v-model="storageFilled" placeholder="Filled %">
  </div>
</template>

<script>
import Storage from './models/Storage.js';

export default {
  data() {
    return {
      storageX: "5",
      storageY: "5",
      storageZ: "5",
      storageID: "1",
      storageFilled: "60",
    }
  },
  computed: {
    storage: function() {
      var temp = {
        x: parseInt(this.storageX),
        y: parseInt(this.storageY),
        z: parseInt(this.storageZ),
        id: this.storageID,
        filled: parseInt(this.storageFilled),
      }
      return temp;
    }
  },
}
</script>

<style lang="css">

.storage-form{
  border: 1px solid black;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

</style>
