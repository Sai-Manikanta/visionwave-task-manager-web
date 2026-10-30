import { useState } from 'react';
import { api } from '../api/client.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { useFetch } from '../hooks/useFetch.js';
import { PRIORITIES } from '../utils/constants.js';
import { validateTask } from '../utils/validation.js';
import Field from './Field.jsx';
import Modal from './Modal.jsx';
import RichTextEditor from './RichTextEditor.jsx';
import Spinner from './Spinner.jsx';

// Status and percent are edited on the task page; this form holds the task's details.
export default function TaskForm({ task, defaultProject = '', onClose, onSaved }) {
  const { user } = useAuth();
  const toast = useToast();
  const users = useFetch('/users');
  const projects = useFetch('/projects');
  const [values, setValues] = useState({
    title: task?.title ?? '',
    description: task?.description ?? '',
    project: task?.project?.id ?? defaultProject,
    assignee: task?.assignee?.id ?? '',
    priority: task?.priority ?? 'Medium',
    deadline: task?.deadline ?? '',
  });
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);

  const set = (key) => (e) => setValues((v) => ({ ...v, [key]: e.target.value }));

  async function submit(event) {
    event.preventDefault();
    const found = validateTask(values);
    setErrors(found);
    if (Object.keys(found).length) return;

    setBusy(true);
    const body = { ...values, project: values.project || null, assignee: values.assignee || null };
    try {
      const data = task ? await api.put(`/tasks/${task.id}`, body) : await api.post('/tasks', body);
      toast.success(task ? 'Task updated.' : 'Task created.');
      onSaved(data.task);
    } catch (error) {
      setErrors(error.fields);
      toast.error(error.message);
      setBusy(false);
    }
  }

  const loading = users.loading || projects.loading;
  const loadError = users.error || projects.error;

  return (
    <Modal title={task ? 'Edit task' : 'New task'} onClose={onClose}>
      {loading && <Spinner />}
      {!loading && loadError && <p role="alert" className="text-sm text-red-700">{loadError.message}</p>}
      {!loading && !loadError && (
        <form onSubmit={submit} noValidate className="space-y-4">
          <Field label="Title" required error={errors.title}>
            {(props) => <input {...props} value={values.title} onChange={set('title')} />}
          </Field>
          <Field label="Description" error={errors.description}>
            {() => (
              <RichTextEditor
                value={values.description}
                invalid={Boolean(errors.description)}
                onChange={(description) => setValues((v) => ({ ...v, description }))}
              />
            )}
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Project" error={errors.project}>
              {(props) => (
                <select {...props} value={values.project} onChange={set('project')}>
                  <option value="">No project</option>
                  {projects.data.projects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              )}
            </Field>
            <Field label="Assign to" error={errors.assignee}>
              {(props) => (
                <select {...props} value={values.assignee} onChange={set('assignee')}>
                  <option value="">Unassigned</option>
                  {users.data.users.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name}
                      {u.id === user.id ? ' (me)' : ''}
                    </option>
                  ))}
                </select>
              )}
            </Field>
            <Field label="Priority" error={errors.priority}>
              {(props) => (
                <select {...props} value={values.priority} onChange={set('priority')}>
                  {PRIORITIES.map((p) => (
                    <option key={p}>{p}</option>
                  ))}
                </select>
              )}
            </Field>
            <Field label="Deadline" required error={errors.deadline}>
              {(props) => <input {...props} type="date" value={values.deadline} onChange={set('deadline')} />}
            </Field>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={busy}>
              {busy ? 'Saving…' : task ? 'Save changes' : 'Create task'}
            </button>
          </div>
        </form>
      )}
    </Modal>
  );
}
