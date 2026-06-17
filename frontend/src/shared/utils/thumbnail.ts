const GRADIENTS = [
  "from-blue-500/20 via-purple-500/20 to-pink-500/20",
  "from-emerald-500/20 via-teal-500/20 to-cyan-500/20",
  "from-orange-500/20 via-rose-500/20 to-red-500/20",
  "from-indigo-500/20 via-violet-500/20 to-purple-500/20",
  "from-green-500/20 via-lime-500/20 to-emerald-500/20",
  "from-cyan-500/20 via-sky-500/20 to-blue-500/20",
  "from-amber-500/20 via-yellow-500/20 to-orange-500/20",
  "from-rose-500/20 via-pink-500/20 to-fuchsia-500/20",
];

export function getCourseGradient(id: string): string {
  const hash = id.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return GRADIENTS[hash % GRADIENTS.length];
}

export function getThumbnailUrl(id: string): string {
  const hash = id.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return `https://picsum.photos/seed/${hash}/400/225`;
}
