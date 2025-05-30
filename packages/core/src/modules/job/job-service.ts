import type { JobId, JobWrite } from "@dotkomonline/types"
import { type ScheduledTask, schedule } from "node-cron"
import { JobNotEnabledError, JobNotFound, ScheduledTaskNotFound } from "./job-error"
import type { JobRepository } from "./job-repository"
import type { AnyJob, GenericJob } from "./jobs/generic-job"

type ScheduledTaskId = ScheduledTask["id"]

export type JobService = {
  create: (data: JobWrite) => Promise<AnyJob>
  update: (id: JobId, data: Partial<JobWrite>) => Promise<AnyJob>
  delete: (id: JobId) => Promise<void>
  getById: (id: JobId) => Promise<AnyJob | null>
  getScheduledJobById: (id: string) => AnyJob | null
  getScheduledJob: (id: JobId) => AnyJob
  getScheduledJobByScheduledTaskId: (scheduledTaskId: ScheduledTaskId) => AnyJob | null
  getAllScheduledJobs: () => AnyJob[]
  scheduleJob: (job: AnyJob) => AnyJob
  createAndScheduleJob: (data: JobWrite) => Promise<AnyJob>
  scheduleEnabledJobs: () => Promise<number>
  cancelScheduledJob: (id: JobId) => void
  cancelScheduledJobByScheduledTaskId: (scheduledTaskId: ScheduledTaskId) => void
}

export class JobServiceImpl implements JobService {
  private readonly jobsRepository: JobRepository

  public scheduledJobs: Map<JobId, AnyJob> = new Map()

  constructor(jobsRepository: JobRepository) {
    this.jobsRepository = jobsRepository
  }

  public async create(data: JobWrite) {
    return await this.jobsRepository.create(data)
  }

  public async update(id: JobId, data: Partial<JobWrite>) {
    return await this.jobsRepository.update(id, data)
  }

  public async delete(id: JobId) {
    const job = await this.jobsRepository.getById(id)

    if (!job) {
      throw new JobNotFound(id)
    }

    // If the job has a scheduled task, cancel it
    const scheduledJob = this.scheduledJobs.get(id)

    if (scheduledJob) {
      scheduledJob.scheduledTask?.destroy()
      this.scheduledJobs.delete(id)
    }

    await this.jobsRepository.delete(id)
  }

  public async getById(id: JobId) {
    return await this.jobsRepository.getById(id)
  }

  public getAllScheduledJobs() {
    return [...this.scheduledJobs.values()]
  }

  public scheduleJob(job: AnyJob) {
    if (!job.enabled) {
      throw new JobNotEnabledError(job.id)
    }

    const task = schedule(job.cronExpression, () => {
      job.handlerFunction(...job.payload)
    })

    job.scheduledTask = task
    this.scheduledJobs.set(job.id, job)

    return job
  }

  public getScheduledJob(id: JobId) {
    const job = this.scheduledJobs.get(id)

    if (!job) {
      throw new JobNotFound(id)
    }

    return job
  }

  public getScheduledJobById(id: string) {
    return this.scheduledJobs.get(id) || null
  }

  public getScheduledJobByScheduledTaskId(scheduledTaskId: ScheduledTaskId) {
    return this.getAllScheduledJobs().find((job) => job.scheduledTask?.id === scheduledTaskId) || null
  }

  public async createAndScheduleJob(data: JobWrite) {
    const job = await this.create(data)

    return this.scheduleJob(job)
  }

  public async scheduleEnabledJobs() {
    const jobs = await this.jobsRepository.getEnabledJobs()

    for (const job of jobs) {
      this.scheduleJob(job)
    }

    return jobs.length
  }

  private _cancelJob(job: GenericJob) {
    job.scheduledTask?.destroy()
    this.scheduledJobs.delete(job.id)
  }

  public cancelScheduledJobByScheduledTaskId(scheduledTaskId: ScheduledTaskId) {
    const job = this.getScheduledJobByScheduledTaskId(scheduledTaskId)

    if (!job) {
      throw new ScheduledTaskNotFound(scheduledTaskId)
    }

    this._cancelJob(job)
  }

  public cancelScheduledJob(id: JobId) {
    const job = this.getScheduledJob(id)

    if (!job) {
      throw new JobNotFound(id)
    }

    this._cancelJob(job)
  }
}
