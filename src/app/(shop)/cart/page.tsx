"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Minus,
  Plus,
  Trash2,
  ShoppingBag,
  Store,
  Truck,
  Tag,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface CartItem {
  id: string;
  name: string;
  price: number;
  original_price?: number;
  image_url: string;
  quantity: number;
  shop_id: string;
  shop_name?: string;
}

export default function CartPage() {
  const router = useRouter();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [promoCode, setPromoCode] = useState("");
  const [promoDiscount, setPromoDiscount] = useState(0);
  const [promoError, setPromoError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCart();
    
    const handleCartUpdate = () => loadCart();
    window.addEventListener("cartUpdated", handleCartUpdate);
    return () => window.removeEventListener("cartUpdated", handleCartUpdate);
  }, []);

  function loadCart() {
    const cart = JSON.parse(localStorage.getItem("cart") || "[]");
    setCartItems(cart);
    setLoading(false);
  }

  function updateQuantity(id: string, quantity: number) {
    if (quantity < 1) return;
    
    const updatedCart = cartItems.map((item) =>
      item.id === id ? { ...item, quantity } : item
    );
    setCartItems(updatedCart);
    localStorage.setItem("cart", JSON.stringify(updatedCart));
    window.dispatchEvent(new Event("cartUpdated"));
  }

  function removeItem(id: string) {
    const updatedCart = cartItems.filter((item) => item.id !== id);
    setCartItems(updatedCart);
    localStorage.setItem("cart", JSON.stringify(updatedCart));
    window.dispatchEvent(new Event("cartUpdated"));
  }

  function clearCart() {
    setCartItems([]);
    localStorage.setItem("cart", JSON.stringify([]));
    window.dispatchEvent(new Event("cartUpdated"));
  }

  function applyPromoCode() {
    if (!promoCode.trim()) return;
    
    // Simple promo code validation - in real app, validate with backend
    if (promoCode.toUpperCase() === "TOPLA10") {
      setPromoDiscount(10);
      setPromoError("");
    } else if (promoCode.toUpperCase() === "TOPLA20") {
      setPromoDiscount(20);
      setPromoError("");
    } else {
      setPromoDiscount(0);
      setPromoError("Noto'g'ri promo kod");
    }
  }

  function formatPrice(price: number): string {
    return new Intl.NumberFormat("uz-UZ").format(price) + " so'm";
  }

  // Group items by shop
  const groupedItems = cartItems.reduce((acc, item) => {
    const shopId = item.shop_id || "other";
    if (!acc[shopId]) {
      acc[shopId] = {
        shop_name: item.shop_name || "Boshqa",
        items: [],
      };
    }
    acc[shopId].items.push(item);
    return acc;
  }, {} as Record<string, { shop_name: string; items: CartItem[] }>);

  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const deliveryFee = subtotal >= 100000 ? 0 : 15000;
  const promoDiscountAmount = (subtotal * promoDiscount) / 100;
  const total = subtotal - promoDiscountAmount + deliveryFee;

  if (loading) {
    return (
      <div className="container px-4 sm:px-6">
        <div className="skeleton h-10 w-32 mb-6" />
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="skeleton h-32 rounded-3xl" />
            ))}
          </div>
          <div className="skeleton h-80 rounded-3xl" />
        </div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="container px-4 sm:px-6">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/">
            <Button variant="ghost" size="icon" className="rounded-full glass">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h1 className="text-2xl sm:text-3xl font-bold">Savat</h1>
        </div>

        <div className="glass rounded-3xl p-8 sm:p-12 text-center">
          <ShoppingBag className="h-20 w-20 mx-auto text-muted-foreground mb-6" />
          <h2 className="text-xl sm:text-2xl font-bold mb-3">
            Savatingiz bo'sh
          </h2>
          <p className="text-muted-foreground mb-6">
            Mahsulotlarni savatga qo'shing va xarid qilishni boshlang
          </p>
          <Link href="/">
            <Button className="liquid-btn">
              Xarid qilishni boshlash
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
          <h1 className="text-2xl sm:text-3xl font-bold">
            Savat ({cartItems.length})
          </h1>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="text-red-500 hover:text-red-600 hover:bg-red-500/10"
          onClick={clearCart}
        >
          <Trash2 className="h-4 w-4 mr-2" />
          Tozalash
        </Button>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-6">
          {Object.entries(groupedItems).map(([shopId, group]) => (
            <div key={shopId} className="glass rounded-3xl overflow-hidden">
              {/* Shop header */}
              <div className="flex items-center gap-3 p-4 border-b border-border/50">
                <Store className="h-5 w-5 text-primary" />
                <span className="font-semibold">{group.shop_name}</span>
              </div>

              {/* Items */}
              <div className="divide-y divide-border/50">
                {group.items.map((item) => (
                  <div
                    key={item.id}
                    className="flex gap-4 p-4 hover:bg-primary/5 transition-colors"
                  >
                    <Link href={`/products/${item.id}`} className="flex-shrink-0">
                      <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden">
                        <Image
                          src={item.image_url || "/placeholder-product.jpg"}
                          alt={item.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                    </Link>

                    <div className="flex-1 min-w-0">
                      <Link href={`/products/${item.id}`}>
                        <h3 className="font-medium text-sm sm:text-base line-clamp-2 hover:text-primary transition-colors">
                          {item.name}
                        </h3>
                      </Link>
                      
                      <div className="flex items-center gap-2 mt-1">
                        <span className="font-semibold text-green-600">
                          {formatPrice(item.price)}
                        </span>
                        {item.original_price && (
                          <span className="text-xs text-muted-foreground line-through">
                            {formatPrice(item.original_price)}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center justify-between mt-3">
                        <div className="qty-glass">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            disabled={item.quantity <= 1}
                          >
                            <Minus className="h-4 w-4" />
                          </button>
                          <span className="w-8 text-center font-semibold text-sm">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          >
                            <Plus className="h-4 w-4" />
                          </button>
                        </div>

                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-9 w-9 text-red-500 hover:text-red-600 hover:bg-red-500/10 rounded-full"
                          onClick={() => removeItem(item.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="hidden sm:block text-right">
                      <span className="font-semibold text-lg">
                        {formatPrice(item.price * item.quantity)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="glass rounded-3xl p-6 sticky top-28 space-y-6">
            <h2 className="text-lg font-bold">Buyurtma xulosasi</h2>

            {/* Promo code */}
            <div className="space-y-2">
              <div className="flex gap-2">
                <div className="flex-1 relative">
                  <Tag className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Promo kod"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    className="pl-9 rounded-xl h-11 glass"
                  />
                </div>
                <Button
                  variant="outline"
                  className="rounded-xl glass"
                  onClick={applyPromoCode}
                >
                  Qo'llash
                </Button>
              </div>
              {promoError && (
                <p className="text-sm text-red-500">{promoError}</p>
              )}
              {promoDiscount > 0 && (
                <p className="text-sm text-green-600">
                  ✓ {promoDiscount}% chegirma qo'llandi
                </p>
              )}
            </div>

            {/* Summary */}
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Mahsulotlar:</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              {promoDiscount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Chegirma ({promoDiscount}%):</span>
                  <span>-{formatPrice(promoDiscountAmount)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-muted-foreground flex items-center gap-1">
                  <Truck className="h-4 w-4" />
                  Yetkazib berish:
                </span>
                <span className={cn(deliveryFee === 0 && "text-green-600")}>
                  {deliveryFee === 0 ? "Bepul" : formatPrice(deliveryFee)}
                </span>
              </div>
              {deliveryFee > 0 && (
                <p className="text-xs text-muted-foreground">
                  {formatPrice(100000 - subtotal)} so'mdan ortiq xarid qilsangiz yetkazib berish bepul
                </p>
              )}
              <div className="border-t border-border/50 pt-3 flex justify-between text-lg font-bold">
                <span>Jami:</span>
                <span className="text-green-600">{formatPrice(total)}</span>
              </div>
            </div>

            {/* Checkout button */}
            <Link href="/checkout" className="block">
              <Button className="w-full h-14 rounded-2xl liquid-btn text-lg">
                Buyurtma berish
                <ChevronRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>

            {/* Continue shopping */}
            <Link href="/" className="block">
              <Button variant="ghost" className="w-full rounded-xl">
                Xaridni davom ettirish
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
