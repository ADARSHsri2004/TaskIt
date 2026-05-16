
import bcrypt from "bcryptjs";
import { prisma } from "../src/config/db";

async function main() {
  const existing =
    await prisma.user.findUnique({
      where: {
        email:
          "admin@test.com"
      }
    });

  if (existing) {
    console.log(
      "Admin already exists"
    );

    return;
  }

  const hashedPassword =
    await bcrypt.hash(
      "123456",
      10
    );

  await prisma.user.create({
    data: {
      name:
        "Admin User",

      email:
        "admin@test.com",

      password:
        hashedPassword,

      role: "ADMIN"
    }
  });

  console.log(
    "Admin seeded"
  );
}

main();
