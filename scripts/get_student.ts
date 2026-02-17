
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    const student = await prisma.user.findFirst({
        where: { role: 'STUDENT' },
        select: { email: true, password: true, name: true }
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
