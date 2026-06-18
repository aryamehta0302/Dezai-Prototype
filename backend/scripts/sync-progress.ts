import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('--- RECALCULATING ALL ENROLLMENT PROGRESS ---');

    const enrollments = await prisma.enrollment.findMany({
        include: {
            program: {
                include: {
                    tracks: {
                        include: {
                            modules: {
                                include: { lessons: { select: { id: true } } }
                            }
                        }
                    }
                }
            }
        }
    });

    console.log(`Found ${enrollments.length} enrollments to process...`);

    for (const e of enrollments) {
        const allLessonIds = e.program.tracks.flatMap(t =>
            t.modules.flatMap(m => m.lessons.map(l => l.id))
        );

        if (allLessonIds.length === 0) {
            console.log(`Skipping program ${e.program.title} (No lessons found)`);
            continue;
        }

        const completedCount = await prisma.progress.count({
            where: {
                userId: e.userId,
                lessonId: { in: allLessonIds }
            }
        });

        const progressPercent = Math.round((completedCount / allLessonIds.length) * 100);

        console.log(`User ${e.userId} | Program: ${e.program.title}`);
        console.log(`  Lessons: ${completedCount}/${allLessonIds.length} -> ${progressPercent}% (Previous: ${e.progress}%)`);

        await prisma.enrollment.update({
            where: { id: e.id },
            data: {
                progress: progressPercent,
                completedAt: progressPercent >= 100 ? new Date() : null
            }
        });
    }

    console.log('--- DONE ---');
}

main().catch(console.error).finally(() => prisma.$disconnect());
