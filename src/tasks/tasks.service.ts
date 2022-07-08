import { Injectable, NotFoundException } from '@nestjs/common';
import { TaskStatus } from './task-status';
import { CreateTaskDTO } from './DTO/create-task.dto';
import { GetTaskFilterDTO } from './DTO/get-task-filter.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Task } from './task.entity';
import { Repository } from 'typeorm';
import { User } from 'src/auth/user.entity';

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(Task) private tasksRepository: Repository<Task>,
  ) {}

  async getTasks(filterDTO: GetTaskFilterDTO, user: User): Promise<Task[]> {
    const { status, search } = filterDTO;

    const query = this.tasksRepository.createQueryBuilder('task');
    query.where({ user });
    if (status) {
      query.andWhere('task.status = :status', { status });
    }

    if (search) {
      query.andWhere(
        '(LOWER(task.title) LIKE LOWER(:search) OR LOWER(task.description) LIKE LOWER(:search))',
        { search: `%${search}%` },
      );
    }

    const tasks = await query.getMany();
    return tasks;
  }

  async getTaskById(id: string, user: User): Promise<Task> {
    const result = await this.tasksRepository.findOne({
      where: { id, user },
    });

    if (!result) throw new NotFoundException(`Task with Id ${id} not found`);

    return result;
  }

  async createTask(createTaskDTO: CreateTaskDTO, user: User): Promise<Task> {
    const { title, description } = createTaskDTO;
    const task = this.tasksRepository.create({
      title,
      description,
      status: TaskStatus.OPEN,
      user,
    });

    return await this.tasksRepository.save(task);
  }

  async deleteTask(id: string, user: User): Promise<void> {
    const { affected } = await this.tasksRepository.delete({ id, user });
    if (!affected) throw new NotFoundException('Task with the given ID  found');
  }

  async updateTaskStatus(
    id: string,
    status: TaskStatus,
    user: User,
  ): Promise<Task> {
    const task = await this.getTaskById(id, user);

    task.status = status;

    await this.tasksRepository.save(task);

    return task;
  }
}
