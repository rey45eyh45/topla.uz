"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft,
  Heart,
  Star,
  Plus,
  Trash2,
  ShoppingBag,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

interface Product {
  id: string;
  name: string;
  price: number;
  original_price?: number;
  image_url: string;
  rating: number;
  reviews_count: number;
  shop?: {
    name: string;
  };
}

export default function FavoritesPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);

  const supabase = createClient();

  useEffect(() => {
    loadFavorites();
    
    const handleFavoritesUpdate = () => loadFavorites();
    window.addEventListener("favoritesUpdated", handleFavoritesUpdate);
    return () => window.removeEventListener("favoritesUpdated", handleFavoritesUpdate);
  }, []);

  async function loadFavorites() {
    const favorites = JSON.parse(localStorage.getItem("favorites") || "[]");
    setFavoriteIds(favorites);

    if (favorites.length === 0) {
      setProducts([]);
      setLoading(false);
      return;
    }

    try {
      const { data } = await supabase
        .from("products")
        .select(`
          id, name, price, original_price, image_url, rating, reviews_count,
          shop:shops(name)
        `)
        .in("id", favorites)
        .eq("is_active", true);

      // Transform data to handle Supabase join returning array
      const transformedData = (data || []).map((item: any) => ({
        ...item,
        shop: Array.isArray(item.shop) ? item.shop[0] : item.shop,
      })) as Product[];
      setProducts(transformedData);
    } catch (error) {
      console.error("Error loading favorites:", error);
    } finally {
      setLoading(false);
    }
  }

  function removeFavorite(productId: string) {
    const favorites = JSON.parse(localStorage.getItem("favorites") || "[]");
    const index = favorites.indexOf(productId);
    
    if (index >= 0) {
      favorites.splice(index, 1);
      localStorage.setItem("favorites", JSON.stringify(favorites));
      setFavoriteIds(favorites);
      setProducts(products.filter((p) => p.id !== productId));
    }
  }

  function clearAllFavorites() {
    localStorage.setItem("favorites", JSON.stringify([]));
    setFavoriteIds([]);
    setProducts([]);
    window.dispatchEvent(new Event("favoritesUpdated"));
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
      });
    }
    
    localStorage.setItem("cart", JSON.stringify(cart));
    window.dispatchEvent(new Event("cartUpdated"));
  }

  function formatPrice(price: number): string {
    return new Intl.NumberFormat("uz-UZ").format(price) + " so'm";
  }

  if (loading) {
    return (
      <div className="container px-4 sm:px-6">
        <div className="skeleton h-10 w-48 mb-8" />
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 sm:gap-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="skeleton aspect-[3/4] rounded-3xl" />
          ))}
        </div>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="container px-4 sm:px-6">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/">
            <Button variant="ghost" size="icon" className="rounded-full glass">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h1 className="text-2xl sm:text-3xl font-bold">Sevimlilar</h1>
        </div>

        <div className="glass rounded-3xl p-8 sm:p-12 text-center">
          <Heart className="h-20 w-20 mx-auto text-muted-foreground mb-6" />
          <h2 className="text-xl sm:text-2xl font-bold mb-3">
            Sevimlilar ro'yxati bo'sh
          </h2>
          <p className="text-muted-foreground mb-6">
            Yoqtirgan mahsulotlarni ❤️ bosib sevimlilaringizga qo'shing
          </p>
          <Link href="/">
            <Button className="liquid-btn">
              Mahsulotlarni ko'rish
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container px-4 sm:px-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Link href="/">
            <Button variant="ghost" size="icon" className="rounded-full glass">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-3">
            <Heart className="h-7 w-7 text-red-500 fill-current" />
            Sevimlilar ({products.length})
          </h1>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="text-red-500 hover:text-red-600 hover:bg-red-500/10"
          onClick={clearAllFavorites}
        >
          <Trash2 className="h-4 w-4 mr-2" />
          Tozalash
        </Button>
      </div>

      {/* Products grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6 stagger-children">
        {products.map((product, index) => {
          const discountPercent = product.original_price
            ? Math.round(((product.original_price - product.price) / product.original_price) * 100)
            : 0;

          return (
            <div
              key={product.id}
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
                      addToCart(product);
                    }}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Savatga
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-9 w-9 rounded-xl glass text-red-500"
                    onClick={(e) => {
                      e.preventDefault();
                      removeFavorite(product.id);
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
