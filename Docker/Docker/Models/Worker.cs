namespace Docker.Models
{
    /// <summary>
    /// The worker class is an instance that the loader manages for executing task.
    /// Its only responsibility is to do the task that it was allocated with
    /// </summary>
    public class Worker
    {
        public int ID { get; set; }
        public Task AssignedTask { get; set; }

        /// PROPOSITION: could we add a speed?
        /// then we could calculate how much time
        /// did (or even would) it take the worker to complete
        /// the assigned task
        /// 

        /// NOW THIS MODEL SEEMS QUITE REDUNDANT, SINCE LOADER HAS OVERTAKEN THE RESPONSIBLITIES 
    }
}