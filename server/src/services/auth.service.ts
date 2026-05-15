import { prisma } from "../config/db";


export const findUserByEmail = async (
  email: string
) => {
  return prisma.user.findUnique({
    where: {
      email
    }
  });
};
 
export const createUser = async (
  data: any
) => {
  return prisma.user.create({
    data
  });
};