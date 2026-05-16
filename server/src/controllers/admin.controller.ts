import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import asyncHandler from "../utils/asyncHandler";
import ApiError from "../utils/ApiError";
import { prisma } from "../config/db";
import { removeFileIfExists } from "../utils/fileStorage";

const userSelect = {
  id: true,
  name: true,
  email: true,
  role: true,
  createdAt: true,
  updatedAt: true
};

export const getAdminStats = asyncHandler(
  async (req: Request, res: Response) => {
    const [
      totalUsers,
      totalTasks,
      completedTasks,
      pendingTasks,
      highPriorityTasks
    ] = await Promise.all([
      prisma.user.count(),
      prisma.task.count(),
      prisma.task.count({
        where: { status: "COMPLETED" }
      }),
      prisma.task.count({
        where: {
          status: {
            in: ["TODO", "IN_PROGRESS"]
          }
        }
      }),
      prisma.task.count({
        where: { priority: "HIGH" }
      })
    ]);

    res.json({
      success: true,
      stats: {
        totalUsers,
        totalTasks,
        completedTasks,
        pendingTasks,
        highPriorityTasks
      }
    });
  }
);

export const getUsers = asyncHandler(
  async (req: Request, res: Response) => {
    const {
      search = "",
      page = 1,
      limit = 10
    } = req.query;

    const where = search
      ? {
          OR: [
            {
              name: {
                contains: String(search),
                mode: "insensitive" as const
              }
            },
            {
              email: {
                contains: String(search),
                mode: "insensitive" as const
              }
            }
          ]
        }
      : {};

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: userSelect,
        skip: (Number(page) - 1) * Number(limit),
        take: Number(limit),
        orderBy: { createdAt: "desc" }
      }),
      prisma.user.count({ where })
    ]);

    res.json({
      success: true,
      data: users,
      total,
      page: Number(page),
      limit: Number(limit)
    });
  }
);

export const getUserById = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = String(req.params.id);
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        ...userSelect,
        assignedTasks: {
          select: {
            id: true,
            title: true,
            status: true,
            priority: true,
            dueDate: true
          },
          orderBy: { createdAt: "desc" }
        }
      }
    });

    if (!user) {
      throw new ApiError(404, "User not found");
    }

    res.json({
      success: true,
      user
    });
  }
);

export const createUser = asyncHandler(
  async (req: Request, res: Response) => {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password || !role) {
      throw new ApiError(400, "All fields are required");
    }

    if (password.length < 6) {
      throw new ApiError(
        400,
        "Password must be at least 6 characters"
      );
    }

    const existing = await prisma.user.findUnique({
      where: { email }
    });

    if (existing) {
      throw new ApiError(400, "Email already exists");
    }

    const hashedPassword = await bcrypt.hash(
      password,
      10
    );

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role
      },
      select: userSelect
    });

    res.status(201).json({
      success: true,
      user
    });
  }
);

export const updateUser = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = String(req.params.id);
    const { name, email, role } = req.body;

    const existing = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!existing) {
      throw new ApiError(404, "User not found");
    }

    if (email && email !== existing.email) {
      const emailOwner = await prisma.user.findUnique({
        where: { email }
      });

      if (emailOwner) {
        throw new ApiError(400, "Email already exists");
      }
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(name !== undefined ? { name } : {}),
        ...(email !== undefined ? { email } : {}),
        ...(role !== undefined ? { role } : {})
      },
      select: userSelect
    });

    res.json({
      success: true,
      user
    });
  }
);

export const deleteUser = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = String(req.params.id);
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      throw new ApiError(404, "User not found");
    }

    if (user.id === req.user?.id) {
      throw new ApiError(
        400,
        "You cannot delete your own admin account"
      );
    }

    const tasks = await prisma.task.findMany({
      where: {
        OR: [
          { createdById: user.id },
          { assignedToId: user.id }
        ]
      },
      include: { attachments: true }
    });

    await Promise.all(
      tasks.flatMap((task) =>
        task.attachments.map((attachment) =>
          removeFileIfExists(attachment.filepath)
        )
      )
    );

    await prisma.$transaction(async (tx) => {
      const taskIds = tasks.map((task) => task.id);

      if (taskIds.length) {
        await tx.attachment.deleteMany({
          where: {
            taskId: {
              in: taskIds
            }
          }
        });

        await tx.task.deleteMany({
          where: {
            id: {
              in: taskIds
            }
          }
        });
      }

      await tx.user.delete({
        where: { id: user.id }
      });
    });

    res.json({
      success: true,
      message: "User and related tasks deleted"
    });
  }
);
