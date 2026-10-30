import { useState } from 'react';
import { api } from '../api/client.js';
import { useToast } from '../context/ToastContext.jsx';
import { PROJECT_STATUSES } from '../utils/constants.js';
import { validateProject } from '../utils/validation.js';
import Field from './Field.jsx';
import Modal from './Modal.jsx';
import RichTextEditor from './RichTextEditor.jsx';

export default function ProjectForm({ project, onClose, onSaved }) {
  const toast = useToast();
  const [values, setValues] = useState({
    name: project?.name ?? '',
    description: project?.description ?? '',
    deadline: project?.deadline ?? '',
    status: project?.status ?? 'Active',
  });
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);

  const set = (key) => (e) => setValues((v) => ({ ...v, [key]: e.target.value }));

  async function submit(event) {
    event.preventDefault();
    const found = validateProject(values);
    setErrors(found);
    if (Object.keys(found).length) return;

    setBusy(true);
    const body = { ...values, deadline: values.deadline || null };
    try {
      const data = project ? await api.put(`/projects/${project.id}`, body) : await api.post('/projects', body);
      toast.success(project ? 'Project updated.' : 'Project created.');
      onSaved(data.project);
    } catch (error) {
      setErrors(error.fields);
      toast.error(error.message);
      setBusy(false);
    }
  }

  return (
    <Modal title={project ? 'Edit project' : 'New project'} onClose={onClose}>
      <form onSubmit={submit} noValidate className="space-y-4">
        <Field label="Name" required error={errors.name}>
          {(props) => <input {...props} value={values.name} onChange={set('name')} />}
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
          <Field label="Status" error={errors.status}>
            {(props) => (
              <select {...props} value={values.status} onChange={set('status')}>
                {PROJECT_STATUSES.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            )}
          </Field>
          <Field label="Deadline" error={errors.deadline}>
            {(props) => <input {...props} type="date" value={values.deadline} onChange={set('deadline')} />}
          </Field>
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <button type="button" className="btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="btn-primary" disabled={busy}>
            {busy ? 'Saving…' : project ? 'Save changes' : 'Create project'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
