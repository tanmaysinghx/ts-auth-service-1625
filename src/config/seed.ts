import prisma from "./db";
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import dotenv from 'dotenv';
import logger from "../utils/logger";
dotenv.config();

/* Function needed to seed intial data to DB */
async function main() {
  logger.info("Database URL:", process.env.DATABASE_URL);
  await prisma.role.createMany({
    data: [
      { id: '0001', roleName: 'superuser' },
      { id: '0002', roleName: 'admin' },
      { id: '0003', roleName: 'editor' },
      { id: '0004', roleName: 'viewer' },
      { id: '0005', roleName: 'user' },
      { id: '0006', roleName: 'guest' },
      { id: '0007', roleName: 'moderator' },
      { id: '0008', roleName: 'operator' },
      { id: '0009', roleName: 'analyst' },
      { id: '0010', roleName: 'developer' },
    ]
  });
  const hashedPassword = await bcrypt.hash("password", 10);
  await prisma.user.createMany({
    data: [
      {
        id: uuidv4().slice(0, 8),
        email: "superuser@gmail.com",
        password: hashedPassword,
        roleId: "0001"
      },
      {
        id: uuidv4().slice(0, 8),
        email: "admin@gmail.com",
        password: hashedPassword,
        roleId: "0002"
      },

      {
        id: uuidv4().slice(0, 8),
        email: "user@gmail.com",
        password: hashedPassword,
        roleId: "0005"
      },
      {
        id: uuidv4().slice(0, 8),
        email: "guest@gmail.com",
        password: hashedPassword,
        roleId: "0006"
      },
      {
        id: uuidv4().slice(0, 8),
        email: "developer@gmail.com",
        password: hashedPassword,
        roleId: "0010"
      },
    ]
  });
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    logger.info("Data has been seeded successfully!");
  });
