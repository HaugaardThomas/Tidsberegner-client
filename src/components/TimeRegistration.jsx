import React, { useState, useEffect } from "react";
import "./TimeRegistration.css";

function TimeRegistration() {
  const [showOverview, setShowOverview] = useState(false);
  const [activeTasksRowId, setActiveTasksRowId] = useState(null);
  const [activeTasknamesId, setActiveTasknamesId] = useState(null);

  // Liste over "tasknames" fra DB
  const [tasks, setTasks] = useState([]);

  // Tasks table fra db - tid og navn
  const [overviewTasks, setOverviewTasks] = useState([]);

  // System username (navnet på den person som er logget ind på system/windows)
  const [systemUsername, setSystemUsername] = useState([]);
  const [currentDate, setCurrentDate] = useState("");


  const [editingTaskId, setEditingTaskId] = useState(null);
  const [editingTaskName, setEditingTaskName] = useState("");

  // Ny Task
  const [isAddingTask, setIsAddingTask] = useState(false);
const [newTaskName, setNewTaskName] = useState("");


// Tilføj ny task
const handleAddTask = async () => {
  const trimmedTaskName = newTaskName.trim();
  const userId = 1;

  if (!trimmedTaskName) {
    alert("Task name cannot be empty.");
    return;
  }

  try {
    const res = await fetch("http://localhost:4000/api/tasknames", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_id: userId, name: trimmedTaskName }),
    });

    const data = await res.json();

    if (data.success) {
      setTasks((prevTasks) => [...prevTasks, data.data]);
      
      setNewTaskName("");
      setIsAddingTask(false);


      // alert(`Task "${trimmedTaskName}" added successfully.`);
    } else {
      console.error("Failed to add task:", data.message);
    }
  } catch (error) {
    console.error("Error adding task:", error);
  }
};

  // Hent i dags dato
  useEffect(() => {
    const now = new Date();
    const formattedDate = now.toLocaleDateString("en-GB"); 
    setCurrentDate(formattedDate);
  }, []);


  useEffect(() => {
    fetch("http://localhost:4000/api/users/auto-create")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          console.log("User auto-created or fetched:", data.user.username);
          setSystemUsername(data.user.username);
        } else {
          console.error("Error fetching or creating user:", data.message);
        }
      })
      .catch((err) => console.error("Error in user auto-creation:", err));
  }, []);

  // Hent "tasknames"
  useEffect(() => {
    const userId = 1;
  
    fetch(`http://localhost:4000/api/tasknames?user_id=${userId}`)
      .then((res) => res.json())
      .then((dbTasks) => {
        console.log("Fetched tasknames:", dbTasks);
        setTasks(dbTasks);
      })
      .catch((err) => {
        console.error("Error fetching tasknames:", err);
      });
  }, []);

  // Hent navn og total tid
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

 
  function formatTime(totalSeconds = 0) {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    return `${hours} h ${minutes} min`;
  }

 
  const handleTaskClick = async (clickedTask) => {
    try {
      const userId = 1; 
  
      if (activeTasksRowId) {
        await fetch("http://localhost:4000/api/tasks/stop", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ taskId: activeTasksRowId }),
        });
      }
  
      // Begynd at tracke tid
      const startRes = await fetch("http://localhost:4000/api/tasks/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: userId,
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

  const handleEditClick = (task) => {
    setEditingTaskId(task.id);
    setEditingTaskName(task.name);
  };


  const handleCancelEdit = () => {
    setEditingTaskId(null);
    setEditingTaskName("");
  };


 

  const handleSaveEdit = async (task) => {
    const newName = editingTaskName.trim();
    const userId = 1;
  
    if (!newName) {
      return;
    }
  
    if (newName === task.name) {
      handleCancelEdit();
      return;
    }
  
    try {
      const res = await fetch(`http://localhost:4000/api/tasknames/${task.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: userId, name: newName }),
      });
  
      const data = await res.json();
  
      if (data.success) {
        setTasks((prevTasks) =>
          prevTasks.map((t) =>
            t.id === task.id ? { ...t, name: newName } : t
          )
        );
        alert(`Task name updated to "${newName}".`);
      } else {
        console.error("Failed to update task name:", data.message);
      }
    } catch (error) {
      console.error("Error updating task name:", error);
    }
  
    handleCancelEdit();
  };
  


  const tidsregistreringView = (
    <div className="time-panel tidsregistrering-view">
      <h2>ABI Tidsregistrering</h2>
      <div className="user-info">
        <span>{systemUsername}</span>
        <span>{currentDate}</span>
      </div>

      <div className="tasks-container">
        {tasks.map((task) => {
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
                  e.stopPropagation();
                  handleEditClick(task);
                }}
              >
                Edit
              </button>
            </div>
          );
        })}

         
  {isAddingTask ? (
    <div className="task-row adding-row">
      <input
        type="text"
        value={newTaskName}
        onChange={(e) => setNewTaskName(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") handleAddTask();
        }}
        placeholder="Enter new task name"
        autoFocus
      />
      <button onClick={handleAddTask}>OK</button>
      <button onClick={() => setIsAddingTask(false)}>Cancel</button>
    </div>
  ) : (
    <button
      className="add-task-button"
      onClick={() => setIsAddingTask(true)}
    >
      + Add Task
    </button>
  )}
      </div>

      <button className="toggle-button" onClick={() => setShowOverview(true)}>
        Oversigt
      </button>
    </div>
  );


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

  return (
    <div className="time-registration-wrapper">
      {showOverview ? overviewView : tidsregistreringView}
    </div>
  );
}

export default TimeRegistration;
