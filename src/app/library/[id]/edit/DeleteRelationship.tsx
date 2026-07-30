'use client';

import { deleteRelationshipAction } from '@/app/actions';

/**
 * Deleting a relationship is irreversible, so it asks for confirmation before
 * the request leaves the browser.
 */
export default function DeleteRelationship({
  id,
  label,
  confirmText,
}: {
  id: number;
  label: string;
  confirmText: string;
}) {
  return (
    <form
      action={deleteRelationshipAction}
      onSubmit={(e) => {
        if (!window.confirm(confirmText)) e.preventDefault();
      }}
    >
      <input type="hidden" name="id" value={id} />
      <button type="submit" className="btn btn_danger btn_sm">
        {label}
      </button>
    </form>
  );
}
