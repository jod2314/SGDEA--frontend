import { useEffect, useState } from "react";
import PortalLayout from "../layout/PortalLayout";
import { useAuth } from "../auth/AuthProvider";
import { API_URL } from "../auth/authConstants";
import * as IconsMd from "react-icons/md";

const MdPostAdd = IconsMd.MdPostAdd as any;
const MdArticle = IconsMd.MdArticle as any;
const MdCheckBox = IconsMd.MdCheckBox as any;
const MdCheckBoxOutlineBlank = IconsMd.MdCheckBoxOutlineBlank as any;
const MdEdit = IconsMd.MdEdit as any;
const MdDelete = IconsMd.MdDelete as any;

interface Todo {
  _id: string;
  title: string;
  completed: boolean;
}

export default function Dashboard() {
  const auth = useAuth();

  const [todos, setTodos] = useState<Todo[]>([]);
  const [value, setValue] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState("");

  // Fetch Todos
  async function getTodos() {
    try {
      const json = await auth.request<Todo[]>("/posts");
      setTodos(json);
    } catch (error) {
      console.log(error);
    }
  }

  // Create Todo
  async function createTodo() {
    if (value.length > 3) {
      try {
        const todo = await auth.request<Todo>("/posts", {
          method: "POST",
          body: JSON.stringify({ title: value }),
        });
        setTodos([...todos, todo]);
        setValue("");
      } catch (error) {}
    }
  }

  // Update Todo (for both title and completed status)
  async function updateTodo(id: string, updates: Partial<Omit<Todo, "_id">>) {
    try {
      const response = await fetch(`${API_URL}/posts/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${auth.getAccessToken()}`,
        },
        body: JSON.stringify(updates),
      });

      if (response.ok) {
        const updatedTodo = (await response.json()) as Todo;
        setTodos(
          todos.map((todo) => (todo._id === id ? updatedTodo : todo))
        );
      }
    } catch (error) {
      console.log(error);
    }
  }

  // Delete Todo
  async function deleteTodo(id: string) {
    try {
      const response = await fetch(`${API_URL}/posts/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${auth.getAccessToken()}`,
        },
      });
      if (response.ok) {
        setTodos(todos.filter((todo) => todo._id !== id));
      }
    } catch (error) {
      console.log(error);
    }
  }

  // Handlers for Edit Mode
  function handleEditClick(todo: Todo) {
    setEditingId(todo._id);
    setEditingText(todo.title);
  }

  function handleCancelClick() {
    setEditingId(null);
    setEditingText("");
  }

  async function handleSaveClick(id: string) {
    await updateTodo(id, { title: editingText });
    setEditingId(null);
    setEditingText("");
  }

  async function handleToggleComplete(id: string, completed: boolean) {
    await updateTodo(id, { completed: !completed });
  }

  useEffect(() => {
    getTodos();
  }, []);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    createTodo();
  }

  return (
    <PortalLayout>
      <div className="dashboard">
        <h1>Dashboard de {auth.getUser()?.name ?? ""}</h1>

        <form onSubmit={handleSubmit} className="create-todo-form">
          <input
            type="text"
            placeholder="Añadir nueva tarea..."
            value={value}
            onChange={(e) => setValue(e.target.value)}
          />
          <button type="submit" className="btn btn-primary">
            <MdPostAdd size={24} />
          </button>
        </form>

        {todos.map((post: Todo) => (
          <div key={post._id} className="card">
            {editingId === post._id ? (
              // Edit Mode
              <div className="edit-form">
                <input
                  type="text"
                  value={editingText}
                  onChange={(e) => setEditingText(e.target.value)}
                  className="edit-input"
                />
                <div className="edit-actions">
                  <button
                    className="btn btn-ghost"
                    onClick={handleCancelClick}
                  >
                    Cancelar
                  </button>
                  <button
                    className="btn btn-primary"
                    onClick={() => handleSaveClick(post._id)}
                  >
                    Guardar
                  </button>
                </div>
              </div>
            ) : (
              // Display Mode
              <>
                <div className="card-actions">
                  <button
                    className="icon-btn"
                    title="Edit Title"
                    onClick={() => handleEditClick(post)}
                  >
                    <MdEdit />
                  </button>
                  <button
                    className="icon-btn"
                    title="Delete"
                    onClick={() => deleteTodo(post._id)}
                  >
                    <MdDelete />
                  </button>
                </div>
                <div className="todo-item-title">
                  <MdArticle
                    size={22}
                    style={{ color: "var(--text-secondary)" }}
                  />
                  <h3>{post.title}</h3>
                </div>
                <div
                  className="todo-item-status"
                  onClick={() => handleToggleComplete(post._id, post.completed)}
                  style={{ cursor: "pointer" }}
                >
                  {post.completed ? (
                    <MdCheckBox style={{ color: "var(--primary)" }} />
                  ) : (
                    <MdCheckBoxOutlineBlank />
                  )}
                  <span>{post.completed ? "Completado" : "Pendiente"}</span>
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </PortalLayout>
  );
}
