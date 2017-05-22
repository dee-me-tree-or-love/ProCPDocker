import Vue from 'vue';
import App from './App.vue';
import TaskContainerComponent from './task_container_component.vue';
import CanvasComponent from './canvas_component.vue';

Vue.component('TaskContainerComponent',TaskContainerComponent);
Vue.component('CanvasComponent',CanvasComponent);

new Vue({
  el: '#app',
  render: h => h(App)
})
