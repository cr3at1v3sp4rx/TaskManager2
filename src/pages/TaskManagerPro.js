import React, { useState, useEffect } from 'react';
import { PlusCircle, Calendar, Trash2, Search, Filter, X, Edit2,  ArrowUpDown } from 'lucide-react';
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Card, CardContent } from "../components/ui/card";
import { Checkbox } from "../components/ui/checkbox";
import { Badge } from "../components/ui/badge";
import { Label } from "../components/ui/label";
import { RadioGroup, RadioGroupItem } from "../components/ui/radio-group";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "../components/ui/alert-dialog";
import { motion, AnimatePresence } from "framer-motion";

// Define priority levels with associated labels and colors
const priorities = {
  low: { label: 'Low', color: 'bg-green-500' },
  medium: { label: 'Medium', color: 'bg-yellow-500' },
  high: { label: 'High', color: 'bg-red-500' },
};

// TaskItem component: Renders individual task items
const TaskItem = ({ task, onToggle, onDelete, onEdit }) => (
  <Card className="mb-4 hover:shadow-md transition-shadow duration-300">
    <CardContent className="flex items-center justify-between p-4">
      <div className="flex items-center space-x-4">
        <Checkbox
          checked={task.completed}
          onCheckedChange={() => onToggle(task.id)}
        />
        <div>
          <p className={`font-medium ${task.completed ? 'line-through text-gray-500' : ''}`}>
            {task.text}
          </p>
          <div className="flex items-center space-x-2 mt-1">
            <Calendar className="h-4 w-4 text-gray-500" />
            <span className="text-sm text-gray-500">{task.dueDate}</span>
          </div>
        </div>
      </div>
      <div className="flex items-center space-x-2">
        <Badge variant="secondary" className={`${priorities[task.priority].color} text-white`}>
          {priorities[task.priority].label}
        </Badge>
        <Button variant="ghost" size="sm" onClick={() => onEdit(task)} className="text-blue-500 hover:text-blue-700">
          <Edit2 className="h-4 w-4" />
        </Button>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-700">
              <Trash2 className="h-4 w-4" />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure you want to delete this task?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={() => onDelete(task.id)}>Delete</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </CardContent>
  </Card>
);

