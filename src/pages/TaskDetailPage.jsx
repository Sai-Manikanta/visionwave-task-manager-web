import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { api } from '../api/client.js';
import ConfirmModal from '../components/ConfirmModal.jsx';
import EmptyState from '../components/EmptyState.jsx';
import ErrorState from '../components/ErrorState.jsx';
import Field from '../components/Field.jsx';
import Modal from '../components/Modal.jsx';
import ProgressBar from '../components/ProgressBar.jsx';
import RichText from '../components/RichText.jsx';
import RichTextEditor from '../components/RichTextEditor.jsx';
import Spinner from '../components/Spinner.jsx';
import StatusBadge, { OverdueBadge } from '../components/StatusBadge.jsx';
import TaskForm from '../components/TaskForm.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { useFetch } from '../hooks/useFetch.js';
import { TASK_STATUSES } from '../utils/constants.js';
import { formatDateTime, formatDay } from '../utils/format.js';

function CompleteForm({ task, onClose, onSaved }) {
  const toast = useToast();
  const [summary, setSummary] = useState(task.finalSummary);
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);

  async function submit(event) {
    event.preventDefault();
    const found = {};
    if (!summary.trim()) found.finalSummary = 'Add a final summary.';
    setErrors(found);
    if (Object.keys(found).length) return;

    setBusy(true);
    try {
      const data = await api.post(`/tasks/${task.id}/complete`, { finalSummary: summary });
      toast.success(task.status === 'Completed' ? 'Final summary saved.' : 'Task completed.');
      onSaved(data.task);
    } catch (error) {
      setErrors(error.fields);
      toast.error(error.message);
      setBusy(false);
    }
  }

  return (
    <Modal title={task.status === 'Completed' ? 'Edit final summary' : 'Complete task'} onClose={onClose}>
      <form onSubmit={submit} noValidate className="space-y-4">
        <Field label="Final summary" required hint="What was delivered? Add any links here." error={errors.finalSummary}>
          {() => <RichTextEditor label="Final summary" value={summary} invalid={Boolean(errors.finalSummary)} onChange={setSummary} />}
        </Field>
        <div className="flex justify-end gap-2 pt-2">
          <button type="button" className="btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="btn-primary" disabled={busy}>
            {busy ? 'Saving…' : task.status === 'Completed' ? 'Save summary' : 'Complete task'}
          </button>
        </div>
      </form>
    </Modal>
  );
}

