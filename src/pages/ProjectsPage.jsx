import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import EmptyState from '../components/EmptyState.jsx';
import ErrorState from '../components/ErrorState.jsx';
import ProgressBar from '../components/ProgressBar.jsx';
import ProjectForm from '../components/ProjectForm.jsx';
import Spinner from '../components/Spinner.jsx';
import { useFetch } from '../hooks/useFetch.js';
import { formatDay } from '../utils/format.js';

export default function ProjectsPage() {
  const navigate = useNavigate();
  const { data, loading, error, reload } = useFetch('/projects');
  const [creating, setCreating] = useState(false);

  return (
    <>
      <div className="mb-4 flex items-center justify-between gap-2">
        <h1 className="page-title">Projects</h1>
        <button type="button" className="btn-primary" onClick={() => setCreating(true)}>
          New project
        </button>
      </div>

      {loading && !data && <Spinner />}
      {error && <ErrorState error={error} onRetry={reload} />}
      {data?.projects.length === 0 && (
        <EmptyState title="No projects yet" message="Add a project, then create tasks for it." />
      )}
      {data?.projects.length > 0 && (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {data.projects.map((project) => (
            <Link key={project.id} to={`/projects/${project.id}`} className="card block p-4 hover:border-slate-300">
              <div className="flex items-start justify-between gap-2">
                <h2 className="min-w-0 font-medium break-words">{project.name}</h2>
                <span className="text-xs whitespace-nowrap text-slate-500">{project.status}</span>
              </div>
              {project.deadline && <p className="mt-1 text-xs text-slate-500">Due {formatDay(project.deadline)}</p>}
              <div className="mt-3">
                <ProgressBar value={project.progress} label={`${project.name} progress`} />
              </div>
              <p className="mt-2 text-xs text-slate-500">
                {project.completedCount} of {project.taskCount} task{project.taskCount === 1 ? '' : 's'} completed
              </p>
            </Link>
          ))}
        </div>
      )}

      {creating && (
        <ProjectForm onClose={() => setCreating(false)} onSaved={(project) => navigate(`/projects/${project.id}`)} />
      )}
    </>
  );
}
