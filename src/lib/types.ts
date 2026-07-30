export const STATUSES = [
  'ongoing',
  'situationship',
  'on_hold',
  'ended',
  'ghosted',
  'wishlist',
] as const;
export type Status = (typeof STATUSES)[number];

export const VERDICTS = ['recommended', 'not_recommended'] as const;
export type Verdict = (typeof VERDICTS)[number];

export const THEMES = ['crimson', 'ember', 'velvet', 'obsidian', 'rose'] as const;
export type Theme = (typeof THEMES)[number];

export const AVATAR_FRAMES = ['none', 'gold', 'flame', 'shattered', 'verified'] as const;
export type AvatarFrame = (typeof AVATAR_FRAMES)[number];

export const SHOWCASES = ['stats', 'achievements', 'top_rated', 'worst_rated'] as const;
export type Showcase = (typeof SHOWCASES)[number];

/** Row shape of the `users` table. */
export interface UserRow {
  id: number;
  handle: string;
  display_name: string;
  password_hash: string;
  bio: string;
  real_country: string;
  avatar_seed: string;
  avatar_frame: AvatarFrame;
  theme: Theme;
  showcase: Showcase;
  featured_relationship_id: number | null;
  created_at: string;
  last_seen_at: string;
}

/** A user without the password hash — safe to pass into components. */
export type PublicUser = Omit<UserRow, 'password_hash'>;

/** Row shape of the `relationships` table. */
export interface RelationshipRow {
  id: number;
  user_id: number;
  real_name: string;
  real_location: string;
  private_notes: string;
  game_slug: string;
  status: Status;
  verdict: Verdict;
  score: number;
  long_distance: 0 | 1;
  started_on: string;
  ended_on: string | null;
  review: string;
  tags: string;
  created_at: string;
  updated_at: string;
}

/**
 * A relationship as seen by a specific viewer.
 *
 * `revealed` is true only when the viewer owns the relationship or is an accepted
 * friend of the owner. When false, `real_name`, `real_location` and `private_notes`
 * are absent from the object entirely — not blanked, not present-but-empty — so a
 * component cannot leak them by accident.
 */
export type VisibleRelationship =
  | ({ revealed: true } & RelationshipRow)
  | ({ revealed: false } & Omit<RelationshipRow, 'real_name' | 'real_location' | 'private_notes'>);

export interface FriendshipRow {
  id: number;
  requester_id: number;
  addressee_id: number;
  status: 'pending' | 'accepted';
  created_at: string;
  responded_at: string | null;
}

export type FriendState =
  | 'self'
  | 'friends'
  | 'request_sent'
  | 'request_received'
  | 'none'
  | 'anonymous';
