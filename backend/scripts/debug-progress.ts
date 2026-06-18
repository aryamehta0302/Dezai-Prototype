import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const userId = 'student-id-here'; // Replace with actual student ID if known, or search by email
    const user = await prisma.user.findFirst({ where: { role: 'STUDENT' } });
    if (!user) {
        console.log('No student user found');
        return;
    }

    const enrollments = await prisma.enrollment.findMany({
        where: { userId: user.id },
        include: {
            program: {
                include: {
                    tracks: {
                        include: {
                            modules: {
                                include: { lessons: true }
                            }
                        }
                    }
                }
            }
        }
    });

    for (const e of enrollments) {
        const allLessons = e.program.tracks.flatMap(t => t.modules.flatMap(m => m.lessons));
        const completed = await prisma.progress.count({
            where: { userId: user.id, lessonId: { in: allLessons.map(l => l.id) } }
        });
        console.log(`Program: ${e.program.title}`);
        console.log(`  Total Lessons: ${allLessons.length}`);
        console.log(`  Completed: ${completed}`);
        console.log(`  Reported Progress: ${e.progress}%`);
        console.log(`  Calculated Progress: ${Math.round((completed / allLessons.length) * 100)}%`);
    }
}

main().catch(console.error).finally(() => prisma.$disconnect());
