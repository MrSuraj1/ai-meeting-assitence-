// NameInput.jsx
import { useState } from "react";

export default function NameInput({ onNameSubmit }) {
  const [name, setName] = useState("");

  return (
    <div className="flex items-center justify-center h-screen flex-col">
      <h2 className="text-2xl mb-4">Enter Your Name</h2>

      <input
        type="text"
        className="border p-2 rounded w-64"
        placeholder="Your name..."
        onChange={(e) => setName(e.target.value)}
      />

      <button
        className="mt-4 bg-blue-600 text-white px-4 py-2 rounded"
        onClick={() => {
          if (!name.trim()) return alert("Enter name!");
          localStorage.setItem("username", name);
          onNameSubmit(name);
        }}
      >
        Continue
      </button>
    </div>
  );
}
