export default class Event {
  constructor(id,type,message,time_stamp,task_id) {
    this.id = id;
    this.type = type;
    this.message = message;
    this.time_stamp = time_stamp;
    this.task_id = task_id;
  }
}
