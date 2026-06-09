/**
 * @module features/users
 * User profile & settings feature.
 */

export { ProfileHeaderCard } from "./components/profile-header-card";
export { ProfileStatBento } from "./components/profile-stat-bento";
export { ActivityTimeline } from "./components/activity-timeline";

export { useProfile } from "./hooks/useProfile";
export { userService } from "./services/user.service";

export { ProfilePage } from "./pages/ProfilePage";

export type { UserProfile, ProfileStats, ActivityItem } from "./types/user.types";
