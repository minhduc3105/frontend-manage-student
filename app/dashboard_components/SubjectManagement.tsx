// components/SubjectManagement.tsx
import { useState } from "react"
import { useSubjects } from "../../src/hooks/useSubject"
import { SubjectCreate, SubjectUpdate } from "../../src/services/api/subject"

// Define the type for the props this component expects
interface SubjectManagementProps {
  searchTerm: string;
  updateSearchTerm: (section: string, value: string) => void;
  handleCreateNew: (type: string) => void;
}

// Update the component to accept the props
export default function SubjectManagement({ searchTerm, updateSearchTerm }: SubjectManagementProps) {
  const { subjects, loading, addSubject, editSubject, removeSubject } = useSubjects()
  const [form, setForm] = useState<SubjectCreate>({ name: "", description: "" })
  const [editingId, setEditingId] = useState<number | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (editingId) {
      await editSubject(editingId, form as SubjectUpdate)
      setEditingId(null)
    } else {
      await addSubject(form)
    }
    setForm({ name: "", description: "" })
  }

  // Filter subjects based on the search term
  const filteredSubjects = subjects.filter(subject =>
    subject.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Subject Management</h1>
      
      {/* Search and Create Buttons Section */}
      <div className="flex justify-between items-center mb-4">
        <input
          type="text"
          placeholder="Search subjects..."
          value={searchTerm}
          onChange={(e) => updateSearchTerm('subject', e.target.value)}
          className="border p-2 rounded w-full max-w-xs dark:bg-gray-800 dark:border-gray-700"
        />
      </div>

      <form onSubmit={handleSubmit} className="flex gap-2 mb-4">
        <input
          type="text"
          placeholder="Subject Name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          className="border p-2 rounded"
          required
        />
        <input
          type="text"
          placeholder="Mô tả"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          className="border p-2 rounded"
        />
        <button type="submit" className="bg-cyan-500 text-white px-4 py-2 rounded">
          {editingId ? "Update" : "Add"}
        </button>
      </form>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <table className="w-full border">
          <thead>
            <tr className="bg-gray-100 dark:bg-gray-700">
              <th className="border p-2">ID</th>
              <th className="border p-2">Name</th>
              <th className="border p-2">Description</th>
              <th className="border p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredSubjects.map((s) => (
              <tr key={s.subject_id} className="dark:bg-gray-800">
                <td className="border p-2">{s.subject_id}</td>
                <td className="border p-2">{s.name}</td>
                <td className="border p-2">{s.description}</td>
                <td className="border p-2 space-x-2">
                  <button
                    onClick={() => {
                      setForm({ name: s.name, description: s.description })
                      setEditingId(s.subject_id)
                    }}
                    className="bg-yellow-400 px-2 py-1 rounded"
                  >
                    Sửa
                  </button>
                  <button
                    onClick={() => removeSubject(s.subject_id)}
                    className="bg-red-500 text-white px-2 py-1 rounded"
                  >
                    Xoá
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}