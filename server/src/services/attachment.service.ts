import { prisma } from "../config/db";


export const createAttachment = async (data: any) => {
  return prisma.attachment.create({
    data,
  });
};

export const getAttachmentsByTask = async (taskId: string) => {
  return prisma.attachment.findMany({
    where: { taskId },
  });
};