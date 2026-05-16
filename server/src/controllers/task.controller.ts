import path from "path";
import { Request, Response } from "express";
import asyncHandler from "../utils/asyncHandler";
import ApiError from "../utils/ApiError";
import { prisma } from "../config/db";
import {
  getStoredFilename,
  removeFileIfExists,
  uploadDir
} from "../utils/fileStorage";

const userSelect = {
  id: true,
  name: true,
  email: true,
  role: true
};

export const createTask = asyncHandler(
  async (req: Request, res: Response) => {
    const {
      title,
      description,
      priority,
      status,
      dueDate,
      assignedToId
    } = req.body;

    const files = req.files as Express.Multer.File[];

    if (!title) {
      throw new ApiError(400, "Title is required");
    }

    if (files && files.length > 3) {
      throw new ApiError(400, "Max 3 files allowed");
    }

    const task = await prisma.task.create({
      data: {
        title,
        description,
        priority,
        status,
        dueDate: dueDate ? new Date(dueDate) : undefined,
        createdById: req.user!.id,
        assignedToId: assignedToId || null
      }
    });

    if (files?.length) {
      await prisma.attachment.createMany({
        data: files.map((file) => ({
          filename: file.originalname,
          filepath: file.path,
          mimetype: file.mimetype,
          taskId: task.id
        }))
      });
    }

    const fullTask = await prisma.task.findUnique({
      where: { id: task.id },
      include: {
        attachments: true,
        assignedTo: { select: userSelect },
        createdBy: { select: userSelect }
      }
    });

    res.status(201).json({
      success: true,
      task: fullTask
    });
  }
);

export const getTasks = asyncHandler(
  async (req: Request, res: Response) => {
    const {
      status,
      priority,
      search,
      sort = "newest",
      page = 1,
      limit = 10
    } = req.query;

    const filters: any = {};

    if (status) {
      filters.status = status;
    }

    if (priority) {
      filters.priority = priority;
    }

    if (search) {
      filters.OR = [
        {
          title: {
            contains: String(search),
            mode: "insensitive"
          }
        },
        {
          description: {
            contains: String(search),
            mode: "insensitive"
          }
        }
      ];
    }

    if (req.user!.role !== "ADMIN") {
      filters.assignedToId = req.user!.id;
    }

    const orderBy =
      sort === "oldest"
        ? { createdAt: "asc" as const }
        : { createdAt: "desc" as const };

    const [tasks, total] = await Promise.all([
      prisma.task.findMany({
        where: filters,
        include: {
          assignedTo: { select: userSelect },
          createdBy: { select: userSelect },
          attachments: true
        },
        skip: (Number(page) - 1) * Number(limit),
        take: Number(limit),
        orderBy
      }),
      prisma.task.count({ where: filters })
    ]);

    res.json({
      success: true,
      data: tasks,
      total,
      page: Number(page),
      limit: Number(limit)
    });
  }
);

export const getTaskById = asyncHandler(
  async (req: Request, res: Response) => {
    const taskId = String(req.params.id);
    const task = await prisma.task.findUnique({
      where: { id: taskId },
      include: {
        assignedTo: { select: userSelect },
        createdBy: { select: userSelect },
        attachments: true
      }
    });

    if (!task) {
      throw new ApiError(404, "Task not found");
    }

    if (
      req.user!.role !== "ADMIN" &&
      task.assignedToId !== req.user!.id
    ) {
      throw new ApiError(403, "Not allowed to view this task");
    }

    res.json({
      success: true,
      task
    });
  }
);

