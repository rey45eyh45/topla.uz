"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  User,
  Package,
  Heart,
  MapPin,
  Settings,
  LogOut,
  ChevronRight,
  Phone,
  Mail,
  Edit,
  ShoppingBag,
  Clock,
  CheckCircle,
  Truck,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  phone?: string;
  avatar_url?: string;
}

interface Order {
  id: string;
  order_number: string;
  status: "pending" | "confirmed" | "preparing" | "delivering" | "delivered" | "cancelled";
  total_amount: number;
  created_at: string;
  items_count?: number;
}

const statusConfig = {
  pending: { label: "Kutilmoqda", icon: Clock, color: "text-yellow-500", bg: "bg-yellow-500/10" },
  confirmed: { label: "Tasdiqlangan", icon: CheckCircle, color: "text-blue-500", bg: "bg-blue-500/10" },
  preparing: { label: "Tayyorlanmoqda", icon: Package, color: "text-purple-500", bg: "bg-purple-500/10" },
  delivering: { label: "Yetkazilmoqda", icon: Truck, color: "text-orange-500", bg: "bg-orange-500/10" },
  delivered: { label: "Yetkazildi", icon: CheckCircle, color: "text-green-500", bg: "bg-green-500/10" },
  cancelled: { label: "Bekor qilindi", icon: XCircle, color: "text-red-500", bg: "bg-red-500/10" },
};

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"orders" | "addresses" | "settings">("orders");

  const supabase = createClient();

  useEffect(() => {
    loadProfile();
  }, []);

  async function loadProfile() {
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      
      if (!authUser) {
        // Not logged in - show guest profile
        setUser(null);
        setLoading(false);
        return;
      }

      // Get profile
      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", authUser.id)
        .single();

      // Get orders
      const { data: ordersData } = await supabase
        .from("orders")
        .select("*")
        .eq("user_id", authUser.id)
        .order("created_at", { ascending: false })
        .limit(10);

      setUser({
        id: authUser.id,
        email: authUser.email || "",
        full_name: profile?.full_name || "Foydalanuvchi",
        phone: profile?.phone,
        avatar_url: profile?.avatar_url,
      });
      setOrders(ordersData || []);
    } catch (error) {
      console.error("Error loading profile:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/");
  }

  function formatPrice(price: number): string {
    return new Intl.NumberFormat("uz-UZ").format(price) + " so'm";
  }

  function formatDate(date: string): string {
    return new Date(date).toLocaleDateString("uz-UZ", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  }

  const menuItems = [
    { href: "/profile/orders", icon: Package, label: "Buyurtmalarim", badge: orders.length },
    { href: "/favorites", icon: Heart, label: "Sevimlilar" },
    { href: "/profile/addresses", icon: MapPin, label: "Manzillarim" },
    { href: "/profile/settings", icon: Settings, label: "Sozlamalar" },
  ];

  if (loading) {
    return (
      <div className="container px-4 sm:px-6">
        <div className="skeleton h-40 rounded-3xl mb-6" />
        <div className="skeleton h-12 w-full rounded-xl mb-4" />
        <div className="skeleton h-12 w-full rounded-xl mb-4" />
        <div className="skeleton h-12 w-full rounded-xl" />
      </div>
    );
  }

  // Guest profile
  if (!user) {
    return (
      <div className="container px-4 sm:px-6">
        <h1 className="text-2xl sm:text-3xl font-bold mb-8">Profil</h1>

        <div className="glass rounded-3xl p-8 sm:p-12 text-center">
          <User className="h-20 w-20 mx-auto text-muted-foreground mb-6" />
          <h2 className="text-xl sm:text-2xl font-bold mb-3">
            Tizimga kiring
          </h2>
          <p className="text-muted-foreground mb-6">
            Buyurtma berish va xaridlar tarixini ko'rish uchun tizimga kiring
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/auth/login">
              <Button className="liquid-btn w-full sm:w-auto">
                Kirish
              </Button>
            </Link>
            <Link href="/auth/register">
              <Button variant="outline" className="glass w-full sm:w-auto">
                Ro'yxatdan o'tish
              </Button>
            </Link>
          </div>
        </div>

        {/* Guest menu */}
        <div className="mt-8 space-y-3">
          <Link href="/favorites">
            <div className="glass rounded-2xl p-4 flex items-center justify-between hover-spring">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Heart className="h-5 w-5 text-primary" />
                </div>
                <span className="font-medium">Sevimlilar</span>
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground" />
            </div>
          </Link>
          <Link href="/contact">
            <div className="glass rounded-2xl p-4 flex items-center justify-between hover-spring">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Phone className="h-5 w-5 text-primary" />
                </div>
                <span className="font-medium">Aloqa</span>
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground" />
            </div>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container px-4 sm:px-6">
      {/* Profile header */}
      <div className="glass rounded-3xl p-6 mb-6">
        <div className="flex items-start gap-4">
          <div className="relative">
            {user.avatar_url ? (
              <Image
                src={user.avatar_url}
                alt={user.full_name}
                width={80}
                height={80}
                className="rounded-full"
              />
            ) : (
              <div className="h-20 w-20 rounded-full bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center">
                <span className="text-2xl font-bold text-white">
                  {user.full_name.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
            <Button
              size="icon"
              variant="ghost"
              className="absolute -bottom-1 -right-1 h-8 w-8 rounded-full glass"
            >
              <Edit className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-bold">{user.full_name}</h2>
            <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
              <Mail className="h-4 w-4" />
              {user.email}
            </div>
            {user.phone && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                <Phone className="h-4 w-4" />
                {user.phone}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="glass rounded-2xl p-4 text-center">
          <Package className="h-6 w-6 mx-auto text-primary mb-2" />
          <div className="text-lg font-bold">{orders.length}</div>
          <div className="text-xs text-muted-foreground">Buyurtmalar</div>
        </div>
        <div className="glass rounded-2xl p-4 text-center">
          <Heart className="h-6 w-6 mx-auto text-red-500 mb-2" />
          <div className="text-lg font-bold">
            {JSON.parse(localStorage.getItem("favorites") || "[]").length}
          </div>
          <div className="text-xs text-muted-foreground">Sevimlilar</div>
        </div>
        <div className="glass rounded-2xl p-4 text-center">
          <MapPin className="h-6 w-6 mx-auto text-green-500 mb-2" />
          <div className="text-lg font-bold">2</div>
          <div className="text-xs text-muted-foreground">Manzillar</div>
        </div>
      </div>

      {/* Menu items */}
      <div className="space-y-3 mb-6">
        {menuItems.map((item) => (
          <Link key={item.href} href={item.href}>
            <div className="glass rounded-2xl p-4 flex items-center justify-between hover-spring">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <item.icon className="h-5 w-5 text-primary" />
                </div>
                <span className="font-medium">{item.label}</span>
              </div>
              <div className="flex items-center gap-2">
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="px-2 py-0.5 rounded-full bg-primary text-white text-xs font-medium">
                    {item.badge}
                  </span>
                )}
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Recent orders */}
      {orders.length > 0 && (
        <div className="glass rounded-3xl p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Oxirgi buyurtmalar</h3>
            <Link href="/profile/orders" className="text-primary text-sm font-medium">
              Barchasi
            </Link>
          </div>
          <div className="space-y-3">
            {orders.slice(0, 3).map((order) => {
              const status = statusConfig[order.status];
              const StatusIcon = status.icon;
              
              return (
                <Link key={order.id} href={`/profile/orders/${order.id}`}>
                  <div className="flex items-center justify-between p-3 rounded-xl hover:bg-primary/5 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className={cn("h-10 w-10 rounded-full flex items-center justify-center", status.bg)}>
                        <StatusIcon className={cn("h-5 w-5", status.color)} />
                      </div>
                      <div>
                        <div className="font-medium">#{order.order_number}</div>
                        <div className="text-xs text-muted-foreground">
                          {formatDate(order.created_at)}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">{formatPrice(order.total_amount)}</div>
                      <div className={cn("text-xs", status.color)}>{status.label}</div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* Logout */}
      <Button
        variant="ghost"
        className="w-full h-14 rounded-2xl text-red-500 hover:text-red-600 hover:bg-red-500/10"
        onClick={handleLogout}
      >
        <LogOut className="h-5 w-5 mr-2" />
        Chiqish
      </Button>
    </div>
  );
}
