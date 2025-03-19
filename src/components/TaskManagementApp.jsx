import React, { useState, useEffect } from 'react';
import { Edit, Trash2, Plus, Save, X } from 'lucide-react';

const initialColumns = {
  'todo': {
    id: 'todo',
    title: 'To Do',
    taskIds: []
  },
  'inProgress': {
    id: 'inProgress',
    title: 'In Progress',
    taskIds: []
  },
  'done': {
    id: 'done',
    title: 'Done',
    taskIds: []
  }
};

const columnOrder = ['todo', 'inProgress', 'done'];

const TaskManagementApp = () => {
  const [tasks, setTasks] = useState({});
  const [columns, setColumns] = useState(initialColumns);
  const [editingTask, setEditingTask] = useState(null);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDescription, setNewTaskDescription] = useState('');
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [addToColumn, setAddToColumn] = useState('todo');
  const [draggedTask, setDraggedTask] = useState(null);


  useEffect(() => {
    const savedTasks = localStorage.getItem('tasks');
    const savedColumns = localStorage.getItem('columns');
    
    if (savedTasks && savedColumns) {
      setTasks(JSON.parse(savedTasks));
      setColumns(JSON.parse(savedColumns));
    }
  }, []);

  useEffect(() => {
    if (Object.keys(tasks).length > 0) {
      localStorage.setItem('tasks', JSON.stringify(tasks));
      localStorage.setItem('columns', JSON.stringify(columns));
    }
  }, [tasks, columns]);

  const addNewTask = () => {
    if (newTaskTitle.trim() === '') return;

    const newTaskId = `task-${Date.now()}`;
    const newTask = {
      id: newTaskId,
      title: newTaskTitle,
      description: newTaskDescription
    };

    const column = columns[addToColumn];
    const newTaskIds = [...column.taskIds, newTaskId];

    setTasks(prevTasks => ({
      ...prevTasks,
      [newTaskId]: newTask
    }));
    
    setColumns(prevColumns => ({
      ...prevColumns,
      [addToColumn]: {
        ...column,
        taskIds: newTaskIds
      }
    }));
    
    setNewTaskTitle('');
    setNewTaskDescription('');
    setIsAddingTask(false);
  };

  const editTask = (taskId) => {
    setEditingTask({
      id: taskId,
      title: tasks[taskId].title,
      description: tasks[taskId].description
    });
  };

  const saveTaskEdit = () => {
    if (!editingTask || editingTask.title.trim() === '') return;

    setTasks(prevTasks => ({
      ...prevTasks,
      [editingTask.id]: {
        ...prevTasks[editingTask.id],
        title: editingTask.title,
        description: editingTask.description
      }
    }));

    setEditingTask(null);
  };

  const deleteTask = (taskId) => {
    let columnWithTask = null;
    
    for (const columnId in columns) {
      if (columns[columnId].taskIds.includes(taskId)) {
        columnWithTask = columnId;
        break;
      }
    }

    if (!columnWithTask) return;

    // Remove task ID from column
    const column = columns[columnWithTask];
    const newTaskIds = column.taskIds.filter(id => id !== taskId);

    // Create new state objects
    const newTasks = { ...tasks };
    delete newTasks[taskId];

    setTasks(newTasks);
    setColumns({
      ...columns,
      [columnWithTask]: {
        ...column,
        taskIds: newTaskIds
      }
    });
  };

  const handleDragStart = (e, taskId, sourceColumnId) => {
    e.dataTransfer.setData('taskId', taskId);
    e.dataTransfer.setData('sourceColumnId', sourceColumnId);
    setDraggedTask(taskId);
    
    const ghost = e.target.cloneNode(true);
    ghost.style.position = 'absolute';
    ghost.style.top = '-1000px';
    document.body.appendChild(ghost);
    e.dataTransfer.setDragImage(ghost, 20, 20);
    
    setTimeout(() => {
      document.body.removeChild(ghost);
    }, 0);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDragEnter = (e, columnId) => {
    e.preventDefault();
    e.currentTarget.classList.add('bg-blue-100');
  };

  const handleDragLeave = (e) => {
    e.currentTarget.classList.remove('bg-blue-100');
  };

  const handleDrop = (e, targetColumnId) => {
    e.preventDefault();
    e.currentTarget.classList.remove('bg-blue-100');
    
    const taskId = e.dataTransfer.getData('taskId');
    const sourceColumnId = e.dataTransfer.getData('sourceColumnId');

    if (sourceColumnId === targetColumnId) return;


    const sourceColumn = columns[sourceColumnId];
    const newSourceTaskIds = sourceColumn.taskIds.filter(id => id !== taskId);

    const targetColumn = columns[targetColumnId];
    const newTargetTaskIds = [...targetColumn.taskIds, taskId];

    setColumns({
      ...columns,
      [sourceColumnId]: {
        ...sourceColumn,
        taskIds: newSourceTaskIds
      },
      [targetColumnId]: {
        ...targetColumn,
        taskIds: newTargetTaskIds
      }
    });

    setDraggedTask(null);
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Task Management</h1>
      

      {!isAddingTask ? (
        <button 
          onClick={() => setIsAddingTask(true)} 
          className="flex items-center gap-2 mb-6 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          <Plus size={16} /> Add New Task
        </button>
      ) : (
        <div className="mb-6 p-4 border rounded shadow bg-white">
          <div className="mb-3">
            <label className="block mb-1 font-medium">Title</label>
            <input
              type="text"
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              className="w-full p-2 border rounded"
              placeholder="Task title"
            />
          </div>
          <div className="mb-3">
            <label className="block mb-1 font-medium">Description</label>
            <textarea
              value={newTaskDescription}
              onChange={(e) => setNewTaskDescription(e.target.value)}
              className="w-full p-2 border rounded"
              placeholder="Task description"
              rows="3"
            />
          </div>
          <div className="mb-3">
            <label className="block mb-1 font-medium">Add to</label>
            <select 
              value={addToColumn}
              onChange={(e) => setAddToColumn(e.target.value)}
              className="w-full p-2 border rounded"
            >
              {columnOrder.map(columnId => (
                <option key={columnId} value={columnId}>
                  {columns[columnId].title}
                </option>
              ))}
            </select>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={addNewTask} 
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 flex items-center gap-1"
            >
              <Save size={16} /> Save
            </button>
            <button 
              onClick={() => {
                setIsAddingTask(false);
                setNewTaskTitle('');
                setNewTaskDescription('');
              }} 
              className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 flex items-center gap-1"
            >
              <X size={16} /> Cancel
            </button>
          </div>
        </div>
      )}

      {editingTask && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white p-6 rounded shadow-lg w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Edit Task</h2>
            <div className="mb-3">
              <label className="block mb-1 font-medium">Title</label>
              <input
                type="text"
                value={editingTask.title}
                onChange={(e) => setEditingTask({...editingTask, title: e.target.value})}
                className="w-full p-2 border rounded"
              />
            </div>
            <div className="mb-4">
              <label className="block mb-1 font-medium">Description</label>
              <textarea
                value={editingTask.description}
                onChange={(e) => setEditingTask({...editingTask, description: e.target.value})}
                className="w-full p-2 border rounded"
                rows="3"
              />
            </div>
            <div className="flex gap-2">
              <button 
                onClick={saveTaskEdit} 
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 flex items-center gap-1"
              >
                <Save size={16} /> Save
              </button>
              <button 
                onClick={() => setEditingTask(null)} 
                className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 flex items-center gap-1"
              >
                <X size={16} /> Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {columnOrder.map(columnId => {
          const column = columns[columnId];
          const columnTasks = column.taskIds.map(taskId => tasks[taskId]).filter(Boolean);
          
          return (
            <div 
              key={column.id} 
              className="bg-gray-100 p-4 rounded shadow transition-colors duration-200"
              onDragOver={handleDragOver}
              onDragEnter={(e) => handleDragEnter(e, column.id)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, column.id)}
            >
              <h2 className="font-bold text-xl mb-4 text-center">{column.title}</h2>
              <div className="min-h-64 space-y-2">
                {columnTasks.map((task) => (
                  <div
                    key={task.id}
                    className={`bg-white p-3 rounded shadow cursor-move transition-shadow duration-200 ${
                      draggedTask === task.id ? 'opacity-50' : ''
                    }`}
                    draggable
                    onDragStart={(e) => handleDragStart(e, task.id, column.id)}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-bold">{task.title}</h3>
                      <div className="flex gap-2">
                        <button 
                          onClick={() => editTask(task.id)}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          <Edit size={16} />
                        </button>
                        <button 
                          onClick={() => deleteTask(task.id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                    {task.description && (
                      <p className="text-gray-700 text-sm">{task.description}</p>
                    )}
                  </div>
                ))}
                {columnTasks.length === 0 && (
                  <div className="text-center text-gray-500 py-6">
                    Drop tasks here
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TaskManagementApp;