// AddTaskPanel component: Handles adding new tasks and editing existing ones
const AddTaskPanel = ({ isOpen, onClose, onAddTask, editTask }) => {
  const [newTask, setNewTask] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [priority, setPriority] = useState('medium');

  // Populate form when editing an existing task
  useEffect(() => {
    if (editTask) {
      setNewTask(editTask.text);
      setDueDate(editTask.dueDate);
      setPriority(editTask.priority);
    }
  }, [editTask]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (newTask.trim()) {
      onAddTask({
        id: editTask ? editTask.id : Date.now(),
        text: newTask,
        completed: editTask ? editTask.completed : false,
        dueDate,
        priority,
      });
      setNewTask('');
      setDueDate('');
      setPriority('medium');
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          exit={{ y: "100%" }}
          transition={{ type: "spring", bounce: 0, duration: 0.4 }}
          className="fixed inset-x-0 bottom-0 bg-white shadow-lg rounded-t-3xl p-6 space-y-4"
          style={{ zIndex: 50 }}
        >
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-1 bg-gray-300 rounded-full mx-auto" />
              <h2 className="text-2xl font-bold">{editTask ? 'Edit Task' : 'Add New Task'}</h2>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-6 w-6" />
            </Button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="task">Task</Label>
              <Input
                id="task"
                value={newTask}
                onChange={(e) => setNewTask(e.target.value)}
                placeholder="Enter task description"
              />
            </div>
            <div>
              <Label htmlFor="dueDate">Due Date</Label>
              <Input
                id="dueDate"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </div>
            <div>
              <Label>Priority</Label>
              <RadioGroup value={priority} onValueChange={setPriority}>
                {Object.entries(priorities).map(([key, { label }]) => (
                  <div key={key} className="flex items-center space-x-2">
                    <RadioGroupItem value={key} id={key} />
                    <Label htmlFor={key}>{label}</Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
            <Button type="submit" className="w-full">{editTask ? 'Update Task' : 'Add Task'}</Button>
          </form>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Main TaskManager component
const TaskManager = () => {
  // State management
  const [tasks, setTasks] = useState([]);
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');
  const [editTask, setEditTask] = useState(null);
  const [sortBy, setSortBy] = useState('dateAdded');

  // Load tasks from localStorage on component mount
  useEffect(() => {
    const storedTasks = localStorage.getItem('tasks');
    if (storedTasks) {
      setTasks(JSON.parse(storedTasks));
    }
  }, []);

  // Save tasks to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('tasks', JSON.stringify(tasks));
  }, [tasks]);

  // Add keyboard shortcut for opening the Add Task panel
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.key === 'n' && e.ctrlKey) {
        e.preventDefault();
        setIsAddTaskOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  // Function to add a new task or update an existing one
  const addOrUpdateTask = (newTask) => {
    if (editTask) {
      setTasks(tasks.map(task => task.id === newTask.id ? newTask : task));
      setEditTask(null);
    } else {
      setTasks([newTask, ...tasks]);
    }
  };

  // Function to toggle task completion status
  const toggleTask = (id) => {
    setTasks(tasks.map(task => 
      task.id === id ? { ...task, completed: !task.completed } : task
    ));
  };

  // Function to delete a task
  const deleteTask = (id) => {
    setTasks(tasks.filter(task => task.id !== id));
  };

  // Function to clear all completed tasks
  const clearCompletedTasks = () => {
    setTasks(tasks.filter(task => !task.completed));
  };

  // Function to initiate task editing
  const handleEditTask = (task) => {
    setEditTask(task);
    setIsAddTaskOpen(true);
  };

  // Function to sort tasks based on the selected criteria
  const sortTasks = (tasksToSort) => {
    switch (sortBy) {
      case 'dueDate':
        return [...tasksToSort].sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
      case 'priority':
        const priorityOrder = { high: 0, medium: 1, low: 2 };
        return [...tasksToSort].sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
      default:
        return tasksToSort;
    }
  };

  // Apply filtering and sorting to tasks
  const filteredTasks = sortTasks(
    tasks
      .filter(task => task.text.toLowerCase().includes(searchTerm.toLowerCase()))
      .filter(task => {
        if (filter === 'all') return true;
        if (filter === 'completed') return task.completed;
        if (filter === 'active') return !task.completed;
        return true;
      })
  );

  // Count active tasks
  const activeTasks = tasks.filter(task => !task.completed).length;

  return (
    <div className="min-h-screen bg-gray-100 pb-24">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6 shadow-md">
        <h1 className="text-3xl font-bold text-white">Task Manager</h1>
        <p className="text-white mt-2">Active tasks: {activeTasks}</p>
      </div>
      
      {/* Main content */}
      <div className="max-w-3xl mx-auto mt-6 px-4">
        {/* Control panel */}
        <div className="flex flex-wrap items-center gap-4 mb-6">
          <Button
            onClick={() => setIsAddTaskOpen(true)}
            className="bg-blue-500 hover:bg-blue-600 text-white flex-grow sm:flex-grow-0"
          >
            <PlusCircle className="mr-2 h-4 w-4" /> Add New Task (Ctrl+N)
          </Button>
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <Input
              type="text"
              placeholder="Search tasks..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-full"
            />
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="w-[100px]">
                <Filter className="mr-2 h-4 w-4" /> Filter
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => setFilter('all')}>All</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilter('active')}>Active</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilter('completed')}>Completed</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="w-[100px]">
                <ArrowUpDown className="mr-2 h-4 w-4" /> Sort
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => setSortBy('dateAdded')}>Date Added</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortBy('dueDate')}>Due Date</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortBy('priority')}>Priority</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button onClick={clearCompletedTasks} variant="outline" className="w-[140px] text-red-500 hover:text-red-700">
            <Trash2 className="mr-2 h-4 w-4" /> Clear Completed
          </Button>
        </div>

        {/* Task list */}
        {filteredTasks.length === 0 ? (
          <p className="text-center text-gray-500 mt-8">No tasks found. Add a new task or adjust your search/filter.</p>
        ) : (
          filteredTasks.map(task => (
            <TaskItem
              key={task.id}
              task={task}
              onToggle={toggleTask}
              onDelete={deleteTask}
              onEdit={handleEditTask}
            />
          ))
        )}
      </div>

      {/* Add/Edit Task Panel */}
      <AddTaskPanel
        isOpen={isAddTaskOpen}
        onClose={() => {
          setIsAddTaskOpen(false);
          setEditTask(null);
        }}
        onAddTask={addOrUpdateTask}
        editTask={editTask}
      />
    </div>
  );
};

export default TaskManager;