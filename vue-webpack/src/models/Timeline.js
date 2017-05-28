export default class Timeline {
  constructor(id,time_created,time_zero,parent_timeline_id) {
    this.id = id;
    this.time_created = time_created;
    this.time_zero = time_zero;
    this.parent_timeline_id = parent_timeline_id;
    }
}
