"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import {
  ShoppingBag,
  Search,
  ShoppingCart,
  User,
  Home,
  Grid3X3,
  Heart,
  Menu,
  X,
  MapPin,
  ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function ShopLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [cartCount, setCartCount] = useState(0);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Get cart count from localStorage
  useEffect(() => {
    const cart = JSON.parse(localStorage.getItem("cart") || "[]");
    setCartCount(cart.reduce((acc: number, item: any) => acc + item.quantity, 0));
    
    // Listen for cart updates
    const handleStorageChange = () => {
      const updatedCart = JSON.parse(localStorage.getItem("cart") || "[]");
      setCartCount(updatedCart.reduce((acc: number, item: any) => acc + item.quantity, 0));
    };
    
    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("cartUpdated", handleStorageChange);
    
    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("cartUpdated", handleStorageChange);
    };
  }, []);

  const navItems = [
    { href: "/", icon: Home, label: "Bosh sahifa" },
    { href: "/categories", icon: Grid3X3, label: "Kategoriyalar" },
    { href: "/favorites", icon: Heart, label: "Sevimlilar" },
    { href: "/cart", icon: ShoppingCart, label: "Savat" },
    { href: "/profile", icon: User, label: "Profil" },
  ];

  return (
    <div className="min-h-screen gradient-bg relative overflow-hidden">
      {/* Animated background blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="blob blob-1" />
        <div className="blob blob-2" />
        <div className="blob blob-3" />
      </div>

      {/* Header */}
      <header
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
          scrolled ? "glass-nav shadow-lg" : "bg-transparent"
        )}
      >
        <div className="container px-4 sm:px-6">
          <div className="flex items-center justify-between h-16 sm:h-20">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 sm:gap-3">
              <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-2xl bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center shadow-lg shadow-primary/30">
                <ShoppingBag className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
              </div>
              <div className="hidden sm:block">
                <span className="text-xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                  TOPLA.UZ
                </span>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <MapPin className="h-3 w-3" />
                  <span>Toshkent</span>
                  <ChevronDown className="h-3 w-3" />
                </div>
              </div>
            </Link>

            {/* Search - Desktop */}
            <div className="hidden md:flex flex-1 max-w-xl mx-8">
              <div className="search-glass w-full flex items-center px-5 py-3">
                <Search className="h-5 w-5 text-muted-foreground mr-3" />
                <input
                  type="text"
                  placeholder="Mahsulot, kategoriya yoki do'kon qidiring..."
                  className="flex-1 bg-transparent outline-none text-sm"
                />
              </div>
            </div>

            {/* Right actions */}
            <div className="flex items-center gap-2 sm:gap-4">
              {/* Search - Mobile */}
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden h-10 w-10 rounded-full glass"
              >
                <Search className="h-5 w-5" />
              </Button>

              {/* Cart */}
              <Link href="/cart" className="relative">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-10 w-10 sm:h-12 sm:w-12 rounded-full glass"
                >
                  <ShoppingCart className="h-5 w-5 sm:h-6 sm:w-6" />
                </Button>
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 h-5 w-5 sm:h-6 sm:w-6 rounded-full bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs font-bold flex items-center justify-center pulse-dot">
                    {cartCount > 99 ? "99+" : cartCount}
                  </span>
                )}
              </Link>

              {/* Profile - Desktop */}
              <Link href="/profile" className="hidden sm:block">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-10 w-10 sm:h-12 sm:w-12 rounded-full glass"
                >
                  <User className="h-5 w-5 sm:h-6 sm:w-6" />
                </Button>
              </Link>

              {/* Menu - Mobile */}
              <Button
                variant="ghost"
                size="icon"
                className="sm:hidden h-10 w-10 rounded-full glass"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="sm:hidden glass border-t animate-in slide-in-from-top">
            <nav className="container px-4 py-4 space-y-2">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsMenuOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-xl transition-all",
                    pathname === item.href
                      ? "bg-primary text-white"
                      : "hover:bg-primary/10"
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  <span className="font-medium">{item.label}</span>
                </Link>
              ))}
            </nav>
          </div>
        )}
      </header>

      {/* Main content */}
      <main className="relative z-10 pt-20 sm:pt-24 pb-24 sm:pb-8">
        {children}
      </main>

      {/* Bottom navigation - Mobile */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 sm:hidden bottom-nav-glass">
        <div className="flex items-center justify-around py-2 px-4">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex flex-col items-center gap-1 py-2 px-3 rounded-xl transition-all",
                  isActive
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <div
                  className={cn(
                    "relative p-2 rounded-xl transition-all",
                    isActive && "bg-primary/10"
                  )}
                >
                  <item.icon className={cn("h-5 w-5", isActive && "scale-110")} />
                  {item.label === "Savat" && cartCount > 0 && (
                    <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-gradient-to-r from-red-500 to-pink-500 text-white text-[10px] font-bold flex items-center justify-center">
                      {cartCount > 9 ? "9+" : cartCount}
                    </span>
                  )}
                </div>
                <span className={cn("text-[10px] font-medium", isActive && "font-bold")}>
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Floating cart button - Desktop */}
      {cartCount > 0 && (
        <Link
          href="/cart"
          className="hidden sm:flex fixed bottom-8 right-8 z-50 cart-float h-16 w-16 rounded-full items-center justify-center"
        >
          <ShoppingCart className="h-7 w-7 text-white" />
          <span className="absolute -top-2 -right-2 h-7 w-7 rounded-full bg-white text-primary text-sm font-bold flex items-center justify-center shadow-lg">
            {cartCount > 99 ? "99+" : cartCount}
          </span>
        </Link>
      )}
    </div>
  );
}
