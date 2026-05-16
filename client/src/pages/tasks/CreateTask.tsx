import { useState } from "react";
import api from "../../api/axios";
import { useNavigate } from "react-router-dom";

export default function CreateTask() {
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const [priority, setPriority] =
    useState("MEDIUM");

  const [status, setStatus] =
    useState("TODO");

  const [files, setFiles] =
    useState<FileList | null>(null);

  const handleSubmit = async () => {
    const formData = new FormData();

    formData.append("title", title);

    formData.append(
      "description",
      description
    );

    formData.append(
      "priority",
      priority
    );

    formData.append("status", status);

    if (files) {
      for (let i = 0; i < files.length; i++) {
        formData.append(
          "files",
          files[i]
        );
      }
    }

    await api.post(
      "/tasks",
      formData,
      {
        headers: {
          "Content-Type":
            "multipart/form-data",
        },
      }
    );

    navigate("/");
  };

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h1 className="text-2xl mb-4">
        Create Task
      </h1>

      <input
        placeholder="Title"
        className="border p-2 w-full mb-2"
        onChange={(e) =>
          setTitle(e.target.value)
        }
      />

      <textarea
        placeholder="Description"
        className="border p-2 w-full mb-2"
        onChange={(e) =>
          setDescription(
            e.target.value
          )
        }
      />

      <select
        className="border p-2 w-full mb-2"
        onChange={(e) =>
          setPriority(
            e.target.value
          )
        }
      >
        <option value="LOW">LOW</option>

        <option value="MEDIUM">
          MEDIUM
        </option>

        <option value="HIGH">
          HIGH
        </option>
      </select>

      <select
        className="border p-2 w-full mb-2"
        onChange={(e) =>
          setStatus(
            e.target.value
          )
        }
      >
        <option value="TODO">
          TODO
        </option>

        <option value="IN_PROGRESS">
          IN_PROGRESS
        </option>

        <option value="COMPLETED">
          COMPLETED
        </option>
      </select>

      <input
        type="file"
        multiple
        accept=".pdf"
        className="mb-4"
        onChange={(e) =>
          setFiles(e.target.files)
        }
      />

      <button
        onClick={handleSubmit}
        className="bg-blue-500 text-white px-4 py-2"
      >
        Create Task
      </button>
    </div>
  );
}