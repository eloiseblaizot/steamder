'use client';

import { deleteCustomGameAction } from '@/app/actions';

/** Deleting a submitted game also deletes its uploaded artwork, so confirm first. */
export default function DeleteCustomGame({
  slug,
  label,
  confirmText,
}: {
  slug: string;
  label: string;
  confirmText: string;
}) {
  return (
    <form
      action={deleteCustomGameAction}
      onSubmit={(e) => {
        if (!window.confirm(confirmText)) e.preventDefault();
      }}
    >
      <input type="hidden" name="slug" value={slug} />
      <button type="submit" className="btn btn_danger btn_sm">
        {label}
      </button>
    </form>
  );
}
