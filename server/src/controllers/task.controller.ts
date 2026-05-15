import { Request, Response } from "express";
import asyncHandler from "../utils/asyncHandler";

import ApiError from "../utils/ApiError";
import { prisma } from "../config/db";

export const createTask = asyncHandler(async (req: Request, res: Response) => {
  const { title, description, priority, status, dueDate, assignedToId } = req.body;

  const task = await prisma.task.create({
    data: {
      title,
      description,
      priority,
      status,
      dueDate: dueDate ? new Date(dueDate) : undefined,
      createdById: req.user!.id,
      assignedToId,
    },
  });

  res.status(201).json({
    success: true,
    task,
  });
});

export const getTasks = asyncHandler(async (req: Request, res: Response) => {
  const {
    status,
    priority,
    page = 1,
    limit = 10,
    sort = "createdAt",
  } = req.query;

  const filters: any = {};

  if (status) filters.status = status;
  if (priority) filters.priority = priority;

  const tasks = await prisma.task.findMany({
    where: filters,
    include: {
      assignedTo: true,
      createdBy: true,
    },
    skip: (Number(page) - 1) * Number(limit),
    take: Number(limit),
    orderBy: {
      [sort as string]: "desc",
    },
  });

  const total = await prisma.task.count({ where: filters });

  res.json({
    success: true,
    data: tasks,
    total,
  });
});

export const getTaskById = asyncHandler(async (req: Request, res: Response) => {
  const taskId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

  const task = await prisma.task.findUnique({
    where: { id: taskId },
    include: {
      assignedTo: true,
      createdBy: true,
    },
  });

  if (!task) {
    throw new ApiError(404, "Task not found");
  }

  res.json({
    success: true,
    task,
  });
});

export const deleteTask = asyncHandler(async (req: Request, res: Response) => {
  const taskId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

  await prisma.task.delete({
    where: { id: taskId },
  });

  res.json({
    success: true,
    message: "Task deleted",
  });
});