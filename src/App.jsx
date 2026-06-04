import { useState, useEffect,useRef } from "react";
import './shortcuts.css';
import { Edit2, Trash2, Save, Calendar, Flag, GripVertical } from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  DragDropContext,
  Droppable,
  Draggable,
} from "@hello-pangea/dnd";


function App() {
  const [task, setTask] = useState("");
  const [filter, setFilter] = useState("all");

  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState("");
  const [seconds, setSeconds] = useState(0);
  const [running, setRunning] = useState(false);

  const [search, setSearch] = useState("");
  const [priority, setPriority] = useState("None");
  const [dueDate, setDueDate] = useState("");
  const [todos, setTodos] = useState(() => {
    const savedTodos = localStorage.getItem("todos");
    return savedTodos ? JSON.parse(savedTodos) : [];
  });

  useEffect(() => {
    localStorage.setItem("todos", JSON.stringify(todos));
  }, [todos]);

  useEffect(() => {
    let interval;

    if (running) {
      interval = setInterval(() => {
        setSeconds((prev) => prev + 1);
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [running]);

  const addTask = () => {
    if (!task.trim()) return;

    const newTask = {
      id: Date.now(),
      text: task,
      completed: false,
      priority,
      dueDate,
    };

    setTodos([...todos, newTask]);
    setTask("");
    setPriority("None");
    setDueDate("");
  };

  const deleteTask = (id) => {
    setTodos(todos.filter((todo) => todo.id !== id));
  };

  const toggleTask = (id) => {
    setTodos(
      todos.map((todo) =>
        todo.id === id
          ? { ...todo, completed: !todo.completed }
          : todo
      )
    );
  };

  const startEdit = (todo) => {
    setEditingId(todo.id);
    setEditText(todo.text);
  };

  const saveEdit = () => {
    setTodos(
      todos.map((todo) =>
        todo.id === editingId
          ? { ...todo, text: editText }
          : todo
      )
    );

    setEditingId(null);
    setEditText("");
  };

  const filteredTodos = todos.filter((todo) => {
    const matchesSearch = todo.text
      .toLowerCase()
      .includes(search.toLowerCase());

    if (!matchesSearch) return false;

    if (filter === "active") return !todo.completed;
    if (filter === "completed") return todo.completed;

    return true;
  });

  const completedCount = todos.filter(
    (todo) => todo.completed
  ).length;

  const pendingCount = todos.length - completedCount;

  const progress =
    todos.length === 0
      ? 0
      : (completedCount / todos.length) * 100;

  const chartData = [
    { name: "Completed", value: completedCount },
    { name: "Pending", value: pendingCount },
  ];

  const COLORS = ["#D96C92", "#FAD4E0"];

  const handleDragEnd = (result) => {
    if (!result.destination) return;

    const items = Array.from(todos);

    const [reorderedItem] = items.splice(
      result.source.index,
      1
    );

    items.splice(
      result.destination.index,
      0,
      reorderedItem
    );

    setTodos(items);
  };

  const formatTime = () => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    return `${String(hrs).padStart(2, "0")}:${String(mins).padStart(
      2,
      "0"
    )}:${String(secs).padStart(2, "0")}`;
  };

  const isOverdue = (date) => {
    if (!date) return false;

    const today = new Date();
    const due = new Date(date);

    today.setHours(0, 0, 0, 0);
    due.setHours(0, 0, 0, 0);

    return due < today;
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "High":
        return "bg-pink-500 text-white";
      case "Medium":
        return "bg-pink-300 text-white";
      default:
        return "bg-pink-100 text-pink-700";
    }
  };
    // ========== ADD THE KEYBOARD SHORTCUTS useEffect RIGHT HERE ==========
  useEffect(() => {
    const handleKeyPress = (e) => {
      // Don't trigger shortcuts if user is typing in input fields
      const isTyping = e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA';
      
      // Ctrl/Cmd + Enter to add task
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter' && !isTyping) {
        e.preventDefault();
        addTask();
      }
      
      // Escape to cancel editing
      if (e.key === 'Escape' && editingId) {
        e.preventDefault();
        setEditingId(null);
        setEditText("");
      }
      
      // Ctrl/Cmd + / to focus search
      if ((e.ctrlKey || e.metaKey) && e.key === '/') {
        e.preventDefault();
        const searchInput = document.querySelector('input[placeholder="Search tasks... (Ctrl/Cmd + /)"]');
        if (searchInput) {
          searchInput.focus();
        }
      }
      
      // Ctrl/Cmd + D to focus task input (Add Task)
      if ((e.ctrlKey || e.metaKey) && e.key === 'd') {
        e.preventDefault();
        const taskInput = document.querySelector('input[placeholder="What would you like to accomplish today?"]');
        if (taskInput) {
          taskInput.focus();
        }
      }
      
      // ? key to show shortcuts help
      if (e.key === '?' && !isTyping) {
        e.preventDefault();
        alert('⌨️ Keyboard Shortcuts:\n\n• Ctrl/Cmd + Enter → Add task\n• Esc → Cancel editing\n• Ctrl/Cmd + / → Focus search\n• Ctrl/Cmd + D → Focus add task\n• ? → Show this help');
      }
    };
    
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [addTask, editingId]); // Don't forget the dependencies!
  // ========== END OF KEYBOARD SHORTCUTS =========

  return (
    <div className="relative min-h-dvh bg-gradient-to-br from-[#FFF7F0] via-[#FFFDF9] to-[#FFE8EF] p-6 flex justify-center items-start overflow-hidden">
      <div className="absolute w-96 h-96 bg-pink-200 rounded-full blur-3xl opacity-20 top-10 left-10"></div>

      <div className="w-full max-w-3xl bg-gradient-to-b from-[#FFFDF9] to-[#FFF7FA] rounded-3xl shadow-2xl p-4 sm:p-8 border border-pink-100 z-10">
        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-5xl font-extrabold bg-gradient-to-r from-[#D96C92] via-[#E88BA8] to-[#C76D8B] bg-clip-text text-transparent">
            Day Planner
          </h1>

          <p className="text-[#8B6B78] mt-3">
            Organize your day beautifully
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <div className="bg-gradient-to-br from-[#FAD4E0] to-[#FFF1F5] rounded-2xl p-5 text-center">
            <h2 className="text-3xl font-bold text-[#B85C7A]">
              {todos.length}
            </h2>
            <p>Total Tasks</p>
          </div>

          <div className="bg-gradient-to-br from-[#FFE8EF] to-[#FFF7FA] rounded-2xl p-5 text-center">
            <h2 className="text-3xl font-bold text-[#D96C92]">
              {completedCount}
            </h2>
            <p>Completed</p>
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow-md p-6 mb-6 text-center border border-pink-100">
          <h2 className="text-lg font-semibold text-[#6F5963] mb-4">
            Focus Timer
          </h2>

          <div className="w-32 h-32 sm:w-44 sm:h-44 mx-auto rounded-full border-[10px] border-pink-200 flex items-center justify-center bg-gradient-to-br from-white to-pink-50 shadow-inner">
            <span className="text-xl sm:text-3xl font-bold text-[#D96C92]">
              {formatTime()}
            </span>
          </div>

          <div className="flex justify-center gap-2 mt-5">
            <button
              onClick={() => setRunning(true)}
              className="px-3 py-1 text-xs rounded-full bg-[#D96C92] text-white"
            >
              Start
            </button>

            <button
              onClick={() => setRunning(false)}
              className="px-3 py-1 text-xs rounded-full bg-gray-300"
            >
              Pause
            </button>

            <button
              onClick={() => {
                setRunning(false);
                setSeconds(0);
              }}
              className="px-3 py-1 text-xs rounded-full bg-gray-200"
            >
              Reset
            </button>
          </div>
        </div>

        <div className="mb-8">
          <div className="flex justify-between mb-2 text-sm">
            <span>Progress</span>
            <span>{Math.round(progress)}%</span>
          </div>

          <div className="w-full bg-pink-100 rounded-full h-3">
            <div
              className="h-3 rounded-full bg-gradient-to-r from-[#E88BA8] to-[#D96C92]"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div className="h-64 mb-8">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                dataKey="value"
                outerRadius={90}
                label
              >
                {chartData.map((entry, index) => (
                  <Cell
                    key={index}
                    fill={COLORS[index]}
                  />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Task Input Row */}
<div className="flex flex-col sm:flex-row gap-2 mb-3">
  <input
    type="text"
    placeholder="What would you like to accomplish today?"
    value={task}
    onChange={(e) => setTask(e.target.value)}
    onKeyDown={(e) => e.key === "Enter" && addTask()}
    className="flex-1 border border-pink-200 rounded-xl px-4 py-2 text-sm"
  />
  <button onClick={addTask} className="bg-gradient-to-r from-[#E88BA8] to-[#D96C92] text-white px-4 py-2 rounded-xl flex items-center justify-center gap-1 text-sm">
    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="5" x2="12" y2="19"/>
      <line x1="5" y1="12" x2="19" y2="12"/>
    </svg>
    Add
  </button>
</div>

{/* Calendar & Priority Row - Side by side on mobile */}
<div className="flex gap-2 mb-4">
  <div className="relative flex-1">
    <Calendar size={14} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-pink-400" />
    <input
      type="date"
      value={dueDate}
      onChange={(e) => setDueDate(e.target.value)}
      className="w-full border border-pink-200 rounded-xl pl-8 pr-2 py-2 text-sm"
    />
  </div>
  
  <div className="relative flex-1">
    <Flag size={14} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-pink-400" />
    <select
      value={priority}
      onChange={(e) => setPriority(e.target.value)}
      className="w-full border border-pink-200 rounded-xl pl-8 pr-2 py-2 text-sm appearance-none bg-white"
    >
      <option value="None">None</option>
      <option value="High">High</option>
      <option value="Medium">Medium</option>
      <option value="Low">Low</option>
    </select>
  </div>
</div>

                {/* Search with Shortcuts Help Button */}
        <div className="flex gap-2 mb-4">
          <input
            type="text"
            placeholder="Search tasks... (Ctrl/Cmd + /)"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 border border-pink-200 rounded-xl px-4 py-2"
          />
          <button
            onClick={() => alert('⌨️ Keyboard Shortcuts:\n\n• Ctrl/Cmd + Enter → Add task\n• Esc → Cancel editing\n• Ctrl/Cmd + / → Focus search\n• Ctrl/Cmd + D → Focus add task\n• ? → Show this help')}
            className="bg-pink-100 hover:bg-pink-200 rounded-xl px-4 py-2 transition-colors"
            title="Keyboard Shortcuts"
          >
            ⌨️
          </button>
        </div>

        <div className="flex flex-wrap justify-center gap-3 mb-6">
          {["all", "active", "completed"].map((item) => (
            <button
              key={item}
              onClick={() => setFilter(item)}
              className={`px-4 py-2 rounded-lg ${
                filter === item
                  ? "bg-[#D96C92] text-white"
                  : "bg-[#FAD4E0]"
              }`}
            >
              {item}
            </button>
          ))}
        </div>

      <DragDropContext onDragEnd={handleDragEnd}>
  <Droppable droppableId="todos">
    {(provided) => (
      <div
        {...provided.droppableProps}
        ref={provided.innerRef}
        className="space-y-4"
      >
        {filteredTodos.map((todo, index) => (
          <Draggable
            key={todo.id}
            draggableId={String(todo.id)}
            index={index}
          >
            {(provided) => (
              <div
                ref={provided.innerRef}
                {...provided.draggableProps}
                {...provided.dragHandleProps}
                className="bg-[#FFF4F7] p-3 rounded-2xl border border-pink-100 hover:shadow-md transition"
              >
                {/* Main row - everything in one line on mobile */}
                <div className="flex items-center justify-between gap-2">
                  {/* Left section: Drag handle + Checkbox + Task text */}
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    {/* Drag Handle */}
                    <span className="text-pink-400 cursor-grab text-xl flex-shrink-0">
                      ⋮⋮
                    </span>

                    {/* Checkbox - MUCH SMALLER on mobile */}
                    <input
  type="checkbox"
  checked={todo.completed}
  onChange={() => toggleTask(todo.id)}
  style={{ 
    accentColor: '#D96C92',
    width: '14px',
    height: '14px',
    minWidth: '14px',
    minHeight: '14px'
  }}
  className="rounded flex-shrink-0"
/>

                    {/* Task Text */}
                    {editingId === todo.id ? (
                      <input
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        className="border border-pink-200 rounded px-2 py-1 flex-1 min-w-0 text-sm sm:text-base"
                        autoFocus
                      />
                    ) : (
                      <span
                        className={`truncate text-sm sm:text-base ${
                          todo.completed
                            ? "line-through text-pink-300"
                            : "text-[#5B4B53]"
                        }`}
                      >
                        {todo.text}
                      </span>
                    )}
                  </div>

                  {/* Right section: Edit + Delete buttons (pink theme) */}
                  <div className="flex items-center gap-0 sm:gap-1 flex-shrink-0">
                    {editingId === todo.id ? (
                      <button
                        onClick={saveEdit}
                        className="text-green-500 hover:text-green-600 p-1.5 sm:p-2 rounded-lg hover:bg-green-50 transition-colors"
                        title="Save"
                      >
                        <Save size={16} className="sm:w-5 sm:h-5" />
                      </button>
                    ) : (
                      <>
                        <button
                          onClick={() => startEdit(todo)}
                          className="text-[#D96C92] hover:text-[#b84d6f] p-1.5 sm:p-2 rounded-lg hover:bg-pink-50 transition-colors"
                          title="Edit"
                        >
                          <Edit2 size={16} className="sm:w-5 sm:h-5" />
                        </button>

                        <button
                          onClick={() => deleteTask(todo.id)}
                          className="text-[#D96C92] hover:text-[#b84d6f] p-1.5 sm:p-2 rounded-lg hover:bg-pink-50 transition-colors"
                          title="Delete"
                        >
                          <Trash2 size={16} className="sm:w-5 sm:h-5" />
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {/* Priority & Due Date Row - shows below */}
                {(todo.priority && todo.priority !== "None") || todo.dueDate ? (
                  <div className="flex gap-2 mt-2 flex-wrap">
                    {todo.priority && todo.priority !== "None" && (
                      <div className={`flex items-center gap-1 text-xs px-2 py-0.5 sm:py-1 rounded-full ${getPriorityColor(todo.priority)}`}>
                        <Flag size={10} className="sm:w-3 sm:h-3" />
                        <span>{todo.priority}</span>
                      </div>
                    )}

                    {todo.dueDate && (
                      <div
                        className={`flex items-center gap-1 text-xs px-2 py-0.5 sm:py-1 rounded-full ${
                          isOverdue(todo.dueDate)
                            ? "bg-red-500 text-white"
                            : "bg-pink-100 text-pink-700"
                        }`}
                      >
                        <Calendar size={10} className="sm:w-3 sm:h-3" />
                        <span>{isOverdue(todo.dueDate) ? "Overdue" : todo.dueDate}</span>
                      </div>
                    )}
                  </div>
                ) : null}
              </div>
            )}
          </Draggable>
        ))}

        {provided.placeholder}
      </div>
    )}
  </Droppable>
</DragDropContext>
                
        {/* Floating Shortcuts Hint - Mobile Responsive */}
        <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-20">
          <div className="group relative">
            <button 
              onClick={() => alert('⌨️ Keyboard Shortcuts:\n\n• Ctrl/Cmd + Enter → Add task\n• Esc → Cancel editing\n• Ctrl/Cmd + / → Focus search\n• Ctrl/Cmd + D → Focus add task\n• ? → Show this help')}
              className="bg-gradient-to-r from-[#D96C92] to-[#E88BA8] text-white rounded-full w-12 h-12 sm:w-14 sm:h-14 shadow-lg hover:shadow-xl transition-all hover:scale-105 flex items-center justify-center text-xl"
            >
              ⌨️
            </button>
            <div className="absolute bottom-full right-0 mb-2 hidden group-hover:block sm:block">
              
            </div>
          </div>
        </div>
        
        {/* Mobile Hint Bar - Only shows on small screens */}
       
      </div>
    </div>
  );
}

export default App;