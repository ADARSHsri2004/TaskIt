import { prisma } from "../config/db";

export const createTask = async (data: any) => {
  return prisma.task.create({
    data,
  });
};

export const getTaskById = async (id: string) => {
  return prisma.task.findUnique({
    where: { id },
    include: {
      assignedTo: true,
      createdBy: true,
    },
  });
};

export const deleteTask = async (id: string) => {
  return prisma.task.delete({
    where: { id },
  });
};