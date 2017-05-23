export default class Dock {
  constructor(id,loaders_count,connected_storages,container_count,connected_ship_id,scheduled_ships) {
    this.id = id;
    this.loaders_count = loaders_count;
    this.connected_storages = connected_storages;
    this.container_count = container_count;
    this.connected_ship_id = connected_ship_id;
    this.scheduled_ships = scheduled_ships;
  }
}
