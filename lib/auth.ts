const USER_KEY = "amax_user";
const PROFILE_IMAGE_KEY = "amax_profile_image";

export interface UserProfile {
  username: string;
  displayName: string;
  avatar: string;
  profileImage?: string;
  createdAt: number;
}

const AVATARS = [
  "🎵", "🎶", "🎧", "🎤", "🎸", "🎹", "🥁", "🎺",
  "🎻", "🪗", "🎷", "🪕", "🎼", "🎙️", "🔊", "🎚️",
];

export function getUser(): UserProfile | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function loginUser(username: string, displayName: string): UserProfile {
  const user: UserProfile = {
    username: username.trim().toLowerCase(),
    displayName: displayName.trim() || username.trim(),
    avatar: AVATARS[Math.floor(Math.random() * AVATARS.length)],
    createdAt: Date.now(),
  };
  if (typeof window !== "undefined") {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  }
  return user;
}

export function updateUser(updates: Partial<UserProfile>): UserProfile | null {
  const user = getUser();
  if (!user) return null;
  const updated = { ...user, ...updates };
  if (typeof window !== "undefined") {
    localStorage.setItem(USER_KEY, JSON.stringify(updated));
  }
  return updated;
}

export function logoutUser(): void {
  if (typeof window !== "undefined") {
    localStorage.removeItem(USER_KEY);
  }
}

export function getRandomAvatar(): string {
  return AVATARS[Math.floor(Math.random() * AVATARS.length)];
}

export function getProfileImage(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return localStorage.getItem(PROFILE_IMAGE_KEY);
  } catch {
    return null;
  }
}

export function setProfileImage(dataUrl: string): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(PROFILE_IMAGE_KEY, dataUrl);
  } catch {
    // storage full
  }
}

export function removeProfileImage(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(PROFILE_IMAGE_KEY);
}

export { AVATARS };
