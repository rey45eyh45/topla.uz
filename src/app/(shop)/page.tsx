"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ChevronRight,
  Star,
  Heart,
  Plus,
  Minus,
  Clock,
  Percent,
  Flame,
  Sparkles,
  TrendingUp,
  Store,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

interface Category {
  id: string;
  name: string;
  icon: string;
  image_url?: string;
  product_count?: number;
}

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  original_price?: number;
  image_url: string;
  rating: number;
  reviews_count: number;
  shop_id: string;
  shop?: {
    name: string;
    logo_url?: string;
  };
  category_id: string;
  is_featured?: boolean;
  discount_percent?: number;
}

interface Banner {
  id: string;
  title: string;
  subtitle?: string;
  image_url: string;
  link_url?: string;
  background_color?: string;
}

export default function ShopHomePage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [newProducts, setNewProducts] = useState<Product[]>([]);
  const [discountProducts, setDiscountProducts] = useState<Product[]>([]);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeBanner, setActiveBanner] = useState(0);

  const supabase = createClient();

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (banners.length > 1) {
      const interval = setInterval(() => {
        setActiveBanner((prev) => (prev + 1) % banners.length);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [banners.length]);

  async function loadData() {
    try {
      // Load categories
      const { data: categoriesData } = await supabase
        .from("categories")
        .select("*")
        .eq("is_active", true)
        .order("order_index");

      // Load featured products
      const { data: featuredData } = await supabase
        .from("products")
        .select(`
          *,
          shop:shops(name, logo_url)
        `)
        .eq("is_active", true)
        .eq("is_featured", true)
        .limit(10);

      // Load new products
      const { data: newData } = await supabase
        .from("products")
        .select(`
          *,
          shop:shops(name, logo_url)
        `)
        .eq("is_active", true)
        .order("created_at", { ascending: false })
        .limit(10);

      // Load discount products
      const { data: discountData } = await supabase
        .from("products")
        .select(`
          *,
          shop:shops(name, logo_url)
        `)
        .eq("is_active", true)
        .not("original_price", "is", null)
        .order("created_at", { ascending: false })
        .limit(10);

      // Load banners
      const { data: bannersData } = await supabase
        .from("banners")
        .select("*")
        .eq("is_active", true)
        .lte("start_date", new Date().toISOString())
        .or(`end_date.is.null,end_date.gte.${new Date().toISOString()}`)
        .order("position");

      setCategories(categoriesData || []);
      setFeaturedProducts(featuredData || []);
      setNewProducts(newData || []);
      setDiscountProducts(discountData || []);
      setBanners(bannersData || []);
    } catch (error) {
      console.error("Error loading data:", error);
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
    window.dispatchEvent(new Event("favoritesUpdated"));
  }

  function isFavorite(productId: string): boolean {
    if (typeof window === "undefined") return false;
    const favorites = JSON.parse(localStorage.getItem("favorites") || "[]");
    return favorites.includes(productId);
  }

  function formatPrice(price: number): string {
    return new Intl.NumberFormat("uz-UZ").format(price) + " so'm";
  }

  if (loading) {
    return <LoadingSkeleton />;
  }

  return (
    <div className="container px-4 sm:px-6 space-y-8 sm:space-y-12">
      {/* Banners */}
      {banners.length > 0 && (
        <section className="relative">
          <div className="relative overflow-hidden rounded-3xl banner-glass">
            {banners.map((banner, index) => (
              <div
                key={banner.id}
                className={cn(
                  "transition-all duration-500 ease-in-out",
                  index === activeBanner
                    ? "opacity-100 translate-x-0"
                    : "opacity-0 absolute inset-0 translate-x-full"
                )}
              >
                <Link href={banner.link_url || "#"}>
                  <div
                    className="flex flex-col md:flex-row items-center gap-6 p-6 sm:p-10"
                    style={{ backgroundColor: banner.background_color || "transparent" }}
                  >
                    <div className="flex-1 space-y-4">
                      <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold">
                        {banner.title}
                      </h2>
                      {banner.subtitle && (
                        <p className="text-muted-foreground text-lg">
                          {banner.subtitle}
                        </p>
                      )}
                      <Button className="liquid-btn">
                        Batafsil
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </div>
                    {banner.image_url && (
                      <div className="relative w-full md:w-1/2 aspect-[16/9] md:aspect-square max-w-sm">
                        <Image
                          src={banner.image_url}
                          alt={banner.title}
                          fill
                          className="object-contain"
                        />
                      </div>
                    )}
                  </div>
                </Link>
              </div>
            ))}
          </div>
          {/* Banner indicators */}
          {banners.length > 1 && (
            <div className="flex justify-center gap-2 mt-4">
              {banners.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setActiveBanner(index)}
                  className={cn(
                    "h-2 rounded-full transition-all",
                    index === activeBanner
                      ? "w-8 bg-primary"
                      : "w-2 bg-primary/30 hover:bg-primary/50"
                  )}
                />
              ))}
            </div>
          )}
        </section>
      )}

      {/* Categories */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl sm:text-2xl font-bold flex items-center gap-2">
            <Grid3X3Icon className="h-6 w-6 text-primary" />
            Kategoriyalar
          </h2>
          <Link
            href="/categories"
            className="text-primary text-sm font-medium flex items-center gap-1 hover:gap-2 transition-all"
          >
            Barchasi
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 gap-3 sm:gap-4">
          {categories.slice(0, 8).map((category, index) => (
            <Link
              key={category.id}
              href={`/categories/${category.id}`}
              className="fade-up"
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <div className="category-pill flex flex-col items-center gap-2 p-3 sm:p-4 hover-spring">
                <div className="text-2xl sm:text-3xl">{category.icon}</div>
                <span className="text-xs sm:text-sm font-medium text-center line-clamp-2">
                  {category.name}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Flash Sale */}
      {discountProducts.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl sm:text-2xl font-bold flex items-center gap-2">
              <Flame className="h-6 w-6 text-red-500 animate-pulse" />
              Chegirmalar
              <span className="ml-2 px-3 py-1 bg-red-500/10 text-red-500 text-sm rounded-full flex items-center gap-1">
                <Clock className="h-3 w-3" />
                12:34:56
              </span>
            </h2>
            <Link
              href="/sale"
              className="text-red-500 text-sm font-medium flex items-center gap-1 hover:gap-2 transition-all"
            >
              Barchasi
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="flex overflow-x-auto gap-4 pb-4 no-scrollbar snap-x">
            {discountProducts.map((product, index) => (
              <ProductCard
                key={product.id}
                product={product}
                onAddToCart={() => addToCart(product)}
                onToggleFavorite={() => toggleFavorite(product.id)}
                isFavorite={isFavorite(product.id)}
                formatPrice={formatPrice}
                index={index}
                showDiscount
              />
            ))}
          </div>
        </section>
      )}

      {/* Featured Products */}
      {featuredProducts.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl sm:text-2xl font-bold flex items-center gap-2">
              <Sparkles className="h-6 w-6 text-yellow-500" />
              Mashhur mahsulotlar
            </h2>
            <Link
              href="/featured"
              className="text-primary text-sm font-medium flex items-center gap-1 hover:gap-2 transition-all"
            >
              Barchasi
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6 stagger-children">
            {featuredProducts.map((product, index) => (
              <ProductCard
                key={product.id}
                product={product}
                onAddToCart={() => addToCart(product)}
                onToggleFavorite={() => toggleFavorite(product.id)}
                isFavorite={isFavorite(product.id)}
                formatPrice={formatPrice}
                index={index}
              />
            ))}
          </div>
        </section>
      )}

      {/* New Products */}
      {newProducts.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl sm:text-2xl font-bold flex items-center gap-2">
              <TrendingUp className="h-6 w-6 text-green-500" />
              Yangi mahsulotlar
            </h2>
            <Link
              href="/new"
              className="text-primary text-sm font-medium flex items-center gap-1 hover:gap-2 transition-all"
            >
              Barchasi
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6 stagger-children">
            {newProducts.map((product, index) => (
              <ProductCard
                key={product.id}
                product={product}
                onAddToCart={() => addToCart(product)}
                onToggleFavorite={() => toggleFavorite(product.id)}
                isFavorite={isFavorite(product.id)}
                formatPrice={formatPrice}
                index={index}
                showNew
              />
            ))}
          </div>
        </section>
      )}

      {/* Become a vendor CTA */}
      <section className="glass rounded-3xl p-8 sm:p-12 text-center">
        <Store className="h-16 w-16 mx-auto text-primary mb-6" />
        <h2 className="text-2xl sm:text-3xl font-bold mb-4">
          Siz ham sotuvchi bo'ling!
        </h2>
        <p className="text-muted-foreground max-w-md mx-auto mb-6">
          O'z do'koningizni oching va millionlab mijozlarga mahsulotlaringizni yetkazing
        </p>
        <Link href="/vendor/register">
          <Button className="liquid-btn">
            Bepul boshlash
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </Link>
      </section>
    </div>
  );
}

