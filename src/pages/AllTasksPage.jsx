import TaskListView from '../components/TaskListView.jsx';

export default function AllTasksPage() {
  return (
    <>
      <h1 className="page-title mb-4">All Tasks</h1>
      <TaskListView emptyMessage="Create the first task to get the team started." />
    </>
  );
}
