"use client";
import { useEffect, useState, KeyboardEvent } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  ArrowLeft,
  CheckCircle2,
  Circle,
  Loader2,
  Trash2,
  Plus,
} from "lucide-react";

// 1. Define the Todo Interface to satisfy TypeScript
interface Todo {
  id: number;
  task: string;
  completed: boolean;
  userName: string;
}

export default function TodoPage() {
  const router = useRouter();

  // 2. Properly typed states
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [userName, setUserName] = useState<string>("");
  const [newTask, setNewTask] = useState<string>("");

  useEffect(() => {
    if (typeof window === "undefined") return;

    const storedName = localStorage.getItem("name");
    if (!storedName) {
      router.push("/login"); // Adjust this path to your login route
      return;
    }
    setUserName(storedName);
    fetchTodos(storedName);
  }, [router]);

  const fetchTodos = async (name: string) => {
    try {
      const response = await fetch(
        `/api/todos?name=${encodeURIComponent(name)}`,
      );
      if (response.ok) {
        const data = await response.json();
        setTodos(data);
      }
    } catch (err) {
      console.error("Fetch error:", err);
      toast.error("Жагсаалтыг ачаалахад алдаа гарлаа");
    } finally {
      setLoading(false);
    }
  };

  const handleAddTask = async () => {
    if (!newTask.trim()) return;

    try {
      const response = await fetch("/api/todos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ task: newTask, userName }),
      });

      if (response.ok) {
        const addedTodo = await response.json();
        setTodos((prev) => [addedTodo, ...prev]);
        setNewTask("");
        toast.success("Амжилттай нэмэгдлээ!");
      }
    } catch (err) {
      console.error("Add error:", err);
      toast.error("Нэмэхэд алдаа гарлаа");
    }
  };

  const toggleTodo = async (id: number, currentStatus: boolean) => {
    // Optimistic UI Update
    setTodos((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed: !currentStatus } : t)),
    );

    try {
      const response = await fetch(`/api/todos/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ completed: !currentStatus }),
      });

      if (!response.ok) throw new Error();
    } catch (err) {
      toast.error("Төлөв өөрчлөхөд алдаа гарлаа");
      // Revert state on error
      setTodos((prev) =>
        prev.map((t) => (t.id === id ? { ...t, completed: currentStatus } : t)),
      );
    }
  };

  const deleteTodo = async (id: number) => {
    const previousTodos = [...todos];
    setTodos((prev) => prev.filter((t) => t.id !== id));

    try {
      const response = await fetch(`/api/todos/${id}`, { method: "DELETE" });
      if (!response.ok) throw new Error();
      toast.info("Устгагдлаа");
    } catch (err) {
      toast.error("Устгахад алдаа гарлаа");
      setTodos(previousTodos);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleAddTask();
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-6 font-sans">
      {/* Background Orbs */}
      <div className="fixed inset-0 overflow-hidden -z-10">
        <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-[128px] opacity-20"></div>
        <div className="absolute bottom-0 -right-4 w-72 h-72 bg-emerald-500 rounded-full mix-blend-multiply filter blur-[128px] opacity-20"></div>
      </div>

      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-10">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-white/10 rounded-full transition-colors"
          >
            <ArrowLeft size={24} />
          </button>
          <div className="text-right">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent uppercase tracking-wider">
              {userName}-н жагсаалт
            </h1>
            <p className="text-gray-400 text-sm italic">Өнөөдрийн төлөвлөгөө</p>
          </div>
        </div>

        {/* Todo List Card */}
        <div className="bg-white/5 border border-white/10 backdrop-blur-xl rounded-3xl overflow-hidden shadow-2xl">
          {loading ? (
            <div className="flex flex-col items-center justify-center p-20 gap-4">
              <Loader2 className="animate-spin text-emerald-500" size={32} />
              <p className="text-gray-400">Ачаалж байна...</p>
            </div>
          ) : todos.length > 0 ? (
            <div className="divide-y divide-white/5">
              {todos.map((todo) => (
                <div
                  key={todo.id}
                  className="flex items-center justify-between p-5 hover:bg-white/[0.02] transition-colors group"
                >
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => toggleTodo(todo.id, todo.completed)}
                      className="text-emerald-400 hover:scale-110 transition-transform"
                    >
                      {todo.completed ? (
                        <CheckCircle2
                          size={24}
                          className="fill-emerald-500/20"
                        />
                      ) : (
                        <Circle size={24} className="text-gray-600" />
                      )}
                    </button>
                    <span
                      className={`text-lg transition-all duration-300 ${
                        todo.completed
                          ? "line-through text-gray-500 opacity-60"
                          : "text-gray-200"
                      }`}
                    >
                      {todo.task}
                    </span>
                  </div>
                  <button
                    onClick={() => deleteTodo(todo.id)}
                    className=" group-hover:opacity-100 p-2 text-gray-500 hover:text-red-500 transition-all"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-20 text-center">
              <div className="text-5xl mb-4 opacity-50">🍃</div>
              <p className="text-gray-500">Одоогоор хийх ажил алга.</p>
            </div>
          )}
        </div>

        {/* Add Task Input */}
        <div className="mt-8 flex gap-3">
          <input
            type="text"
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Шинэ ажил нэмэх..."
            className="flex-1 bg-white/5 border border-white/10 rounded-2xl px-6 py-4 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 transition-all placeholder:text-gray-600 shadow-inner"
          />
          <button
            onClick={handleAddTask}
            className="bg-emerald-600 hover:bg-emerald-500 text-white px-8 rounded-2xl font-bold transition-all active:scale-95 flex items-center gap-2 shadow-lg shadow-emerald-900/20"
          >
            <Plus size={20} />
            <span>Нэмэх</span>
          </button>
        </div>
      </div>
    </div>
  );
}
