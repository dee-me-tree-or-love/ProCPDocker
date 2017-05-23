export default class Container {
  constructor(id, description, location_id, x, y, z, weight, cargo_type) {
    this.id = id;
    this.description = description;
    this.location_id = location_id;
    this.x = x;
    this.y = y;
    this.z = z;
    this.weight = weight;
    this.cargo_type = cargo_type;
  }
}
