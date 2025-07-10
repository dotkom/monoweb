# Scheduling Tasks

Monoweb has support for scheduling tasks onto a task queue that is processed asynchronously. This allows us to schedule
code to run in the future, such as sending transactional email, merging attendance pools, or other background tasks.

## Adding a new task kind

We enforce strict enumeration of the task kinds to prevent accidental typos and system inconsistencies. To add a new
task, follow these steps:

1. Add a new entry in the `taskName` enum in `/packages/db/prisma/schema.prisma` and create a new migration with
   `cd packages/db && pnpm prisma migrate dev --name <migration_name>`.
2. Create a new task definition inside `/packages/core/src/modules/task/task-definition.ts` which uses the new entry in 
   the Prisma TaskKind enum as the `kind` field. The `getSchema` method should return a Zod schema to use for the task
   payload. The task payload is NOT optional, but if you do not need it, you can use an empty object with
   `z.object({})`.
3. Write the code for the task itself in whichever service is appropriate. Next, if the `getTaskExecutor` function does
   not already take the service you need, add it as a parameter and update `core.ts` accordingly.
4. Add a new case in the `run` method of the task executor to handle the new task kind. This method should not have any
   logic in it, and ONLY call the service method that handles the task logic with the payload.

Then you can use the TaskService in your other service to create new tasks with the new task name, and they will be
processed automatically.
