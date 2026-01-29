"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export type Category = {
  id: string;
  name_uz: string;
  name_ru: string | null;
  slug: string;
  icon: string | null;
  image_url: string | null;
  parent_id: string | null;
  sort_order: number;
  is_active: boolean;
  children?: Category[];
  created_at: string;
};

export async function getCategories() {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .order("sort_order", { ascending: true });

  if (error) {
    console.error("Error fetching categories:", error);
    return [];
  }

  // Build hierarchy
  const categoriesMap = new Map<string, Category>();
  const rootCategories: Category[] = [];

  // First pass: create nodes
  data.forEach((cat) => {
    categoriesMap.set(cat.id, { ...cat, children: [] });
  });

  // Second pass: link children to parents
  data.forEach((cat) => {
    const node = categoriesMap.get(cat.id)!;
    if (cat.parent_id && categoriesMap.has(cat.parent_id)) {
      const parent = categoriesMap.get(cat.parent_id)!;
      parent.children?.push(node);
    } else {
      rootCategories.push(node);
    }
  });

  return rootCategories;
}

export async function createCategory(formData: FormData) {
  const supabase = createClient();
  
  const name_uz = formData.get("name_uz") as string;
  const name_ru = formData.get("name_ru") as string;
  const icon = formData.get("icon") as string;
  const parent_id = formData.get("parent_id") as string || null;
  
  // Generate slug
  const slug = name_uz
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "") + "-" + Date.now().toString().slice(-4);

  const { error } = await supabase.from("categories").insert({
    name_uz,
    name_ru,
    icon,
    parent_id,
    slug,
    is_active: true
  });

  if (error) {
    console.error("Error creating category:", error);
    throw new Error("Kategoriya yaratishda xatolik");
  }

  revalidatePath("/admin/categories");
}

export async function updateCategory(id: string, formData: FormData) {
  const supabase = createClient();
  
  const name_uz = formData.get("name_uz") as string;
  const name_ru = formData.get("name_ru") as string;
  const icon = formData.get("icon") as string;
  
  const { error } = await supabase
    .from("categories")
    .update({
      name_uz,
      name_ru,
      icon,
    })
    .eq("id", id);

  if (error) {
    console.error("Error updating category:", error);
    throw new Error("Kategoriya yangilashda xatolik");
  }

  revalidatePath("/admin/categories");
}

export async function deleteCategory(id: string) {
  const supabase = createClient();
  
  const { error } = await supabase
    .from("categories")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("Error deleting category:", error);
    throw new Error("Kategoriyani o'chirishda xatolik");
  }

  revalidatePath("/admin/categories");
}

export async function toggleCategoryStatus(id: string, isActive: boolean) {
  const supabase = createClient();
  
  const { error } = await supabase
    .from("categories")
    .update({ is_active: isActive })
    .eq("id", id);

  if (error) {
    console.error("Error updating category status:", error);
    throw new Error("Statusni o'zgartirishda xatolik");
  }

  revalidatePath("/admin/categories");
}