function ProgressControls({ task, onSaved, onComplete }) {
  const toast = useToast();
  const [percent, setPercent] = useState(task.completionPercent);
  const [busy, setBusy] = useState(false);

  useEffect(() => setPercent(task.completionPercent), [task.completionPercent]);

  async function save(body, message) {
    setBusy(true);
    try {
      const data = await api.put(`/tasks/${task.id}`, body);
      toast.success(message);
      onSaved(data.task);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setBusy(false);
    }
  }

  function changeStatus(status) {
    if (status === 'Completed') onComplete();
    else save({ status }, `Status changed to ${status}.`);
  }

  const isCompleted = task.status === 'Completed';

  return (
    <div className="card space-y-4 p-4">
      <Field label="Status">
        {(props) => (
          <select {...props} value={task.status} disabled={busy} onChange={(e) => changeStatus(e.target.value)}>
            {TASK_STATUSES.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        )}
      </Field>
      <Field label={`Completion: ${percent}%`} hint={isCompleted ? 'Completed tasks stay at 100%. Change the status to reopen.' : undefined}>
        {({ className: _unused, ...props }) => (
          <input
            {...props}
            type="range"
            min="0"
            max="100"
            step="5"
            className="w-full accent-brand-600"
            disabled={isCompleted || busy}
            value={percent}
            onChange={(e) => setPercent(Number(e.target.value))}
          />
        )}
      </Field>
      {percent !== task.completionPercent && (
        <button type="button" className="btn-primary w-full" disabled={busy} onClick={() => save({ completionPercent: percent }, 'Completion updated.')}>
          Save {percent}%
        </button>
      )}
      {!isCompleted && (
        <button type="button" className="btn-secondary w-full" onClick={onComplete}>
          Complete task
        </button>
      )}
    </div>
  );
}

function AssignToMe({ task, onSaved }) {
  const { user } = useAuth();
  const toast = useToast();
  const [busy, setBusy] = useState(false);

  async function assign() {
    setBusy(true);
    try {
      const data = await api.put(`/tasks/${task.id}`, { assignee: user.id });
      toast.success('Task assigned to you.');
      onSaved(data.task);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <button type="button" className="btn-primary w-full" disabled={busy} onClick={assign}>
      {busy ? 'Assigning…' : 'Assign to me'}
    </button>
  );
}

function UpdateForm({ task, onSaved }) {
  const toast = useToast();
  const [text, setText] = useState('');
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);

  async function submit(event) {
    event.preventDefault();
    const found = {};
    if (!text.trim()) found.text = 'Write a short update.';
    setErrors(found);
    if (Object.keys(found).length) return;

    setBusy(true);
    try {
      const data = await api.post(`/tasks/${task.id}/updates`, { text });
      toast.success('Update added.');
      setText('');
      onSaved(data.task);
    } catch (error) {
      setErrors(error.fields);
      toast.error(error.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} noValidate className="space-y-3">
      <Field label="Add a note or progress update" error={errors.text}>
        {(props) => <textarea {...props} rows={3} value={text} onChange={(e) => setText(e.target.value)} />}
      </Field>
      <button type="submit" className="btn-primary" disabled={busy}>
        {busy ? 'Adding…' : 'Add update'}
      </button>
    </form>
  );
}

export default function TaskDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const { data, loading, error, reload } = useFetch(`/tasks/${id}`);
  const [task, setTask] = useState(null);
  const [modal, setModal] = useState(null);

  useEffect(() => {
    if (data) setTask(data.task);
  }, [data]);

  if (error?.status === 404) {
    return (
      <EmptyState
        title="Task not found"
        message="It may have been deleted."
        action={
          <Link to="/tasks" className="btn-secondary">
            Back to all tasks
          </Link>
        }
      />
    );
  }
  if (error) return <ErrorState error={error} onRetry={reload} />;
  if (loading && !task) return <Spinner />;
  if (!task) return null;

  const saved = (next) => {
    setTask(next);
    setModal(null);
  };

  async function remove() {
    try {
      await api.delete(`/tasks/${task.id}`);
      toast.success('Task deleted.');
      navigate('/tasks');
    } catch (err) {
      toast.error(err.message);
    }
  }

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h1 className="page-title break-words">{task.title}</h1>
          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            <StatusBadge status={task.status} />
            {task.overdue && <OverdueBadge />}
          </div>
        </div>
        <div className="flex gap-2">
          <button type="button" className="btn-secondary" onClick={() => setModal('edit')}>
            Edit
          </button>
          <button type="button" className="btn-ghost-danger" onClick={() => setModal('delete')}>
            Delete
          </button>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_18rem]">
        <div className="min-w-0 space-y-4">
          <section className="card p-4">
            <ProgressBar value={task.completionPercent} label="Task completion" />
            {task.description ? (
              <RichText value={task.description} className="mt-4" />
            ) : (
              <p className="mt-4 text-sm text-slate-500">No description.</p>
            )}
          </section>

          {task.status === 'Completed' && (
            <section className="card p-4">
              <div className="flex items-center justify-between gap-2">
                <h2 className="section-title">Final summary</h2>
                <button type="button" className="link cursor-pointer text-sm" onClick={() => setModal('complete')}>
                  Edit
                </button>
              </div>
              <RichText value={task.finalSummary} className="mt-2" />
            </section>
          )}

          <section className="card p-4">
            <UpdateForm task={task} onSaved={setTask} />
          </section>

          <section className="card p-4">
            <h2 className="section-title mb-3">Updates</h2>
            {task.updates.length === 0 ? (
              <p className="text-sm text-slate-500">No updates yet.</p>
            ) : (
              <ul className="divide-y divide-slate-100">
                {task.updates.map((update) => (
                  <li key={update.id} className="py-3 first:pt-0 last:pb-0">
                    <RichText value={update.text} />
                    <p className="mt-1 text-xs text-slate-500">
                      {update.author?.name} · {formatDateTime(update.createdAt)}
                      {update.percent !== null && ` · ${update.percent}%`}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>

        <aside className="space-y-4">
          {!task.assignee && <AssignToMe task={task} onSaved={setTask} />}
          <ProgressControls task={task} onSaved={setTask} onComplete={() => setModal('complete')} />

          <section className="card p-4">
            <dl className="space-y-2 text-sm">
              {[
                ['Project', task.project ? <Link key="p" to={`/projects/${task.project.id}`} className="link">{task.project.name}</Link> : 'No project'],
                ['Assigned to', task.assignee?.name ?? 'Unassigned'],
                ['Created by', task.createdBy?.name],
                ['Priority', task.priority],
                ['Deadline', formatDay(task.deadline)],
                ...(task.completedAt ? [['Completed', formatDateTime(task.completedAt)]] : []),
              ].map(([label, value]) => (
                <div key={label}>
                  <dt className="text-xs text-slate-500">{label}</dt>
                  <dd className="text-slate-800">{value}</dd>
                </div>
              ))}
            </dl>
          </section>
        </aside>
      </div>

      {modal === 'edit' && <TaskForm task={task} onClose={() => setModal(null)} onSaved={saved} />}
      {modal === 'complete' && <CompleteForm task={task} onClose={() => setModal(null)} onSaved={saved} />}
      {modal === 'delete' && (
        <ConfirmModal
          title="Delete this task?"
          message={`"${task.title}" and its updates will be removed. This can't be undone.`}
          confirmLabel="Delete task"
          onConfirm={remove}
          onClose={() => setModal(null)}
        />
      )}
    </div>
  );
}
