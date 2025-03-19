import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
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

  const onDragEnd = (result) => {
    const { destination, source, draggableId } = result;

    if (!destination || 
        (destination.droppableId === source.droppableId && 
         destination.index === source.index)) {
      return;
    }

    if (source.droppableId === destination.droppableId) {
      const column = columns[source.droppableId];
      const newTaskIds = Array.from(column.taskIds);
      
      newTaskIds.splice(source.index, 1);
      newTaskIds.splice(destination.index, 0, draggableId);

      const newColumn = {
        ...column,
        taskIds: newTaskIds
      };

      const newColumns = {
        ...columns,
        [newColumn.id]: newColumn
      };

      setColumns(newColumns);
      return;
    }

    const sourceColumn = columns[source.droppableId];
    const destColumn = columns[destination.droppableId];
    
    const sourceTaskIds = Array.from(sourceColumn.taskIds);
    const destTaskIds = Array.from(destColumn.taskIds);

    sourceTaskIds.splice(source.index, 1);
    
    destTaskIds.splice(destination.index, 0, draggableId);

    const newColumns = {
      ...columns,
      [sourceColumn.id]: {
        ...sourceColumn,
        taskIds: sourceTaskIds
      },
      [destColumn.id]: {
        ...destColumn,
        taskIds: destTaskIds
      }
    };

    setColumns(newColumns);
  };

  const addNewTask = () => {
    if (newTaskTitle.trim() === '') return;

    const newTaskId = `task-${Date.now()}`;
    const newTask = {
      id: newTaskId,
      title: newTaskTitle,
      description: newTaskDescription
    };

    const column = columns[addToColumn];
    const newTaskIds = Array.from(column.taskIds);
    newTaskIds.push(newTaskId);

    const updatedColumns = {
      ...columns,
      [addToColumn]: {
        ...column,
        taskIds: newTaskIds
      }
    };

    setTasks({ ...tasks, [newTaskId]: newTask });
    setColumns(updatedColumns);
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

    const updatedTasks = {
      ...tasks,
      [editingTask.id]: {
        ...tasks[editingTask.id],
        title: editingTask.title,
        description: editingTask.description
      }
    };

    setTasks(updatedTasks);
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

    const column = columns[columnWithTask];
    const newTaskIds = column.taskIds.filter(id => id !== taskId);

    const updatedColumns = {
      ...columns,
      [columnWithTask]: {
        ...column,
        taskIds: newTaskIds
      }
    };

    const newTasks = { ...tasks };
    delete newTasks[taskId];

    setTasks(newTasks);
    setColumns(updatedColumns);
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

      {/* Task editing modal */}
      {editingTask && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
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

      {/* Board */}
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {columnOrder.map(columnId => {
            const column = columns[columnId];
            const columnTasks = column.taskIds.map(taskId => tasks[taskId]);
            
            return (
              <div key={column.id} className="bg-gray-100 p-4 rounded shadow">
                <h2 className="font-bold text-xl mb-4 text-center">{column.title}</h2>
                <Droppable droppableId={column.id}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={`min-h-64 ${snapshot.isDraggingOver ? 'bg-blue-50' : ''}`}
                    >
                      {columnTasks.map((task, index) => (
                        task ? (
                          <Draggable key={task.id} draggableId={task.id} index={index}>
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                className={`bg-white p-3 mb-2 rounded shadow ${
                                  snapshot.isDragging ? 'shadow-lg' : ''
                                }`}
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
                            )}
                          </Draggable>
                        ) : null
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </div>
            );
          })}
        </div>
      </DragDropContext>
    </div>
  );
};

export default TaskManagementApp;