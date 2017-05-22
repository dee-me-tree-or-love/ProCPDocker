import Vue from 'vue';
import App from './App.vue';
import TaskContainerComponent from './task_container_component.vue';

Vue.component('TaskContainerComponent',TaskContainerComponent);

new Vue({
  el: '#app',
  render: h => h(App)
})
