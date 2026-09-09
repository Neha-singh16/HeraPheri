import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/client.jsx";
import TaskCard from "../components/TaskCard.jsx";
export default function MyTasks() {
  const [tasks, setTasks] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    totalPages: 1,
    total: 0,
  });
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  async function fetchTasks(page = 1) {
    setLoading(true);
    setError("");
    try {
      const params = { page, limit: 10 };
      if (status) {
        params.status = status;
      }
      const response = await api.get("/tasks/mine", { params });
      const data = response.data.data;
      setTasks(data.tasks || []);
      setPagination(data.pagination || { page, totalPages: 1, total: 0 });
    } catch (error) {
      setError(error.response?.data?.message || "Unable to load your tasks.");
    } finally {
      setLoading(false);
    }
  } // Fetch whenever the selected //
  //  status filter changes.
  useEffect(() => {
    fetchTasks(1);
  }, [status]);
  function handlePrevious() {
    if (pagination.page <= 1) {
      return;
    }
    fetchTasks(pagination.page - 1);
  }
  function handleNext() {
    if (pagination.page >= pagination.totalPages) {
      return;
    }
    fetchTasks(pagination.page + 1);
  }
  return (
    <div className="page-container">
      {" "}
      <div className="page-header">
        {" "}
        <div>
          {" "}
          <p className="eyebrow"> YOUR WORK </p> <h1> My Tasks </h1>{" "}
          <p className="page-description">
            {" "}
            Everything you've posted on HEREPHERI.{" "}
          </p>{" "}
        </div>{" "}
        <Link to="/tasks/create" className="primary-button">
          {" "}
          + Create Task{" "}
        </Link>{" "}
      </div>{" "}
      <div className="task-toolbar">
        {" "}
        <select
          value={status}
          onChange={(event) => setStatus(event.target.value)}
        >
          {" "}
          <option value=""> All statuses </option>{" "}
          <option value="OPEN"> Open </option>{" "}
          <option value="ASSIGNED"> Assigned </option>{" "}
          <option value="IN_PROGRESS"> In Progress </option>{" "}
          <option value="PENDING_APPROVAL"> Pending Approval </option>{" "}
          <option value="COMPLETED"> Completed </option>{" "}
          <option value="DISPUTED"> Disputed </option>{" "}
          <option value="CANCELLED"> Cancelled </option>{" "}
        </select>{" "}
      </div>{" "}
      {error && <div className="error-message"> {error} </div>}{" "}
      {loading ? (
        <div className="empty-state"> Loading your tasks... </div>
      ) : tasks.length === 0 ? (
        <div className="empty-state">
          {" "}
          <h3> No tasks found </h3>{" "}
          <p> Create your first task and let someone handle it. </p>{" "}
          <Link to="/tasks/create" className="primary-button">
            {" "}
            Create a task{" "}
          </Link>{" "}
        </div>
      ) : (
        <>
          {" "}
          <div className="task-grid">
            {" "}
            {tasks.map((task) => (
              <TaskCard key={task.id} task={task} />
            ))}{" "}
          </div>{" "}
          <div className="pagination">
            {" "}
            <button
              className="secondary-button"
              onClick={handlePrevious}
              disabled={pagination.page <= 1}
            >
              {" "}
              ← Previous{" "}
            </button>{" "}
            <span>
              {" "}
              Page {pagination.page} of {pagination.totalPages}{" "}
            </span>{" "}
            <button
              className="secondary-button"
              onClick={handleNext}
              disabled={pagination.page >= pagination.totalPages}
            >
              {" "}
              Next →{" "}
            </button>{" "}
          </div>{" "}
        </>
      )}{" "}
    </div>
  );
}
