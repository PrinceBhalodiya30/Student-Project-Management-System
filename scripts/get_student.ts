import { PrismaClient } from '../app/generated/prisma/client'

import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";

const connectionString = process.env.DATABASE_URL || "postgresql://postgres:password@localhost:5432/Student_Project_Management_System";
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter })

async function main() {
    const student = await prisma.user.findFirst({
        where: { role: 'STUDENT' },
        select: { email: true, password: true, fullName: true }
    })
    console.log('Student:', student)
}

main()
    .catch(e => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
