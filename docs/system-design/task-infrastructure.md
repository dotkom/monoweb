# Task Infrastructure System Design

> Parts of this document was transcribed from audio using Whisper. The text might not read perfectly.

This document describes the task infrastructure system in Monoweb, which is responsible for scheduling and executing
"tasks". The following image depicts the overall system architecture and the boundaries.

![Task Infrastructure System Design](../attachments/task-infrastructure.png)

An important part of the task service is keeping track of which database transactions are used where. For reference, a
database transaction is a rollbackable SQL query. This means that we can perform some queries, and if some precondition
fails somewhere, we can roll back everything that has been done. This is useful for keeping a system state consistent
and to prevent unexpected states in our database. The event system runs in two different transaction contexts. One is
the callers, seen on the left, and another is the executor itself, seen on the right.

Whenever a service call comes in to schedule a task, say somebody has registered a new event, their call runs in a
separate database transaction started at the router itself. This means that they may schedule as many tasks as they want
on our task scheduler, and if
something happens to go wrong later on in that call, the entire database change can be rolled back to before the request
began. This is important so we don't schedule tasks that will eventually fail because something else failed when the
task was scheduled.

The second transaction context is within the task executor itself. When the task executor wants to
execute a task, it creates a new database transaction for the task itself. This means that the code that a job might run
will be ran inside its own database transaction. Another implementation detail of the task executor is that updating the
state of the task, whether the task has completed, it's currently running, or failed, is ran outside of this transaction
so that we guarantee that regardless if the task itself rolls back, the state of the job is always updated.

## Components

So the event system effectively has five components.

1. The TaskService that is primarily used by the local backends to persist the tasks that have been registered. The task
   service is also responsible for ensuring that the payload data that is sent to a task is valid according to that
   task's definition.
2. The TaskScheduler is a component that allows a caller to schedule a task to be executed at some point in the future.
   The scheduler supports both regular jobs that run on an interval and one-off jobs that run at a specific set point in
   time. An example use of the task scheduler involves the attendance service wanting to merge the attendance pools of
   an event. Because this operation happens at a fixed time, for example, one day before the event starts, the
   attendance service needs to register a task on the scheduler to merge the pools at that point in the future. We may
   also want to send weekly newsletters to every single member. To do this, we could specify a newsletter service that
   schedules a task that runs every Monday to gather an overview of the coming events and construct an email to send to
   all of our users.
3. TaskDiscovery is the component that determines which tasks are supposed to run right now. As tasks are scheduled, we
   run an interval to see how often we try to execute tasks. Therefore, the precision of task execution is not fully
   guaranteed and may vary based on how the executor is configured. Task discovery is responsible for querying the
   database or polling an external queue to determine which tasks are ready for execution.
4. The TaskExecutor receives the tasks from the discovery component and actually performs the jobs.

### Local PostgreSQL Backend

As seen in the diagram, the Postgres database is used by absolutely everything in the task system. Whenever the task
scheduler has a new task it wants to schedule, it creates a new record in the Postgres database under the task table.
Task discovery reads from this table to determine the available jobs and forwards them to the task executor. When the
task executor has finished a task, it will then update the database and mark the job as either completed or failed based
on the job outcome.

![Task Infrastructure on Local PostgreSQL](../attachments/postgres-task-system.png)

