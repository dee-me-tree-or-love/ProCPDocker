<template>
  <div style="width:100%;height:80px;border:1px solid black;margin-top:10px;margin-bottom:10px"><p>Ship:{{ ship.id }}</p></div>
</template>

<script>
    export default {
      props: ['ship']
    }
</script>
