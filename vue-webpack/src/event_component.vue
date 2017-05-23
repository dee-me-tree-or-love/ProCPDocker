<template>
  <div style="width:100%;height:80px;border:1px solid black;margin-top:10px;margin-bottom:10px">
    <p>{{ event.id }} - {{ event.message }}</p>
  </div>
</template>

<script src="classes.js"></script>
<script>
  export default {
    props: ['event']
  }
</script>
