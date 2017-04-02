using System;

namespace Docker.Models
{

    public enum TaskStatus
    {
        READY,
        INPROGRESS,
        FINISHED
    }

    /// <summary>
    /// The purpose of the task for now is just relocating
    /// the container X from
    /// its current location A to certain location B
    /// </summary>
    public class Task : IComparable<Task>
    {
        public int ID { get; set; }

        //public int PayloadID { get; set; }
        public Container Payload { get; set; }

        // time that it would most likely take to complete the task
        private TimeSpan _requiredTime;
        public TimeSpan RequiredTime
        {
            get { return this._requiredTime; }
            set
            {
                this._requiredTime = value;
                if(this._requiredTime <= TimeSpan.Zero)
                {
                    this.Status = TaskStatus.FINISHED;
                }
            }
        }

        // time tracking for task appearance and modifications
        public DateTime TimeCreated { get; set; }

        public DateTime TimeModified { get; set; }

        // We could use a Status property to analyze the processing
        // Could we use an enumeration??
        // public Boolean IsCompleted { get; set; } // needs to be removed

        public TaskStatus Status { get; set; }

        public int DestinationID { get; set; }
        public ContainerCollection Destination { get; set; }

        public int CompareTo(Task obj)
        {
            return this.Payload.ID.CompareTo(obj.Payload.ID);
        }
    }
}