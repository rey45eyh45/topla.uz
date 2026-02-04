"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft,
  Star,
  Heart,
  Minus,
  Plus,
  ShoppingCart,
  Share2,
  Store,
  Truck,
  Shield,
  RotateCcw,
  ChevronRight,
  MessageCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  original_price?: number;
  image_url: string;
  images?: string[];
  rating: number;
  reviews_count: number;
  shop_id: string;
  shop?: {
    id: string;
    name: string;
    logo_url?: string;
    rating?: number;
  };
  category_id: string;
  category?: {
    id: string;
    name: string;
  };
  stock_quantity: number;
  specifications?: Record<string, string>;
}

interface Review {
  id: string;
  user_id: string;
  rating: number;
  comment: string;
  created_at: string;
  user?: {
    full_name: string;
    avatar_url?: string;
  };
}

interface RelatedProduct {
  id: string;
  name: string;
  price: number;
  original_price?: number;
  image_url: string;
  rating: number;
}

export default function ProductPage() {
  const params = useParams();
  const router = useRouter();
  const productId = params.id as string;

  const [product, setProduct] = useState<Product | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [relatedProducts, setRelatedProducts] = useState<RelatedProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);

  const supabase = createClient();

  useEffect(() => {
    loadProduct();
    checkFavorite();
  }, [productId]);

  async function loadProduct() {
    try {
      // Load product
      const { data: productData, error } = await supabase
        .from("products")
        .select(`
          *,
          shop:shops(id, name, logo_url, rating),
          category:categories(id, name)
        `)
        .eq("id", productId)
        .single();

      if (error) throw error;

      // Load reviews
      const { data: reviewsData } = await supabase
        .from("reviews")
        .select(`
          *,
          user:profiles(full_name, avatar_url)
        `)
        .eq("product_id", productId)
        .order("created_at", { ascending: false })
        .limit(5);

      // Load related products
      const { data: relatedData } = await supabase
        .from("products")
        .select("id, name, price, original_price, image_url, rating")
        .eq("category_id", productData?.category_id)
        .neq("id", productId)
        .eq("is_active", true)
        .limit(6);

      setProduct(productData);
      setReviews(reviewsData || []);
      setRelatedProducts(relatedData || []);
    } catch (error) {
      console.error("Error loading product:", error);
    } finally {
      setLoading(false);
    }
  }

  function checkFavorite() {
    const favorites = JSON.parse(localStorage.getItem("favorites") || "[]");
    setIsFavorite(favorites.includes(productId));
  }

  function toggleFavorite() {
    const favorites = JSON.parse(localStorage.getItem("favorites") || "[]");
    const index = favorites.indexOf(productId);
    
    if (index >= 0) {
      favorites.splice(index, 1);
      setIsFavorite(false);
    } else {
      favorites.push(productId);
      setIsFavorite(true);
    }
    
    localStorage.setItem("favorites", JSON.stringify(favorites));
    window.dispatchEvent(new Event("favoritesUpdated"));
  }

  function addToCart() {
    if (!product) return;
    
    const cart = JSON.parse(localStorage.getItem("cart") || "[]");
    const existingIndex = cart.findIndex((item: any) => item.id === product.id);
    
    if (existingIndex >= 0) {
      cart[existingIndex].quantity += quantity;
    } else {
      cart.push({
        id: product.id,
        name: product.name,
        price: product.price,
        original_price: product.original_price,
        image_url: product.image_url,
        quantity: quantity,
        shop_id: product.shop_id,
        shop_name: product.shop?.name,
      });
    }
    
    localStorage.setItem("cart", JSON.stringify(cart));
    window.dispatchEvent(new Event("cartUpdated"));
  }

  function buyNow() {
    addToCart();
    router.push("/cart");
  }

  function formatPrice(price: number): string {
    return new Intl.NumberFormat("uz-UZ").format(price) + " so'm";
  }

  function shareProduct() {
    if (navigator.share) {
      navigator.share({
        title: product?.name,
        text: product?.description,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert("Havola nusxalandi!");
    }
  }

  if (loading) {
    return (
      <div className="container px-4 sm:px-6">
        <div className="grid md:grid-cols-2 gap-8">
          <div className="skeleton aspect-square rounded-3xl" />
          <div className="space-y-4">
            <div className="skeleton h-8 w-3/4" />
            <div className="skeleton h-6 w-1/2" />
            <div className="skeleton h-12 w-40" />
            <div className="skeleton h-24 w-full" />
            <div className="skeleton h-12 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container px-4 sm:px-6 text-center py-20">
        <h2 className="text-2xl font-bold mb-4">Mahsulot topilmadi</h2>
        <Link href="/">
          <Button>Bosh sahifaga qaytish</Button>
        </Link>
      </div>
    );
  }

  const images = product.images?.length ? product.images : [product.image_url];
  const discountPercent = product.original_price
    ? Math.round(((product.original_price - product.price) / product.original_price) * 100)
    : 0;

  return (
    <div className="container px-4 sm:px-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
        <Link href="/" className="hover:text-primary">Bosh sahifa</Link>
        <ChevronRight className="h-4 w-4" />
        {product.category && (
          <>
            <Link href={`/categories/${product.category.id}`} className="hover:text-primary">
              {product.category.name}
            </Link>
            <ChevronRight className="h-4 w-4" />
          </>
        )}
        <span className="text-foreground truncate">{product.name}</span>
      </div>

      <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
        {/* Images */}
        <div className="space-y-4">
          <div className="relative aspect-square rounded-3xl overflow-hidden glass">
            <Image
              src={images[selectedImage] || "/placeholder-product.jpg"}
              alt={product.name}
              fill
              className="object-contain p-4"
            />
            {discountPercent > 0 && (
              <span className="discount-badge">-{discountPercent}%</span>
            )}
            <div className="absolute top-4 right-4 flex flex-col gap-2">
              <Button
                size="icon"
                variant="ghost"
                className={cn(
                  "h-12 w-12 rounded-full glass",
                  isFavorite && "text-red-500"
                )}
                onClick={toggleFavorite}
              >
                <Heart className={cn("h-6 w-6", isFavorite && "fill-current")} />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                className="h-12 w-12 rounded-full glass"
                onClick={shareProduct}
              >
                <Share2 className="h-6 w-6" />
              </Button>
            </div>
          </div>
          
          {/* Thumbnails */}
          {images.length > 1 && (
            <div className="flex gap-3 overflow-x-auto no-scrollbar">
              {images.map((img, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={cn(
                    "relative w-20 h-20 flex-shrink-0 rounded-xl overflow-hidden border-2 transition-all",
                    selectedImage === index
                      ? "border-primary"
                      : "border-transparent glass"
                  )}
                >
                  <Image
                    src={img}
                    alt={`${product.name} ${index + 1}`}
                    fill
                    className="object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="space-y-6">
          {/* Shop */}
          {product.shop && (
            <Link
              href={`/shops/${product.shop.id}`}
              className="inline-flex items-center gap-3 glass rounded-full py-2 px-4 hover-spring"
            >
              {product.shop.logo_url ? (
                <Image
                  src={product.shop.logo_url}
                  alt={product.shop.name}
                  width={32}
                  height={32}
                  className="rounded-full"
                />
              ) : (
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <Store className="h-4 w-4 text-primary" />
                </div>
              )}
              <span className="font-medium">{product.shop.name}</span>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </Link>
          )}

          {/* Title & Rating */}
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold mb-2">{product.name}</h1>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={cn(
                      "h-5 w-5",
                      i < Math.round(product.rating || 0)
                        ? "rating-star fill-current"
                        : "text-muted"
                    )}
                  />
                ))}
                <span className="ml-2 font-semibold">{product.rating?.toFixed(1) || "0.0"}</span>
              </div>
              <span className="text-muted-foreground">
                {product.reviews_count || 0} ta sharh
              </span>
            </div>
          </div>

          {/* Price */}
          <div className="flex items-end gap-4">
            <span className="text-3xl sm:text-4xl font-bold text-green-600">
              {formatPrice(product.price)}
            </span>
            {product.original_price && (
              <span className="text-xl text-muted-foreground line-through">
                {formatPrice(product.original_price)}
              </span>
            )}
            {discountPercent > 0 && (
              <span className="px-3 py-1 bg-red-500/10 text-red-500 font-semibold rounded-full">
                -{discountPercent}%
              </span>
            )}
          </div>

          {/* Quantity */}
          <div className="flex items-center gap-4">
            <span className="font-medium">Miqdori:</span>
            <div className="qty-glass">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                disabled={quantity <= 1}
              >
                <Minus className="h-4 w-4" />
              </button>
              <span className="w-12 text-center font-semibold">{quantity}</span>
              <button
                onClick={() => setQuantity(quantity + 1)}
                disabled={quantity >= (product.stock_quantity || 99)}
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
            <span className="text-sm text-muted-foreground">
              {product.stock_quantity || 0} ta mavjud
            </span>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Button
              size="lg"
              variant="outline"
              className="flex-1 h-14 rounded-2xl glass text-lg"
              onClick={addToCart}
            >
              <ShoppingCart className="h-5 w-5 mr-2" />
              Savatga
            </Button>
            <Button
              size="lg"
              className="flex-1 h-14 rounded-2xl liquid-btn text-lg"
              onClick={buyNow}
            >
              Sotib olish
            </Button>
          </div>

          {/* Features */}
          <div className="grid grid-cols-3 gap-4">
            <div className="glass rounded-2xl p-4 text-center">
              <Truck className="h-6 w-6 mx-auto text-primary mb-2" />
              <p className="text-xs font-medium">Bepul yetkazish</p>
            </div>
            <div className="glass rounded-2xl p-4 text-center">
              <Shield className="h-6 w-6 mx-auto text-primary mb-2" />
              <p className="text-xs font-medium">Kafolat</p>
            </div>
            <div className="glass rounded-2xl p-4 text-center">
              <RotateCcw className="h-6 w-6 mx-auto text-primary mb-2" />
              <p className="text-xs font-medium">14 kun qaytarish</p>
            </div>
          </div>

          {/* Description */}
          <div className="glass rounded-2xl p-6">
            <h3 className="font-semibold mb-3">Tavsif</h3>
            <p className="text-muted-foreground whitespace-pre-wrap">
              {product.description || "Tavsif mavjud emas"}
            </p>
          </div>

          {/* Specifications */}
          {product.specifications && Object.keys(product.specifications).length > 0 && (
            <div className="glass rounded-2xl p-6">
              <h3 className="font-semibold mb-3">Xususiyatlari</h3>
              <div className="space-y-2">
                {Object.entries(product.specifications).map(([key, value]) => (
                  <div key={key} className="flex justify-between py-2 border-b border-border/50 last:border-0">
                    <span className="text-muted-foreground">{key}</span>
                    <span className="font-medium">{value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Reviews */}
      <section className="mt-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl sm:text-2xl font-bold flex items-center gap-2">
            <MessageCircle className="h-6 w-6 text-primary" />
            Sharhlar ({product.reviews_count || 0})
          </h2>
          <Button variant="outline" className="glass rounded-full">
            Sharh qoldirish
          </Button>
        </div>

        {reviews.length === 0 ? (
          <div className="glass rounded-2xl p-8 text-center">
            <p className="text-muted-foreground">Hali sharhlar yo'q</p>
          </div>
        ) : (
          <div className="space-y-4">
            {reviews.map((review) => (
              <div key={review.id} className="glass rounded-2xl p-6">
                <div className="flex items-start gap-4">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                    {review.user?.avatar_url ? (
                      <Image
                        src={review.user.avatar_url}
                        alt=""
                        width={40}
                        height={40}
                        className="rounded-full"
                      />
                    ) : (
                      <span className="text-primary font-semibold">
                        {review.user?.full_name?.charAt(0) || "U"}
                      </span>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold">{review.user?.full_name || "Foydalanuvchi"}</span>
                      <span className="text-sm text-muted-foreground">
                        {new Date(review.created_at).toLocaleDateString("uz-UZ")}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 my-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={cn(
                            "h-4 w-4",
                            i < review.rating
                              ? "rating-star fill-current"
                              : "text-muted"
                          )}
                        />
                      ))}
                    </div>
                    <p className="text-muted-foreground">{review.comment}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <section className="mt-12">
          <h2 className="text-xl sm:text-2xl font-bold mb-6">O'xshash mahsulotlar</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {relatedProducts.map((item) => (
              <Link key={item.id} href={`/products/${item.id}`}>
                <div className="product-card overflow-hidden hover-spring">
                  <div className="relative aspect-square">
                    <Image
                      src={item.image_url || "/placeholder-product.jpg"}
                      alt={item.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="p-3">
                    <h3 className="font-medium text-sm line-clamp-2">{item.name}</h3>
                    <div className="flex items-center gap-1 mt-1">
                      <Star className="h-3 w-3 rating-star fill-current" />
                      <span className="text-xs">{item.rating?.toFixed(1) || "0.0"}</span>
                    </div>
                    <p className="font-semibold text-green-600 mt-1">
                      {formatPrice(item.price)}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
