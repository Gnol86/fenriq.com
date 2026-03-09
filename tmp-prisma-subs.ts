import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from './prisma/generated/client/client.ts';
(async()=>{
 const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }) });
 const subs = await prisma.subscription.findMany({ where: { referenceId: 'LQYvhMEuXCmBwYulDO2wSJaLmuJyyZjY' } });
 console.log(JSON.stringify(subs, null, 2));
 await prisma.$disconnect();
})();
