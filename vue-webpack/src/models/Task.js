import Event from './Event.js';

export default class Task {
  constructor(id,type,extra,description, status,time_to_complete,events) {
    this.id = id;
    this.type = type;
    this.extra = extra;
    this.description = description;
    this.status = status;
    this.time_to_complete = time_to_complete;
    this.events = events;
  }
}
