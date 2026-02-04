"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronRight, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

interface Category {
  id: string;
  name: string;
  icon: string;
  image_url?: string;
  description?: string;
  product_count?: number;
  parent_id?: string | null;
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  const supabase = createClient();

  useEffect(() => {
    loadCategories();
  }, []);

  async function loadCategories() {
    try {
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .eq("is_active", true)
        .is("parent_id", null)
        .order("order_index");

      if (data) {
        // Get product counts
        const categoriesWithCount = await Promise.all(
          data.map(async (category) => {
            const { count } = await supabase
              .from("products")
              .select("*", { count: "exact", head: true })
              .eq("category_id", category.id)
              .eq("is_active", true);
            
            return { ...category, product_count: count || 0 };
          })
        );
        setCategories(categoriesWithCount);
      }
    } catch (error) {
      console.error("Error loading categories:", error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="container px-4 sm:px-6">
        <div className="skeleton h-10 w-48 mb-8" />
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 sm:gap-6">
          {[...Array(12)].map((_, i) => (
            <div key={i} className="skeleton h-40 rounded-3xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container px-4 sm:px-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Link href="/">
          <Button variant="ghost" size="icon" className="rounded-full glass">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <h1 className="text-2xl sm:text-3xl font-bold">Kategoriyalar</h1>
      </div>

      {/* Categories grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 sm:gap-6 stagger-children">
        {categories.map((category, index) => (
          <Link
            key={category.id}
            href={`/categories/${category.id}`}
            className="group"
            style={{ animationDelay: `${index * 0.05}s` }}
          >
            <div className="product-card p-6 flex flex-col items-center text-center gap-4 hover-spring">
              {category.image_url ? (
                <div className="relative w-20 h-20 sm:w-24 sm:h-24">
                  <Image
                    src={category.image_url}
                    alt={category.name}
                    fill
                    className="object-contain"
                  />
                </div>
              ) : (
                <div className="text-5xl sm:text-6xl">{category.icon}</div>
              )}
              <div>
                <h3 className="font-semibold text-sm sm:text-base group-hover:text-primary transition-colors">
                  {category.name}
                </h3>
                <p className="text-xs text-muted-foreground mt-1">
                  {category.product_count} ta mahsulot
                </p>
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
