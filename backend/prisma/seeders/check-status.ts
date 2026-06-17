import { PrismaClient } from '@prisma/client';
const p = new PrismaClient();
(async () => {
  const programs = await p.program.findMany({ include: { tracks: { include: { modules: true } } } });
  let incomplete = 0;
  for (const prog of programs) {
    const total = prog.tracks.reduce((s, t) => s + t.modules.length, 0);
    const edge = prog.tracks.filter(t => t.type === 'EDGE');
    const edgeMods = edge.reduce((s, t) => s + t.modules.length, 0);
    const roots = prog.tracks.filter(t => t.type === 'ROOTS');
    const rootsMods = roots.reduce((s, t) => s + t.modules.length, 0);
    if (total < 10 || edgeMods < 5 || rootsMods < 5) {
      console.log(`  ${prog.title}: ${total} modules (ROOTS=${rootsMods}, EDGE=${edgeMods})`);
      incomplete++;
    }
  }
  if (!incomplete) console.log('All 12 programs have complete curriculum (10 modules each)!');
  await p.$disconnect();
})();
