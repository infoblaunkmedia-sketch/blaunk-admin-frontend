import React from 'react';
import { toast } from 'react-toastify';
import { FormField } from '../../../shared/components/FormField';
import { ConfirmDialog } from '../../../shared/components/ConfirmDialog';
import {
  deleteContestQuiz,
  fetchContestQuiz,
  saveContestQuiz,
  type ContestQuizForm,
} from '../adminPersonnel.service';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const inputClass =
  'h-9 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm font-semibold text-slate-800 outline-none focus:border-primary';

const textareaClass =
  'min-h-[5rem] w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-800 outline-none focus:border-primary';

const saveBtnClass =
  'inline-flex h-9 min-w-[5.5rem] items-center justify-center rounded-lg bg-primary px-5 text-sm font-bold text-white transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50';

const addBtnClass =
  'inline-flex h-9 items-center justify-center rounded-lg bg-primary px-4 text-sm font-bold text-white transition hover:bg-primary/90';

const editBtnClass =
  'inline-flex h-9 min-w-[5.5rem] items-center justify-center rounded-lg border border-slate-300 bg-white px-5 text-sm font-bold text-slate-700 transition hover:bg-slate-50';

const cancelBtnClass =
  'inline-flex h-9 min-w-[5.5rem] items-center justify-center rounded-lg border border-slate-300 bg-white px-5 text-sm font-bold text-slate-700 transition hover:bg-slate-50';

const dangerBtnClass =
  'inline-flex h-8 items-center justify-center rounded-lg border border-red-300 bg-white px-3 text-xs font-bold text-red-700 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50';

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
  correctOptionIndex: '',
});

type QuestionRow = {
  question: string;
  options: string[];
  validUntil: string;
  deadlinePreview: string;
  correctOptionIndex: number | null;
};

