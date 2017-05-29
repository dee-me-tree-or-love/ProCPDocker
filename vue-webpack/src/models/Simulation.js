export default class Simulation {
  constructor(simulation_id, tl_id, configuration_id) {
    this.sim_id = sim_id;
    this.timeline_id = tl_id;
    this.config_id = configuration_id;
    //TODO: maybe add lists of ships, storages, tasks?
  }
}
