import React from 'react';
import { toast } from 'react-toastify';
import { FormField } from '../../../shared/components/FormField';
import { ConfirmDialog } from '../../../shared/components/ConfirmDialog';
import {
  deleteContestQuiz,
  fetchContestQuiz,
  fetchContestSubmissions,
  saveContestQuiz,
  type ContestQuizForm,
  type ContestSubmissionRow,
} from '../adminPersonnel.service';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const inputClass =
  'h-9 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm font-semibold text-slate-800 outline-none focus:border-primary';

const textareaClass =
  'min-h-[5rem] w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-800 outline-none focus:border-primary';

const saveBtnClass =
  'inline-flex h-9 items-center justify-center rounded-lg bg-primary px-5 text-sm font-bold text-white transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50';

const dangerBtnClass =
  'inline-flex h-9 items-center justify-center rounded-lg border border-red-300 bg-white px-4 text-sm font-bold text-red-700 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50';

function formatDeadlinePreview(dateStr: string): string {
  if (!dateStr) return '';
  const [y, m, d] = dateStr.split('-').map((n) => Number(n));
  if (!y || !m || !d) return '';
  const yearSuffix = y !== new Date().getFullYear() ? ` ${y}` : '';
  return `Valid till ${d} ${MONTHS[m - 1]}${yearSuffix}`;
}

const emptyForm = (): ContestQuizForm => ({
  question: '',
  options: ['', '', '', ''],
  validUntil: '',
});

export const ContestQuizPanel: React.FC = () => {
  const [hasQuestion, setHasQuestion] = React.useState(false);
  const [form, setForm] = React.useState<ContestQuizForm>(emptyForm);
  const [submissions, setSubmissions] = React.useState<ContestSubmissionRow[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [deleting, setDeleting] = React.useState(false);
  const [confirmDelete, setConfirmDelete] = React.useState(false);

  const loadAll = React.useCallback(async () => {
    setLoading(true);
    try {
      const [quiz, records] = await Promise.all([fetchContestQuiz(), fetchContestSubmissions()]);
      setSubmissions(records);
      if (quiz.exists) {
        setHasQuestion(true);
        setForm({
          question: quiz.question,
          options: [...quiz.options, '', '', '', ''].slice(0, 4),
          validUntil: quiz.validUntil,
        });
      } else {
        setHasQuestion(false);
        setForm(emptyForm());
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to load contest');
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    void loadAll();
  }, [loadAll]);

  const setOption = (index: number, value: string) => {
    setForm((prev) => {
      const options = [...prev.options];
      options[index] = value;
      return { ...prev, options };
    });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const saved = await saveContestQuiz(form);
      if (saved.exists) {
        setHasQuestion(true);
        setForm({
          question: saved.question,
          options: [...saved.options, '', '', '', ''].slice(0, 4),
          validUntil: saved.validUntil,
        });
      }
      const records = await fetchContestSubmissions();
      setSubmissions(records);
      toast.success('Contest question saved');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to save contest question');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deleteContestQuiz();
      setHasQuestion(false);
      setForm(emptyForm());
      setSubmissions([]);
      setConfirmDelete(false);
      toast.success('Contest question removed');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to delete contest question');
    } finally {
      setDeleting(false);
    }
  };

  const deadlinePreview = formatDeadlinePreview(form.validUntil);

  if (loading) {
    return (
      <div className="mb-8 flex min-h-[6rem] items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50">
        <div className="h-7 w-7 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="mb-8 space-y-6">
      <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-5">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h3 className="text-sm font-bold uppercase tracking-wide text-slate-700">
            Win contest question
          </h3>
          {hasQuestion ? (
            <button
              type="button"
              className={dangerBtnClass}
              disabled={deleting}
              onClick={() => setConfirmDelete(true)}
            >
              Remove question
            </button>
          ) : null}
        </div>

        {!hasQuestion ? (
          <p className="mb-4 text-sm text-slate-600">
            No question on the website. Add one below to show it on the Win Contest page.
          </p>
        ) : null}

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <div className="lg:col-span-2">
            <FormField label="Question">
              <textarea
                className={textareaClass}
                value={form.question}
                onChange={(e) => setForm((p) => ({ ...p, question: e.target.value }))}
                placeholder="Enter the contest question shown on the website"
              />
            </FormField>
          </div>
          {[0, 1, 2, 3].map((i) => (
            <FormField key={i} label={`Option ${i + 1}`}>
              <input
                className={inputClass}
                value={form.options[i] ?? ''}
                onChange={(e) => setOption(i, e.target.value)}
                placeholder={`Answer option ${i + 1}`}
              />
            </FormField>
          ))}
          <FormField label="Valid until (last day to submit)">
            <input
              type="date"
              className={inputClass}
              value={form.validUntil}
              onChange={(e) => setForm((p) => ({ ...p, validUntil: e.target.value }))}
            />
          </FormField>
          <div className="flex items-end">
            {deadlinePreview ? (
              <p className="text-sm font-bold text-red-600 m-0">
                Website preview: {deadlinePreview}
              </p>
            ) : (
              <p className="text-sm text-slate-500 m-0">Pick a date to show the red deadline line on the website.</p>
            )}
          </div>
        </div>
        <div className="mt-4 flex justify-end">
          <button type="button" className={saveBtnClass} disabled={saving} onClick={() => void handleSave()}>
            {saving ? 'Saving…' : hasQuestion ? 'Update question' : 'Add question'}
          </button>
        </div>
      </div>

      {hasQuestion ? (
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-slate-700">
            Submitted answers ({submissions.length})
          </h3>
          {submissions.length === 0 ? (
            <p className="text-sm text-slate-500 m-0">No submissions yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] border-collapse text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-xs font-bold uppercase tracking-wide text-slate-500">
                    <th className="py-2 pr-4">Name</th>
                    <th className="py-2 pr-4">Email</th>
                    <th className="py-2 pr-4">Answer</th>
                    <th className="py-2">Submitted</th>
                  </tr>
                </thead>
                <tbody>
                  {submissions.map((row) => (
                    <tr key={row.id} className="border-b border-slate-100">
                      <td className="py-2 pr-4 font-semibold text-slate-800">
                        {row.participantName}
                        {row.username ? (
                          <span className="block text-xs font-normal text-slate-500">
                            @{row.username}
                          </span>
                        ) : null}
                      </td>
                      <td className="py-2 pr-4 text-slate-700">{row.participantEmail}</td>
                      <td className="py-2 pr-4 font-semibold text-slate-800">{row.answerText}</td>
                      <td className="py-2 whitespace-nowrap text-slate-600">
                        {row.submittedAt
                          ? new Date(row.submittedAt).toLocaleString()
                          : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ) : null}

      {confirmDelete ? (
        <ConfirmDialog
          title="Remove contest question"
          message="This removes the question from the website and clears all submitted answers. Continue?"
          confirmLabel="Remove"
          loading={deleting}
          onConfirm={() => void handleDelete()}
          onCancel={() => setConfirmDelete(false)}
        />
      ) : null}
    </div>
  );
};
