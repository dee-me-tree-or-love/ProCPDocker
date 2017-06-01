export default class Simulation {
  constructor(simulation_id, tl_id, configuration_id, ships, storages, tasks) {
    this.sim_id = sim_id;
    this.timeline_id = tl_id;
    this.config_id = configuration_id;
    this.ships = ships;
    this.storages = storages;
    this.tasks = tasks;
  }
}
