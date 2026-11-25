"use client";

import { useActionState, useState, useTransition } from "react";
import { CheckCircle2, RotateCcw } from "lucide-react";
import {
  setujuiJurnalAction,
  revisiJurnalAction,
  type AdminActionState,
} from "@/actions/admin";

const initialState: AdminActionState = {};

export function AdminJournalActions({
  jurnalId,
  currentCatatan,
}: {
  jurnalId: number;
  currentCatatan?: string | null;
}) {
  const [isPendingApprove, startApproveTransition] = useTransition();
  const [feedback, setFeedback] = useState<AdminActionState>({});

  const boundRevisiAction = revisiJurnalAction.bind(null, jurnalId);
  const [revisiState, revisiFormAction, isPendingRevisi] = useActionState(
    boundRevisiAction,
    initialState,
  );

  function handleApprove() {
    setFeedback({});
    startApproveTransition(async () => {
      const res = await setujuiJurnalAction(jurnalId);
      setFeedback(res);
    });
  }

  return (
    <div className="space-y-3 min-w-[240px]">
      {feedback?.error && (
        <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg p-2">
          {feedback.error}
        </p>
      )}
      {feedback?.success && (
        <p className="text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg p-2">
          {feedback.success}
        </p>
      )}

      <button
        type="button"
        onClick={handleApprove}
        disabled={isPendingApprove}
        className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white text-xs font-semibold transition cursor-pointer"
      >
        <CheckCircle2 className="w-3.5 h-3.5" />
        {isPendingApprove ? "Menyetujui..." : "Setujui"}
      </button>

      <form
        action={revisiFormAction}
        className="space-y-2 pt-1 border-t border-slate-100"
      >
        <input
          type="text"
          name="catatan"
          defaultValue={currentCatatan ?? ""}
          placeholder="Catatan revisi (min. 5 huruf)"
          className="w-full rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500"
        />
        {revisiState?.error && (
          <p className="text-xs text-red-600">{revisiState.error}</p>
        )}
        {revisiState?.success && (
          <p className="text-xs text-emerald-700">{revisiState.success}</p>
        )}
        <button
          type="submit"
          disabled={isPendingRevisi}
          className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 disabled:opacity-60 text-white text-xs font-semibold transition cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          {isPendingRevisi ? "Mengirim..." : "Revisi"}
        </button>
      </form>
    </div>
  );
}