// Product Card Component
function ProductCard({
  product,
  onAddToCart,
  onToggleFavorite,
  isFavorite,
  formatPrice,
  index,
  showDiscount,
  showNew,
}: {
  product: Product;
  onAddToCart: () => void;
  onToggleFavorite: () => void;
  isFavorite: boolean;
  formatPrice: (price: number) => string;
  index: number;
  showDiscount?: boolean;
  showNew?: boolean;
}) {
  const discountPercent = product.original_price
    ? Math.round(((product.original_price - product.price) / product.original_price) * 100)
    : 0;

  return (
    <div
      className="product-card flex-shrink-0 w-[160px] sm:w-auto snap-start overflow-hidden"
      style={{ animationDelay: `${index * 0.1}s` }}
    >
      <Link href={`/products/${product.id}`}>
        <div className="relative aspect-square img-zoom">
          <Image
            src={product.image_url || "/placeholder-product.jpg"}
            alt={product.name}
            fill
            className="object-cover"
          />
          {showDiscount && discountPercent > 0 && (
            <span className="discount-badge">-{discountPercent}%</span>
          )}
          {showNew && (
            <span className="absolute top-3 left-3 bg-green-500 text-white text-xs font-semibold px-2 py-1 rounded-full">
              Yangi
            </span>
          )}
        </div>
      </Link>
      
      <div className="p-4 space-y-2">
        {/* Shop name */}
        {product.shop && (
          <p className="text-xs text-muted-foreground truncate">
            {product.shop.name}
          </p>
        )}
        
        {/* Product name */}
        <Link href={`/products/${product.id}`}>
          <h3 className="font-medium text-sm line-clamp-2 hover:text-primary transition-colors">
            {product.name}
          </h3>
        </Link>
        
        {/* Rating */}
        <div className="flex items-center gap-1">
          <Star className="h-3 w-3 rating-star fill-current" />
          <span className="text-xs font-medium">{product.rating?.toFixed(1) || "0.0"}</span>
          <span className="text-xs text-muted-foreground">
            ({product.reviews_count || 0})
          </span>
        </div>
        
        {/* Price */}
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
        
        {/* Actions */}
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

// Grid icon component
function Grid3X3Icon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
    </svg>
  );
}

// Loading skeleton
function LoadingSkeleton() {
  return (
    <div className="container px-4 sm:px-6 space-y-8 sm:space-y-12">
      {/* Banner skeleton */}
      <div className="skeleton h-48 sm:h-64 rounded-3xl" />
      
      {/* Categories skeleton */}
      <div className="space-y-4">
        <div className="skeleton h-8 w-48" />
        <div className="grid grid-cols-4 sm:grid-cols-8 gap-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="skeleton h-20 rounded-2xl" />
          ))}
        </div>
      </div>
      
      {/* Products skeleton */}
      <div className="space-y-4">
        <div className="skeleton h-8 w-48" />
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-4">
          {[...Array(10)].map((_, i) => (
            <div key={i} className="space-y-3">
              <div className="skeleton aspect-square rounded-2xl" />
              <div className="skeleton h-4 w-3/4" />
              <div className="skeleton h-4 w-1/2" />
              <div className="skeleton h-8 rounded-xl" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
