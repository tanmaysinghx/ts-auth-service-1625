import prisma from "./db";

async function main() {
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
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
