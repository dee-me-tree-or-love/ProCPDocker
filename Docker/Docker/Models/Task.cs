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
        public Container Payload { get; set; }

        // time that it would most likely take to complete the task
        public TimeSpan RequiredTime { get; set; }

        // time tracking for task appearance and modifications
        public DateTime TimeCreated { get; set; }

        public DateTime TimeModified { get; set; }

        // We could use a Status property to analyze the processing
        // Could we use an enumeration??
        // public Boolean IsCompleted { get; set; } // needs to be removed

        public TaskStatus Status { get; set; }

        public ContainerCollection Destination { get; set; }

        public int CompareTo(Task obj)
        {
            return this.Payload.ID.CompareTo(obj.Payload.ID);
        }
    }
}