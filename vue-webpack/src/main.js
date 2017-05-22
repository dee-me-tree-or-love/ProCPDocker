import Vue from 'vue';
import App from './App.vue';
import SimulationSidebar from './Simulation_Sidebar.vue';

Vue.component('Simulation-Sidebar',SimulationSidebar);

new Vue({
  el: '#app',
  render: h => h(App)
})
