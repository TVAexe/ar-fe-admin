"use client";

import { useState } from "react";
import { useCreateCategory, useGetCategories, useUpdateCategory, useDeleteCategory } from "@/apis/categoryAPI";
import { useForm } from "react-hook-form";

interface Category {
  id: number;
  name: string;
}

export default function CategoryPage() {
  const [editing, setEditing] = useState<Category | null>(null);
  const [showForm, setShowForm] = useState(false);

  const { data: categories = [], isLoading } = useGetCategories();

  const createMutation = useCreateCategory();

  const updateMutation = useUpdateCategory();

  const deleteMutation = useDeleteCategory();

  const { register, handleSubmit, reset } = useForm<{ name: string }>({
    defaultValues: { name: "" },
  });

  const handleAdd = (data: { name: string }) => {
    createMutation.mutate(data, { onSuccess: () => reset() });
  };

  const handleUpdate = (data: { name: string }) => {
    if (!editing) return;
    updateMutation.mutate({ id: editing.id, name: data.name }, { onSuccess: () => setEditing(null) });
  };

  const onSubmit = (data: { name: string }) => {
    if (editing) handleUpdate(data);
    else handleAdd(data);
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-xl font-bold mb-4">Quản lý Category</h1>

      <button
        className="mb-4 px-4 py-2 bg-green-600 text-white rounded"
        onClick={() => {
          setShowForm(true);
          setEditing(null);
          reset({ name: "" });
        }}
      >
        + Thêm Category
      </button>

      {showForm && (
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="mb-4 border p-4 rounded bg-white space-y-2"
        >
          <input
            {...register("name", { required: true })}
            placeholder="Tên category"
            className="border p-2 rounded w-full"
          />
          <div className="flex gap-2">
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded">
              {editing ? "Cập nhật" : "Thêm"}
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-4 py-2 border rounded"
            >
              Hủy
            </button>
          </div>
        </form>
      )}

      {isLoading ? (
        <p>Đang tải...</p>
      ) : (
        <table className="w-full border bg-white">
          <thead className="bg-gray-100">
            <tr>
              <th className="border p-2">ID</th>
              <th className="border p-2">Tên</th>
              <th className="border p-2 w-40">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((c) => (
              <tr key={c.id}>
                <td className="border p-2">{c.id}</td>
                <td className="border p-2">{c.name}</td>
                <td className="border p-2 flex gap-2">
                  <button
                    className="px-2 py-1 bg-yellow-500 text-white rounded"
                    onClick={() => {
                      setEditing(c);
                      setShowForm(true);
                      reset({ name: c.name });
                    }}
                  >
                    Sửa
                  </button>
                  <button
                    className="px-2 py-1 bg-red-600 text-white rounded"
                    onClick={() => {
                      if (confirm("Xóa category?")) deleteMutation.mutate(c.id);
                    }}
                  >
                    Xóa
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
