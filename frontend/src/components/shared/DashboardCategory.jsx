import React, { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";

const API_URL = import.meta.env.VITE_REACT_APP_API_URL;

const DashboardCategory = () => {
  const { toast } = useToast();

  const [categories, setCategories] = useState(["uncategorised"]);
  const [addingCategory, setAddingCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [categoryToDelete, setCategoryToDelete] = useState(null); // { id, name }

  // Fetch categories on mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch(`${API_URL}/api/category`);
        const data = await res.json();
        if (res.ok) {
          const names = data.map((c) => ({ id: c._id, name: c.name }));
          setCategories([
            { id: null, name: "uncategorised" },
            ...names.filter((n) => n.name !== "uncategorised"),
          ]);
        }
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };
    fetchCategories();
  }, []);

  // Add category
  const handleConfirmNewCategory = async () => {
    if (!newCategoryName.trim()) return;

    if (newCategoryName.toLowerCase() === "uncategorised") {
      toast({
        title: "This category already exists and cannot be added again.",
      });
      return;
    }

    try {
      const res = await fetch(`${API_URL}/api/category`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newCategoryName }),
      });

      const data = await res.json();

      if (res.ok) {
        setCategories([{ id: data._id, name: data.name }, ...categories]);
        setNewCategoryName("");
        setAddingCategory(false);
        toast({ title: "Category added!" });
      } else {
        toast({ title: data.message || "Error adding category" });
      }
    } catch (error) {
      console.error(error);
    }
  };

  // Delete category
  const handleDeleteCategory = async () => {
    if (!categoryToDelete) return;

    try {
      const res = await fetch(
        `${API_URL}/api/category/${categoryToDelete.id}`,
        { method: "DELETE" }
      );
      const data = await res.json();

      if (res.ok) {
        setCategories(
          categories.filter((c) => c.name !== categoryToDelete.name)
        );
        toast({ title: "Category deleted!" });
        setCategoryToDelete(null);
      } else {
        toast({ title: data.message || "Error deleting category" });
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="p-4 max-w-lg mx-auto h-screen">
      <h1 className="text-xl font-semibold mb-4">Manage Categories</h1>

      <div className="flex flex-col gap-3">
        {categories.map((cat) => (
          <div
            key={cat.name}
            className="flex items-center border px-2 py-1 rounded"
          >
            <span className="flex-1">{cat.name}</span>

            {cat.name !== "uncategorised" && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <button
                    type="button"
                    className="text-red-500"
                    onClick={() => setCategoryToDelete(cat)}
                  >
                    ❌
                  </button>
                </AlertDialogTrigger>

                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>
                      Are you sure you want to delete "{cat.name}"?
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. The category will be
                      permanently removed.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel
                      onClick={() => setCategoryToDelete(null)}
                    >
                      Cancel
                    </AlertDialogCancel>
                    <AlertDialogAction
                      className="bg-red-600"
                      onClick={handleDeleteCategory}
                    >
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>
        ))}

        {addingCategory && (
          <div className="flex items-center gap-2 border px-2 py-1 rounded">
            <Input
              autoFocus
              type="text"
              placeholder="New category name"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleConfirmNewCategory()}
            />
            <button
              type="button"
              className="text-green-600 font-bold"
              onClick={handleConfirmNewCategory}
            >
              ✔️
            </button>
          </div>
        )}

        {!addingCategory && (
          <Button
            type="button"
            className="mt-2"
            onClick={() => setAddingCategory(true)}
          >
            + Add Category
          </Button>
        )}
      </div>
    </div>
  );
};

export default DashboardCategory;
