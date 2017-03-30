using System;

namespace Docker.Models
{
    /// <summary>
    /// The purpose of the task for now is just relocating
    /// the container X from
    /// its current location A to certain location B
    /// </summary>
    public class Task
    {
        public int ID { get; set; }
        public Container Payload { get; set; }

        // task dependencies
        // the things that violate the perfect flow
        // of the task and signify what is actually supposed
        // to happen beforehand for the MAIN task to be completed
        public Task PreviousTask { get; set; }

        public Task NextTask { get; set; }

        // time that it would most likely take to complete the task
        public TimeSpan RequiredTime { get; set; }

        // time tracking for task appearance and modifications
        public DateTime TimeCreated { get; set; }

        public DateTime TimeModified { get; set; }

        // We could use a Status property to analyze the processing
        // Could we use an enumeration??
        public Boolean IsCompleted { get; set; }

        // TODO: We also need the importance value
    }
}