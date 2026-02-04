"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft,
  Star,
  Heart,
  Plus,
  SlidersHorizontal,
  Grid3X3,
  LayoutList,
  ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

interface Category {
  id: string;
  name: string;
  icon: string;
}

interface SubCategory {
  id: string;
  name: string;
  parent_id: string;
}

interface Product {
  id: string;
  name: string;
  price: number;
  original_price?: number;
  image_url: string;
  rating: number;
  reviews_count: number;
  shop_id: string;
  shop?: {
    name: string;
  };
}

type SortOption = "popular" | "price_asc" | "price_desc" | "newest" | "rating";

export default function CategoryPage() {
  const params = useParams();
  const categoryId = params.id as string;

  const [category, setCategory] = useState<Category | null>(null);
  const [subCategories, setSubCategories] = useState<SubCategory[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [sortBy, setSortBy] = useState<SortOption>("popular");
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [selectedSubCategory, setSelectedSubCategory] = useState<string | null>(null);

  const supabase = createClient();

  useEffect(() => {
    loadData();
  }, [categoryId, sortBy, selectedSubCategory]);

  async function loadData() {
    setLoading(true);
    try {
      // Load category
      const { data: categoryData } = await supabase
        .from("categories")
        .select("*")
        .eq("id", categoryId)
        .single();

      // Load subcategories
      const { data: subCatData } = await supabase
        .from("categories")
        .select("*")
        .eq("parent_id", categoryId)
        .eq("is_active", true)
        .order("order_index");

      // Build products query
      let query = supabase
        .from("products")
        .select(`
          *,
          shop:shops(name)
        `)
        .eq("is_active", true);

      // Filter by category or subcategory
      if (selectedSubCategory) {
        query = query.eq("category_id", selectedSubCategory);
      } else {
        // Get products from this category and all subcategories
        const categoryIds = [categoryId, ...(subCatData?.map(sc => sc.id) || [])];
        query = query.in("category_id", categoryIds);
      }

      // Apply sorting
      switch (sortBy) {
        case "price_asc":
          query = query.order("price", { ascending: true });
          break;
        case "price_desc":
          query = query.order("price", { ascending: false });
          break;
        case "newest":
          query = query.order("created_at", { ascending: false });
          break;
        case "rating":
          query = query.order("rating", { ascending: false });
          break;
        default:
          query = query.order("is_featured", { ascending: false }).order("created_at", { ascending: false });
      }

      const { data: productsData } = await query.limit(50);

      setCategory(categoryData);
      setSubCategories(subCatData || []);
      setProducts(productsData || []);
    } catch (error) {
      console.error("Error loading category:", error);
    } finally {
      setLoading(false);
    }
  }

  function addToCart(product: Product) {
    const cart = JSON.parse(localStorage.getItem("cart") || "[]");
    const existingIndex = cart.findIndex((item: any) => item.id === product.id);
    
    if (existingIndex >= 0) {
      cart[existingIndex].quantity += 1;
    } else {
      cart.push({
        id: product.id,
        name: product.name,
        price: product.price,
        original_price: product.original_price,
        image_url: product.image_url,
        quantity: 1,
        shop_id: product.shop_id,
        shop_name: product.shop?.name,
      });
    }
    
    localStorage.setItem("cart", JSON.stringify(cart));
    window.dispatchEvent(new Event("cartUpdated"));
  }

  function toggleFavorite(productId: string) {
    const favorites = JSON.parse(localStorage.getItem("favorites") || "[]");
    const index = favorites.indexOf(productId);
    
    if (index >= 0) {
      favorites.splice(index, 1);
    } else {
      favorites.push(productId);
    }
    
    localStorage.setItem("favorites", JSON.stringify(favorites));
  }

  function isFavorite(productId: string): boolean {
    if (typeof window === "undefined") return false;
    const favorites = JSON.parse(localStorage.getItem("favorites") || "[]");
    return favorites.includes(productId);
  }

  function formatPrice(price: number): string {
    return new Intl.NumberFormat("uz-UZ").format(price) + " so'm";
  }

  const sortOptions: { value: SortOption; label: string }[] = [
    { value: "popular", label: "Mashhur" },
    { value: "newest", label: "Yangi" },
    { value: "price_asc", label: "Arzon" },
    { value: "price_desc", label: "Qimmat" },
    { value: "rating", label: "Reyting" },
  ];

  return (
    <div className="container px-4 sm:px-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link href="/categories">
          <Button variant="ghost" size="icon" className="rounded-full glass">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-3">
            {category?.icon && <span className="text-3xl">{category.icon}</span>}
            {category?.name || "Yuklanyapti..."}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {products.length} ta mahsulot
          </p>
        </div>
      </div>

      {/* Subcategories */}
      {subCategories.length > 0 && (
        <div className="flex gap-2 overflow-x-auto pb-4 no-scrollbar mb-6">
          <button
            onClick={() => setSelectedSubCategory(null)}
            className={cn(
              "category-pill whitespace-nowrap text-sm",
              !selectedSubCategory && "active"
            )}
          >
            Barchasi
          </button>
          {subCategories.map((subCat) => (
            <button
              key={subCat.id}
              onClick={() => setSelectedSubCategory(subCat.id)}
              className={cn(
                "category-pill whitespace-nowrap text-sm",
                selectedSubCategory === subCat.id && "active"
              )}
            >
              {subCat.name}
            </button>
          ))}
        </div>
      )}

      {/* Filters & Sort */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="glass rounded-full gap-2">
            <SlidersHorizontal className="h-4 w-4" />
            Filter
          </Button>
          
          <div className="relative">
            <Button
              variant="outline"
              size="sm"
              className="glass rounded-full gap-2"
              onClick={() => setShowSortMenu(!showSortMenu)}
            >
              {sortOptions.find(o => o.value === sortBy)?.label}
              <ChevronDown className="h-4 w-4" />
            </Button>
            
            {showSortMenu && (
              <div className="absolute top-full left-0 mt-2 glass rounded-xl p-2 min-w-[150px] z-50 shadow-xl">
                {sortOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => {
                      setSortBy(option.value);
                      setShowSortMenu(false);
                    }}
                    className={cn(
                      "w-full text-left px-4 py-2 rounded-lg text-sm transition-colors",
                      sortBy === option.value
                        ? "bg-primary text-white"
                        : "hover:bg-primary/10"
                    )}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1 glass rounded-full p-1">
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              "h-8 w-8 rounded-full",
              viewMode === "grid" && "bg-primary text-white"
            )}
            onClick={() => setViewMode("grid")}
          >
            <Grid3X3 className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              "h-8 w-8 rounded-full",
              viewMode === "list" && "bg-primary text-white"
            )}
            onClick={() => setViewMode("list")}
          >
            <LayoutList className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Products */}
      {loading ? (
        <div className={cn(
          "gap-4 sm:gap-6",
          viewMode === "grid"
            ? "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5"
            : "space-y-4"
        )}>
          {[...Array(10)].map((_, i) => (
            <div key={i} className={cn(
              "skeleton rounded-3xl",
              viewMode === "grid" ? "aspect-[3/4]" : "h-32"
            )} />
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-muted-foreground">
            Bu kategoriyada mahsulotlar topilmadi
          </p>
        </div>
      ) : (
        <div className={cn(
          "gap-4 sm:gap-6 stagger-children",
          viewMode === "grid"
            ? "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5"
            : "space-y-4"
        )}>
          {products.map((product, index) => (
            viewMode === "grid" ? (
              <ProductCardGrid
                key={product.id}
                product={product}
                onAddToCart={() => addToCart(product)}
                onToggleFavorite={() => toggleFavorite(product.id)}
                isFavorite={isFavorite(product.id)}
                formatPrice={formatPrice}
                index={index}
              />
            ) : (
              <ProductCardList
                key={product.id}
                product={product}
                onAddToCart={() => addToCart(product)}
                onToggleFavorite={() => toggleFavorite(product.id)}
                isFavorite={isFavorite(product.id)}
                formatPrice={formatPrice}
              />
            )
          ))}
        </div>
      )}
    </div>
  );
}

function ProductCardGrid({
  product,
  onAddToCart,
  onToggleFavorite,
  isFavorite,
  formatPrice,
  index,
}: {
  product: Product;
  onAddToCart: () => void;
  onToggleFavorite: () => void;
  isFavorite: boolean;
  formatPrice: (price: number) => string;
  index: number;
}) {
  const discountPercent = product.original_price
    ? Math.round(((product.original_price - product.price) / product.original_price) * 100)
    : 0;

  return (
    <div
      className="product-card overflow-hidden"
      style={{ animationDelay: `${index * 0.05}s` }}
    >
      <Link href={`/products/${product.id}`}>
        <div className="relative aspect-square img-zoom">
          <Image
            src={product.image_url || "/placeholder-product.jpg"}
            alt={product.name}
            fill
            className="object-cover"
          />
          {discountPercent > 0 && (
            <span className="discount-badge">-{discountPercent}%</span>
          )}
        </div>
      </Link>
      
      <div className="p-4 space-y-2">
        {product.shop && (
          <p className="text-xs text-muted-foreground truncate">
            {product.shop.name}
          </p>
        )}
        
        <Link href={`/products/${product.id}`}>
          <h3 className="font-medium text-sm line-clamp-2 hover:text-primary transition-colors">
            {product.name}
          </h3>
        </Link>
        
        <div className="flex items-center gap-1">
          <Star className="h-3 w-3 rating-star fill-current" />
          <span className="text-xs font-medium">{product.rating?.toFixed(1) || "0.0"}</span>
          <span className="text-xs text-muted-foreground">
            ({product.reviews_count || 0})
          </span>
        </div>
        
        <div className="flex items-center gap-2">
          <span className="price-tag text-sm">
            {formatPrice(product.price)}
          </span>
        </div>
        {product.original_price && (
          <span className="text-xs text-muted-foreground line-through">
            {formatPrice(product.original_price)}
          </span>
        )}
        
        <div className="flex items-center gap-2 pt-2">
          <Button
            size="sm"
            className="flex-1 h-9 rounded-xl text-xs"
            onClick={(e) => {
              e.preventDefault();
              onAddToCart();
            }}
          >
            <Plus className="h-4 w-4 mr-1" />
            Savatga
          </Button>
          <Button
            size="icon"
            variant="ghost"
            className={cn(
              "h-9 w-9 rounded-xl glass",
              isFavorite && "text-red-500"
            )}
            onClick={(e) => {
              e.preventDefault();
              onToggleFavorite();
            }}
          >
            <Heart className={cn("h-4 w-4", isFavorite && "fill-current")} />
          </Button>
        </div>
      </div>
    </div>
  );
}

function ProductCardList({
  product,
  onAddToCart,
  onToggleFavorite,
  isFavorite,
  formatPrice,
}: {
  product: Product;
  onAddToCart: () => void;
  onToggleFavorite: () => void;
  isFavorite: boolean;
  formatPrice: (price: number) => string;
}) {
  const discountPercent = product.original_price
    ? Math.round(((product.original_price - product.price) / product.original_price) * 100)
    : 0;

  return (
    <div className="product-card flex gap-4 p-4">
      <Link href={`/products/${product.id}`} className="flex-shrink-0">
        <div className="relative w-24 h-24 sm:w-32 sm:h-32 rounded-2xl overflow-hidden img-zoom">
          <Image
            src={product.image_url || "/placeholder-product.jpg"}
            alt={product.name}
            fill
            className="object-cover"
          />
          {discountPercent > 0 && (
            <span className="absolute top-2 left-2 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
              -{discountPercent}%
            </span>
          )}
        </div>
      </Link>
      
      <div className="flex-1 min-w-0 flex flex-col justify-between">
        <div>
          {product.shop && (
            <p className="text-xs text-muted-foreground truncate">
              {product.shop.name}
            </p>
          )}
          <Link href={`/products/${product.id}`}>
            <h3 className="font-medium text-sm line-clamp-2 hover:text-primary transition-colors">
              {product.name}
            </h3>
          </Link>
          <div className="flex items-center gap-1 mt-1">
            <Star className="h-3 w-3 rating-star fill-current" />
            <span className="text-xs font-medium">{product.rating?.toFixed(1) || "0.0"}</span>
            <span className="text-xs text-muted-foreground">
              ({product.reviews_count || 0})
            </span>
          </div>
        </div>
        
        <div className="flex items-center justify-between mt-2">
          <div>
            <span className="price-tag text-sm">
              {formatPrice(product.price)}
            </span>
            {product.original_price && (
              <span className="text-xs text-muted-foreground line-through ml-2">
                {formatPrice(product.original_price)}
              </span>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              className="h-9 rounded-xl text-xs"
              onClick={onAddToCart}
            >
              <Plus className="h-4 w-4" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              className={cn(
                "h-9 w-9 rounded-xl glass",
                isFavorite && "text-red-500"
              )}
              onClick={onToggleFavorite}
            >
              <Heart className={cn("h-4 w-4", isFavorite && "fill-current")} />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