export const updateTask = asyncHandler(
  async (req: Request, res: Response) => {
    const taskId = String(req.params.id);

    const task = await prisma.task.findUnique({
      where: { id: taskId }
    });

    if (!task) {
      throw new ApiError(404, "Task not found");
    }

    if (
      req.user!.role !== "ADMIN" &&
      task.assignedToId !== req.user!.id
    ) {
      throw new ApiError(403, "Not allowed to update this task");
    }

    const {
      title,
      description,
      priority,
      status,
      dueDate,
      assignedToId,
      deleteAttachmentIds
    } = req.body;

    const files = req.files as Express.Multer.File[];
    const idsToDelete = deleteAttachmentIds
      ? Array.isArray(deleteAttachmentIds)
        ? deleteAttachmentIds
        : String(deleteAttachmentIds)
            .split(",")
            .map((id) => id.trim())
            .filter(Boolean)
      : [];

    const existingAttachments =
      await prisma.attachment.findMany({
        where: { taskId }
      });

    if (
      existingAttachments.length -
        idsToDelete.length +
        (files?.length || 0) >
      3
    ) {
      throw new ApiError(400, "Max 3 files allowed");
    }

    const attachmentsToDelete =
      existingAttachments.filter((attachment) =>
        idsToDelete.includes(attachment.id)
      );

    await Promise.all(
      attachmentsToDelete.map((attachment) =>
        removeFileIfExists(attachment.filepath)
      )
    );

    const updated = await prisma.$transaction(async (tx) => {
      if (idsToDelete.length) {
        await tx.attachment.deleteMany({
          where: {
            id: { in: idsToDelete },
            taskId
          }
        });
      }

      const savedTask = await tx.task.update({
        where: { id: taskId },
        data: {
          ...(title !== undefined ? { title } : {}),
          ...(description !== undefined ? { description } : {}),
          ...(priority !== undefined ? { priority } : {}),
          ...(status !== undefined ? { status } : {}),
          ...(dueDate !== undefined
            ? {
                dueDate: dueDate
                  ? new Date(dueDate)
                  : null
              }
            : {}),
          ...(assignedToId !== undefined
            ? { assignedToId: assignedToId || null }
            : {})
        }
      });

      if (files?.length) {
        await tx.attachment.createMany({
          data: files.map((file) => ({
            filename: file.originalname,
            filepath: file.path,
            mimetype: file.mimetype,
            taskId
          }))
        });
      }

      return savedTask;
    });

    const fullTask = await prisma.task.findUnique({
      where: { id: updated.id },
      include: {
        assignedTo: { select: userSelect },
        createdBy: { select: userSelect },
        attachments: true
      }
    });

    res.json({
      success: true,
      task: fullTask
    });
  }
);

export const deleteTask = asyncHandler(
  async (req: Request, res: Response) => {
    const taskId = String(req.params.id);

    const task = await prisma.task.findUnique({
      where: { id: taskId }
    });

    if (!task) {
      throw new ApiError(404, "Task not found");
    }

    if (
      req.user!.role !== "ADMIN" &&
      task.assignedToId !== req.user!.id
    ) {
      throw new ApiError(403, "Not allowed to delete this task");
    }

    const attachments = await prisma.attachment.findMany({
      where: { taskId }
    });

    await Promise.all(
      attachments.map((attachment) =>
        removeFileIfExists(attachment.filepath)
      )
    );

    await prisma.$transaction([
      prisma.attachment.deleteMany({
        where: { taskId }
      }),
      prisma.task.delete({
        where: { id: taskId }
      })
    ]);

    res.json({
      success: true,
      message: "Task deleted"
    });
  }
);

export const downloadTaskFile = asyncHandler(
  async (req: Request, res: Response) => {
    const filename = path.basename(String(req.params.filename));
    const attachment = await prisma.attachment.findFirst({
      where: {
        filepath: {
          endsWith: filename
        }
      },
      include: {
        task: true
      }
    });

    if (!attachment) {
      throw new ApiError(404, "File not found");
    }

    if (
      req.user!.role !== "ADMIN" &&
      attachment.task.assignedToId !== req.user!.id
    ) {
      throw new ApiError(
        403,
        "Not allowed to access this file"
      );
    }

    res.download(
      path.join(
        uploadDir,
        getStoredFilename(attachment.filepath)
      ),
      attachment.filename
    );
  }
);
