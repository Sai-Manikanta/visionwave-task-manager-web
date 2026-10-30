import TaskListView from '../components/TaskListView.jsx';
import { useAuth } from '../context/AuthContext.jsx';

export default function MyTasksPage() {
  const { user } = useAuth();
  return (
    <>
      <h1 className="page-title mb-4">My Tasks</h1>
      <TaskListView
        fixed={{ assignee: user.id }}
        emptyTitle="Nothing assigned to you"
        emptyMessage="Tasks you create for yourself or are assigned by teammates will appear here."
      />
    </>
  );
}
