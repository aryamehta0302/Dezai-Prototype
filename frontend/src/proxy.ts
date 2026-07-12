export { auth as proxy } from "@/core/auth";

export const config = {
  matcher: ["/dashboard/:path*", "/programs/:path*", "/profile/:path*", "/catalog/:path*", "/leaderboard/:path*", "/enterprise/:path*", "/learning/:path*"],
};
