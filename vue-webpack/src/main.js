import Vue from 'vue';
import App from './App.vue';
import TaskContainerComponent from './task_container_component.vue';
import CanvasComponent from './canvas_component.vue';
import EventContainerComponent from './event_container_component.vue';
import DockComponent from './dock_component.vue';
import StorageComponent from './storage_component.vue';
import ShipComponent from './ship_component.vue';

Vue.component('TaskContainerComponent',TaskContainerComponent);
Vue.component('CanvasComponent',CanvasComponent);
Vue.component('EventContainerComponent', EventContainerComponent);
Vue.component('DockComponent', DockComponent);
Vue.component('StorageComponent', StorageComponent);
Vue.component('ShipComponent', ShipComponent);

new Vue({
  el: '#app',
  render: h => h(App)
})
