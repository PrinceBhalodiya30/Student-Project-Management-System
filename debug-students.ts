
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    const students = await prisma.user.findMany({
        where: { role: 'STUDENT' },
        include: { StudentProfile: true }
    })
    console.log("Total students found:", students.length)
    console.log("--------------------------------------------------")
    students.forEach(s => {
        console.log(`Student: ${s.fullName} (${s.StudentProfile?.idNumber})`)
        console.log(`  GroupId: ${s.StudentProfile?.groupId}`)
        console.log("--------------------------------------------------")
    })
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
