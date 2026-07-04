import { useEffect, useState } from "react";
import { api } from "../api/client";
import { Todo } from "../types";

export default function Todos() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newTodo, setNewTodo] = useState({ title: "", description: "", due_date: "" });
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null);

  useEffect(() => {
    fetchTodos();
  }, []);

  const fetchTodos = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get<Todo[]>("/api/todos");
      setTodos(response.data);
    } catch (err) {
      setError("Failed to load todos.");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTodo = async () => {
    if (!newTodo.title.trim()) return;
    try {
      const response = await api.post<Todo>("/api/todos", {
        title: newTodo.title,
        description: newTodo.description || undefined,
        due_date: newTodo.due_date || undefined,
        completed: false,
      });
      setTodos((prev) => [...prev, response.data]);
      setNewTodo({ title: "", description: "", due_date: "" });
    } catch (err) {
      setError("Failed to create todo.");
    }
  };

  const handleUpdateTodo = async (id: string) => {
    if (!editingTodo) return;
    try {
      const response = await api.put<Todo>(`/api/todos/${id}`, editingTodo);
      setTodos((prev) =>
        prev.map((todo) => (todo.id === id ? response.data : todo))
      );
      setEditingTodo(null);
    } catch (err) {
      setError("Failed to update todo.");
    }
  };

  const handleDeleteTodo = async (id: string) => {
    try {
      await api.delete(`/api/todos/${id}`);
      setTodos((prev) => prev.filter((todo) => todo.id !== id));
    } catch (err) {
      setError("Failed to delete todo.");
    }
  };

  if (loading) {
    return <div className="p-4">Loading...</div>;
  }

  if (error) {
    return <div className="p-4 text-red-500">{error}</div>;
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Todos</h1>
      <div className="mb-4">
        <input
          type="text"
          placeholder="Title"
          value={newTodo.title}
          onChange={(e) => setNewTodo({ ...newTodo, title: e.target.value })}
          className="border p-2 mr-2"
        />
        <input
          type="text"
          placeholder="Description"
          value={newTodo.description}
          onChange={(e) => setNewTodo({ ...newTodo, description: e.target.value })}
          className="border p-2 mr-2"
        />
        <input
          type="date"
          value={newTodo.due_date}
          onChange={(e) => setNewTodo({ ...newTodo, due_date: e.target.value })}
          className="border p-2 mr-2"
        />
        <button
          onClick={handleCreateTodo}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Add Todo
        </button>
      </div>
      {todos.length === 0 ? (
        <div>No todos found.</div>
      ) : (
        <ul>
          {todos.map((todo) => (
            <li
              key={todo.id}
              className="border p-4 mb-2 flex justify-between items-center"
            >
              {editingTodo?.id === todo.id ? (
                <div className="flex-1">
                  <input
                    type="text"
                    value={editingTodo.title}
                    onChange={(e) =>
                      setEditingTodo({ ...editingTodo, title: e.target.value })
                    }
                    className="border p-2 mr-2 w-full"
                  />
                  <input
                    type="text"
                    value={editingTodo.description || ""}
                    onChange={(e) =>
                      setEditingTodo({
                        ...editingTodo,
                        description: e.target.value,
                      })
                    }
                    className="border p-2 mr-2 w-full"
                  />
                  <input
                    type="date"
                    value={editingTodo.due_date || ""}
                    onChange={(e) =>
                      setEditingTodo({
                        ...editingTodo,
                        due_date: e.target.value,
                      })
                    }
                    className="border p-2 mr-2"
                  />
                  <button
                    onClick={() => handleUpdateTodo(todo.id)}
                    className="bg-green-500 text-white px-4 py-2 rounded mr-2"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => setEditingTodo(null)}
                    className="bg-gray-500 text-white px-4 py-2 rounded"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <>
                  <div className="flex-1">
                    <h2 className="font-bold">{todo.title}</h2>
                    <p>{todo.description}</p>
                    <p className="text-sm text-gray-500">
                      Due: {todo.due_date ? new Date(todo.due_date).toLocaleDateString() : "N/A"}
                    </p>
                  </div>
                  <div className="flex items-center">
                    <button
                      onClick={() => setEditingTodo(todo)}
                      className="bg-yellow-500 text-white px-4 py-2 rounded mr-2"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteTodo(todo.id)}
                      className="bg-red-500 text-white px-4 py-2 rounded"
                    >
                      Delete
                    </button>
                  </div>
                </>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}