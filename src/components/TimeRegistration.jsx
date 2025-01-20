// TimeRegistration.js
import React, { useState, useEffect } from "react";
import "./TimeRegistration.css";

function TimeRegistration() {
  const [showOverview, setShowOverview] = useState(false);
  const [activeTasksRowId, setActiveTasksRowId] = useState(null);
  const [activeTasknamesId, setActiveTasknamesId] = useState(null);

  // Our master list of "tasknames" from the DB
  const [tasks, setTasks] = useState([]);

  // Aggregated overview data
  const [overviewTasks, setOverviewTasks] = useState([]);

  const [systemUsername, setSystemUsername] = useState("Loading...");
  const [currentDate, setCurrentDate] = useState("");

  // For inline editing:
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [editingTaskName, setEditingTaskName] = useState("");

  // Hent i dags dato
  useEffect(() => {
    const now = new Date();
    const formattedDate = now.toLocaleDateString("en-GB"); // Format as DD-MM-YYYY
    setCurrentDate(formattedDate);
  }, []);
  // Hent system username
  useEffect(() => {
    fetch("http://localhost:4000/api/getsystem/user")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setSystemUsername(data.username); // Set the username in state
        } else {
          setSystemUsername("Unknown User"); // Fallback if fetch fails
        }
      })
      .catch((err) => {
        console.error("Error fetching username:", err);
        setSystemUsername("Error Fetching User");
      });
  }, []);

  // Fetch the "tasknames" from your server on mount
  useEffect(() => {
    fetch("http://localhost:4000/api/tasknames")
      .then((res) => res.json())
      .then((dbTasks) => {
        console.log("Fetched tasknames:", dbTasks);
        setTasks(dbTasks);
      })
      .catch((err) => {
        console.error("Error fetching tasknames:", err);
      });
  }, []);

  // Fetch overview whenever we switch to the "Oversigt" view
  useEffect(() => {
    if (showOverview) {
      fetch("http://localhost:4000/api/tasks/overview")
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            console.log("Fetched overview data:", data.data);
            setOverviewTasks(data.data);
          } else {
            console.error("Failed to fetch overview data:", data);
          }
        })
        .catch((err) => {
          console.error("Error fetching overview:", err);
        });
    }
  }, [showOverview]);

  /**
   * Utility to convert seconds → "X h Y min"
   */
  function formatTime(totalSeconds = 0) {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    return `${hours} h ${minutes} min`;
  }

  /**
   * User clicks on a task row to start that task.
   */
  const handleTaskClick = async (clickedTask) => {
    try {
      // Stop any currently active tasks-row
      if (activeTasksRowId) {
        await fetch("http://localhost:4000/api/tasks/stop", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ taskId: activeTasksRowId }),
        });
      }

      // Start a new DB row for this task
      const startRes = await fetch("http://localhost:4000/api/tasks/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tasknamesId: clickedTask.id,
          taskName: clickedTask.name,
        }),
      });

      const startData = await startRes.json();
      if (startData.success) {
        console.log("Started a new row in 'tasks':", startData.data);
        setActiveTasksRowId(startData.data.id);
        setActiveTasknamesId(clickedTask.id);
      } else {
        console.error("Failed to start task:", startData);
      }
    } catch (error) {
      console.error("Error handling task click:", error);
    }
  };

  /**
   * EDITING MODE:
   *  - User clicks "Edit" → go into editing mode
   */
  const handleEditClick = (task) => {
    setEditingTaskId(task.id);
    setEditingTaskName(task.name);
  };

  /**
   * User clicks "Cancel" → revert to normal mode
   */
  const handleCancelEdit = () => {
    setEditingTaskId(null);
    setEditingTaskName("");
  };


  /*
  const handleSaveEdit = async (oldTask) => {
    const newName = editingTaskName.trim();
    if (!newName) {
      return; // ignore empty
    }

    // If user didn't change anything, just exit edit mode
    if (newName === oldTask.name) {
      handleCancelEdit();
      return;
    }

    // See if there's already a task with this newName
    const existingTask = tasks.find(
      (t) => t.name.toLowerCase() === newName.toLowerCase()
    );
    if (existingTask) {
      alert(`Task "${newName}" already exists. We'll just use it!`);
      // Optionally start the existing task:
      // handleTaskClick(existingTask);

      // We do not create a new record. End editing mode.
      handleCancelEdit();
      return;
    }

    // Otherwise, create a brand-new record in your "tasknames" table
    try {
      const res = await fetch("http://localhost:4000/api/tasknames", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newName }),
      });
      const data = await res.json();

      if (data.success) {
        // Suppose the server returns: data.data = { id: 9999, name: "whatever" }
        const newTaskRow = data.data;

        // Replace the old row in local state with the new row
        setTasks((prevTasks) => {
          return prevTasks.map((t) =>
            t.id === oldTask.id ? newTaskRow : t
          );
        });

        alert(`Created new name "${newName}" in the DB (ID ${newTaskRow.id}).`);
        // Optionally start the new task:
        // handleTaskClick(newTaskRow);
      } else {
        console.error("Failed to create new name:", data);
      }
    } catch (error) {
      console.error("Error creating new name:", error);
    }

    // Done editing
    handleCancelEdit();
  };
  */

  const handleSaveEdit = async (task) => {
    const newName = editingTaskName.trim();
    if (!newName) {
      return; // Ignore empty input
    }
  
    // If the name wasn't changed, just exit edit mode
    if (newName === task.name) {
      handleCancelEdit();
      return;
    }
  
    try {
      // Make a PUT request to update the task name
      const res = await fetch(`http://localhost:4000/api/tasknames/${task.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newName }),
      });
  
      const data = await res.json();
  
      if (data.success) {
        // Update the task name in local state
        setTasks((prevTasks) =>
          prevTasks.map((t) =>
            t.id === task.id ? { ...t, name: newName } : t
          )
        );
  
        // alert(`Task name updated to "${newName}".`);
      } else {
        console.error("Failed to update task name:", data.message);
      }
    } catch (error) {
      console.error("Error updating task name:", error);
    }
  
    // Exit edit mode
    handleCancelEdit();
  };

  /**
   * ----- TIDSBANKEN (Tidsregistrering) View -----
   */
  const tidsregistreringView = (
    <div className="time-panel tidsregistrering-view">
      <h2>ABI Tidsregistrering</h2>
      <div className="user-info">
        <span>{systemUsername}</span>
        <span>{currentDate}</span>
      </div>

      <div className="tasks-container">
        {tasks.map((task) => {
          // If we're editing *this* task, show an input + Save/Cancel
          if (editingTaskId === task.id) {
            return (
              <div key={task.id} className="task-row editing-row">
                <input
                  type="text"
                  value={editingTaskName}
                  onChange={(e) => setEditingTaskName(e.target.value)}
                  autoFocus
                />
                <button onClick={() => handleSaveEdit(task)}>Save</button>
                <button onClick={handleCancelEdit}>Cancel</button>
              </div>
            );
          }

          // Otherwise, show normal text
          return (
            <div
              key={task.id}
              className={`task-row ${
                activeTasknamesId === task.id ? "task-active" : ""
              }`}
              onClick={() => handleTaskClick(task)}
            >
              <div className="task-name">{task.name}</div>
              <button
                className="edit-button"
                onClick={(e) => {
                  e.stopPropagation(); // don't trigger row's onClick
                  handleEditClick(task);
                }}
              >
                Edit
              </button>
            </div>
          );
        })}
      </div>

      <button className="toggle-button" onClick={() => setShowOverview(true)}>
        Oversigt
      </button>
    </div>
  );

  /**
   * ----- OVERSIGT View -----
   */
  const overviewView = (
    <div className="time-panel overview-view">
      <h2>ABI Tidsregistrering (Oversigt)</h2>

      <div className="tasks-overview">
        {overviewTasks.map((item) => (
          <div key={item.name} className="overview-item">
            {item.name} – {formatTime(item.total_time)}
          </div>
        ))}
      </div>

      <div className="overview-total">
        {(() => {
          const totalSeconds = overviewTasks.reduce(
            (acc, t) => acc + Number(t.total_time || 0),
            0
          );
          return `Total ${formatTime(totalSeconds)}`;
        })()}
      </div>

      <button className="toggle-button" onClick={() => setShowOverview(false)}>
        Tidsregistrering
      </button>
    </div>
  );

  // Render based on which view we are in
  return (
    <div className="time-registration-wrapper">
      {showOverview ? overviewView : tidsregistreringView}
    </div>
  );
}

export default TimeRegistration;
