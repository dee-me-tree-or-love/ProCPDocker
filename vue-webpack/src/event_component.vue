<template>
  <div style="width:100%;border:1px solid black;margin-top:10px;margin-bottom:10px">
       <ul class="list-unstyled">
           <li>event id : {{ event.id }}</li>
           <li>event type : {{ event.type }}</li>
           <li>event message : {{ event.extra }}</li>
           <li>event timestamp : {{ event.description }}</li>
      </ul>
  </div>
</template>

<script>
  export default {
    props: ['event']
  }
</script>
