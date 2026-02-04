"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  Search,
  X,
  Star,
  Heart,
  Plus,
  Clock,
  TrendingUp,
  ArrowLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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

function SearchContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialQuery = searchParams.get("q") || "";

  const [query, setQuery] = useState(initialQuery);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [popularSearches] = useState([
    "Telefon",
    "Noutbuk",
    "Kiyim",
    "Oziq-ovqat",
    "Texnika",
    "Kosmetika",
    "Sport",
    "Kitoblar",
  ]);

  const supabase = createClient();

  useEffect(() => {
    // Load search history
    const history = JSON.parse(localStorage.getItem("searchHistory") || "[]");
    setSearchHistory(history);
  }, []);

  useEffect(() => {
    if (initialQuery) {
      performSearch(initialQuery);
    }
  }, [initialQuery]);

  const performSearch = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setProducts([]);
      return;
    }

    setLoading(true);
    try {
      const { data } = await supabase
        .from("products")
        .select(`
          id, name, price, original_price, image_url, rating, reviews_count,
          shop:shops(name)
        `)
        .eq("is_active", true)
        .ilike("name", `%${searchQuery}%`)
        .order("rating", { ascending: false })
        .limit(30);

      // Transform data to handle Supabase join returning array
      const transformedData = (data || []).map((item: any) => ({
        ...item,
        shop: Array.isArray(item.shop) ? item.shop[0] : item.shop,
      })) as Product[];
      setProducts(transformedData);

      // Save to history
      const history = JSON.parse(localStorage.getItem("searchHistory") || "[]");
      const newHistory = [searchQuery, ...history.filter((h: string) => h !== searchQuery)].slice(0, 10);
      localStorage.setItem("searchHistory", JSON.stringify(newHistory));
      setSearchHistory(newHistory);
    } catch (error) {
      console.error("Error searching:", error);
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
      performSearch(query.trim());
    }
  }

  function handleQuickSearch(term: string) {
    setQuery(term);
    router.push(`/search?q=${encodeURIComponent(term)}`);
    performSearch(term);
  }

  function clearHistory() {
    localStorage.setItem("searchHistory", JSON.stringify([]));
    setSearchHistory([]);
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

  return (
    <div className="container px-4 sm:px-6">
      {/* Search header */}
      <div className="flex items-center gap-4 mb-6">
        <Link href="/">
          <Button variant="ghost" size="icon" className="rounded-full glass">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <form onSubmit={handleSearch} className="flex-1">
          <div className="search-glass flex items-center px-4 py-3">
            <Search className="h-5 w-5 text-muted-foreground mr-3" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Qidirish..."
              className="flex-1 bg-transparent outline-none"
              autoFocus
            />
            {query && (
              <button
                type="button"
                onClick={() => {
                  setQuery("");
                  setProducts([]);
                }}
                className="p-1 hover:bg-primary/10 rounded-full"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Search results */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 sm:gap-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="skeleton aspect-[3/4] rounded-3xl" />
          ))}
        </div>
      ) : products.length > 0 ? (
        <div>
          <p className="text-sm text-muted-foreground mb-4">
            "{initialQuery}" bo'yicha {products.length} ta natija
          </p>
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
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <span className="price-tag text-sm">
                        {formatPrice(product.price)}
                      </span>
                    </div>
                    
                    <Button
                      size="sm"
                      className="w-full h-9 rounded-xl text-xs"
                      onClick={(e) => {
                        e.preventDefault();
                        addToCart(product);
                      }}
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Savatga
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : initialQuery ? (
        <div className="text-center py-20">
          <Search className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <h2 className="text-xl font-bold mb-2">Hech narsa topilmadi</h2>
          <p className="text-muted-foreground">
            "{initialQuery}" bo'yicha natija topilmadi. Boshqa so'zlarni sinab ko'ring.
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Search history */}
          {searchHistory.length > 0 && (
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold flex items-center gap-2">
                  <Clock className="h-5 w-5 text-muted-foreground" />
                  So'nggi qidiruvlar
                </h2>
                <button
                  onClick={clearHistory}
                  className="text-sm text-primary hover:underline"
                >
                  Tozalash
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {searchHistory.map((term, index) => (
                  <button
                    key={index}
                    onClick={() => handleQuickSearch(term)}
                    className="category-pill text-sm"
                  >
                    {term}
                  </button>
                ))}
              </div>
            </section>
          )}

          {/* Popular searches */}
          <section>
            <h2 className="font-semibold flex items-center gap-2 mb-4">
              <TrendingUp className="h-5 w-5 text-primary" />
              Ommabop qidiruvlar
            </h2>
            <div className="flex flex-wrap gap-2">
              {popularSearches.map((term, index) => (
                <button
                  key={index}
                  onClick={() => handleQuickSearch(term)}
                  className="category-pill text-sm hover:bg-primary hover:text-white"
                >
                  {term}
                </button>
              ))}
            </div>
          </section>
        </div>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="container px-4 sm:px-6">
        <div className="skeleton h-14 rounded-full mb-6" />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="skeleton aspect-[3/4] rounded-3xl" />
          ))}
        </div>
      </div>
    }>
      <SearchContent />
    </Suspense>
  );
}