export const ContestQuizPanel: React.FC = () => {
  const [question, setQuestion] = React.useState<QuestionRow | null>(null);
  const [form, setForm] = React.useState<ContestQuizForm>(emptyForm());
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [deleting, setDeleting] = React.useState(false);
  const [showForm, setShowForm] = React.useState(false);
  const [confirmDelete, setConfirmDelete] = React.useState(false);

  const loadAll = React.useCallback(async () => {
    setLoading(true);
    try {
      const quiz = await fetchContestQuiz();
      if (quiz.exists) {
        setQuestion({
          question: quiz.question,
          options: quiz.options,
          validUntil: quiz.validUntil,
          deadlinePreview: quiz.deadlinePreview,
          correctOptionIndex: quiz.correctOptionIndex,
        });
      } else {
        setQuestion(null);
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

  const openAdd = () => {
    setForm(emptyForm());
    setShowForm(true);
  };

  const openEdit = () => {
    if (!question) return;
    setForm({
      question: question.question,
      options: [...question.options, '', '', '', ''].slice(0, 4),
      validUntil: question.validUntil,
      correctOptionIndex:
        question.correctOptionIndex != null ? question.correctOptionIndex : '',
    });
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setForm(emptyForm());
  };

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
        setQuestion({
          question: saved.question,
          options: saved.options,
          validUntil: saved.validUntil,
          deadlinePreview: saved.deadlinePreview,
          correctOptionIndex: saved.correctOptionIndex,
        });
      }
      setShowForm(false);
      setForm(emptyForm());
      toast.success(question ? 'Question updated' : 'Question added');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to save question');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deleteContestQuiz();
      setQuestion(null);
      setShowForm(false);
      setForm(emptyForm());
      setConfirmDelete(false);
      toast.success('Question removed');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to delete question');
    } finally {
      setDeleting(false);
    }
  };

  const deadlinePreview = formatDeadlinePreview(form.validUntil);
  const finalAnswerLabel =
    question?.correctOptionIndex != null && question.correctOptionIndex >= 0
      ? question.options[question.correctOptionIndex] || '—'
      : '—';

  if (loading) {
    return (
      <div className="mb-8 flex min-h-[4rem] items-center justify-center">
        <div className="h-7 w-7 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="mb-8 space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-sm font-bold uppercase tracking-wide text-slate-700 m-0">
          Contest questions
        </h3>
        {!question && !showForm ? (
          <button type="button" className={addBtnClass} onClick={openAdd}>
            + Add
          </button>
        ) : null}
      </div>

      {!showForm ? (
        <div className="overflow-x-auto rounded-lg border border-slate-200">
          <table className="w-full min-w-[480px] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-xs font-bold uppercase tracking-wide text-slate-500">
                <th className="px-4 py-2">Question</th>
                <th className="px-4 py-2">Valid until</th>
                <th className="px-4 py-2">Final ans</th>
                <th className="px-4 py-2 w-28">Action</th>
              </tr>
            </thead>
            <tbody>
              {question ? (
                <tr className="border-b border-slate-100">
                  <td className="px-4 py-3 font-semibold text-slate-800">{question.question}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-slate-600">
                    {question.deadlinePreview || question.validUntil || '—'}
                  </td>
                  <td className="px-4 py-3 text-slate-700">{finalAnswerLabel}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button type="button" className={editBtnClass} onClick={openEdit}>
                        Edit
                      </button>
                      <button
                        type="button"
                        className={dangerBtnClass}
                        disabled={deleting}
                        onClick={() => setConfirmDelete(true)}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                <tr>
                  <td colSpan={4} className="px-4 py-6 text-center text-slate-500">
                    No questions yet. Click + Add to create one.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="rounded-lg border border-slate-200 p-4">
          <h4 className="mb-4 text-sm font-bold text-slate-800 m-0">
            {question ? 'Edit question' : 'Add question'}
          </h4>
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <div className="lg:col-span-2">
              <FormField label="Question">
                <textarea
                  className={textareaClass}
                  value={form.question}
                  onChange={(e) => setForm((p) => ({ ...p, question: e.target.value }))}
                  placeholder="Enter the contest question"
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
            <FormField label="Valid until">
              <input
                type="date"
                className={inputClass}
                value={form.validUntil}
                onChange={(e) => setForm((p) => ({ ...p, validUntil: e.target.value }))}
              />
            </FormField>
            <FormField label="Final ans">
              <select
                className={inputClass}
                value={form.correctOptionIndex === '' ? '' : String(form.correctOptionIndex)}
                onChange={(e) =>
                  setForm((p) => ({
                    ...p,
                    correctOptionIndex: e.target.value === '' ? '' : Number(e.target.value),
                  }))
                }
              >
                <option value="">Select correct option…</option>
                {[0, 1, 2, 3].map((i) => (
                  <option key={i} value={i} disabled={!form.options[i]?.trim()}>
                    Option {i + 1}
                    {form.options[i]?.trim() ? `: ${form.options[i]}` : ''}
                  </option>
                ))}
              </select>
            </FormField>
            <div className="flex items-end">
              {deadlinePreview ? (
                <p className="text-sm font-bold text-red-600 m-0">Preview: {deadlinePreview}</p>
              ) : (
                <p className="text-sm text-slate-500 m-0">Pick the last day to accept answers.</p>
              )}
            </div>
          </div>
          <div className="mt-4 flex justify-end gap-2">
            <button type="button" className={cancelBtnClass} onClick={closeForm}>
              Cancel
            </button>
            <button type="button" className={saveBtnClass} disabled={saving} onClick={() => void handleSave()}>
              {saving ? 'Saving…' : 'Save'}
            </button>
          </div>
        </div>
      )}

      {confirmDelete ? (
        <ConfirmDialog
          title="Delete question"
          message="Remove this question from the website? All submitted answers will also be cleared."
          confirmLabel="Delete"
          loading={deleting}
          onConfirm={() => void handleDelete()}
          onCancel={() => setConfirmDelete(false)}
        />
      ) : null}
    </div>
  );
};
