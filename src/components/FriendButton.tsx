import Link from 'next/link';
import { acceptFriendAction, friendRequestAction, removeFriendAction } from '@/app/actions';
import type { FriendState } from '@/lib/types';

export interface FriendLabels {
  add: string;
  pending: string;
  accept: string;
  friends: string;
  remove: string;
  login: string;
}

/**
 * The friend control, which is also the gate on private relationship data:
 * accepting an invite is what reveals real names and locations to a viewer.
 */
export default function FriendButton({
  handle,
  state,
  labels,
  compact = false,
}: {
  handle: string;
  state: FriendState;
  labels: FriendLabels;
  compact?: boolean;
}) {
  const size = compact ? 'btn btn_sm' : 'btn';

  if (state === 'self') return null;

  if (state === 'anonymous') {
    return (
      <Link href="/login" className={`${size} btn_ghost`}>
        {labels.login}
      </Link>
    );
  }

  if (state === 'friends') {
    return (
      <form action={removeFriendAction} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <input type="hidden" name="handle" value={handle} />
        <span className="pill pill_accent">✓ {labels.friends}</span>
        <button type="submit" className={`${size} btn_ghost`}>
          {labels.remove}
        </button>
      </form>
    );
  }

  if (state === 'request_sent') {
    return (
      <form action={removeFriendAction} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <input type="hidden" name="handle" value={handle} />
        <span className="pill pill_mixed">{labels.pending}</span>
        <button type="submit" className={`${size} btn_ghost`}>
          ✕
        </button>
      </form>
    );
  }

  if (state === 'request_received') {
    return (
      <form action={acceptFriendAction}>
        <input type="hidden" name="handle" value={handle} />
        <button type="submit" className={`${size} btn_primary`}>
          {labels.accept}
        </button>
      </form>
    );
  }

  return (
    <form action={friendRequestAction}>
      <input type="hidden" name="handle" value={handle} />
      <button type="submit" className={`${size} btn_primary`}>
        + {labels.add}
      </button>
    </form>
  );
}
