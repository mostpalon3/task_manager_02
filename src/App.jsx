import React from 'react'
import TaskManagementApp from './components/TaskManagementApp';

// Develop a task management application that allows users to create, edit, and organize tasks using drag-and-drop functionality.
// Features:
//         Users can create tasks with titles and descriptions.
//         Users can drag and drop tasks to reorder them or move them between different categories (e.g., To Do, In Progress, Done).
//         Users can edit and delete tasks.

// Additional Requirements:
//         Use a drag-and-drop library (e.g., React DnD or react-beautiful-dnd) for implementing drag-and-drop functionality.
//         Persist task data using local storage or a mock API.

const App = () => {
  return (
    <>
      <TaskManagementApp />
    </>
  );
}

export default App