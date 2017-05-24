<template>
  <div style="width:100%;height:80px;border:1px solid black;margin-top:10px;margin-bottom:10px"><p>Storage: {{ storage.id }}</p></div>
</template>

<script>
    export default {
      props: ['storage']
    }
</script>
