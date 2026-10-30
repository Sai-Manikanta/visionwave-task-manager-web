import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { api } from '../api/client.js';
import ConfirmModal from '../components/ConfirmModal.jsx';
import EmptyState from '../components/EmptyState.jsx';
import ErrorState from '../components/ErrorState.jsx';
import ProgressBar from '../components/ProgressBar.jsx';
import ProjectForm from '../components/ProjectForm.jsx';
import RichText from '../components/RichText.jsx';
import Spinner from '../components/Spinner.jsx';
import TaskListView from '../components/TaskListView.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { useFetch } from '../hooks/useFetch.js';
import { formatDay } from '../utils/format.js';

export default function ProjectDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const { data, loading, error, reload } = useFetch(`/projects/${id}`);
  const [modal, setModal] = useState(null);

  if (error?.status === 404) {
    return (
      <EmptyState
        title="Project not found"
        message="It may have been deleted."
        action={
          <Link to="/projects" className="btn-secondary">
            Back to projects
          </Link>
        }
      />
    );
  }
  if (error) return <ErrorState error={error} onRetry={reload} />;
  if (loading && !data) return <Spinner />;

  const { project } = data;

  async function remove() {
    try {
      await api.delete(`/projects/${project.id}`);
      toast.success('Project deleted.');
      navigate('/projects');
    } catch (err) {
      toast.error(err.message);
      setModal(null);
    }
  }

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h1 className="page-title break-words">{project.name}</h1>
          <p className="mt-1 text-sm text-slate-500">
            {project.status}
            {project.deadline && ` · Due ${formatDay(project.deadline)}`}
          </p>
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

      <section className="card mb-6 p-4">
        <ProgressBar value={project.progress} label="Project progress" />
        <p className="mt-2 text-xs text-slate-500">
          {project.completedCount} of {project.taskCount} task{project.taskCount === 1 ? '' : 's'} completed. Progress is the average completion of all its tasks.
        </p>
        {project.description && <RichText value={project.description} className="mt-3" />}
      </section>

      <h2 className="section-title mb-3">Tasks</h2>
      <TaskListView
        fixed={{ project: project.id }}
        defaultProject={project.id}
        emptyTitle="No tasks in this project"
        emptyMessage="Create a task to start tracking progress."
      />

      {modal === 'edit' && (
        <ProjectForm
          project={project}
          onClose={() => setModal(null)}
          onSaved={() => {
            setModal(null);
            reload();
          }}
        />
      )}
      {modal === 'delete' && (
        <ConfirmModal
          title="Delete this project?"
          message={
            project.taskCount
              ? `This project still has ${project.taskCount} task${project.taskCount === 1 ? '' : 's'}, so it can't be deleted until they are moved or removed.`
              : `"${project.name}" will be removed. This can't be undone.`
          }
          confirmLabel="Delete project"
          onConfirm={remove}
          onClose={() => setModal(null)}
        />
      )}
    </div>
  );
}
