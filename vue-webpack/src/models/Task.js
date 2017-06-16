import Event from './Event.js';

export default class Task {
  constructor(id,type,extra,description, status,start_time,end_time,events) {
    this.id = id;
    this.type = type;
    this.extra = extra;
    this.description = description;
    this.status = status;
    this.start_time = start_time;
    this.end_time = end_time;
    this.events = events;
  }
}
