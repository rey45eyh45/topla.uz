"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DollarSign,
  ShoppingCart,
  Store,
  Package,
  TrendingUp,
  TrendingDown,
  ArrowRight,
  Clock,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import Link from "next/link";
import { formatPrice } from "@/lib/utils";

// Mock data
const stats = [
  {
    title: "Jami daromad",
    value: "125,430,000",
    change: "+12.5%",
    trend: "up",
    icon: DollarSign,
    suffix: "so'm",
  },
  {
    title: "Bugungi buyurtmalar",
    value: "48",
    change: "+8.2%",
    trend: "up",
    icon: ShoppingCart,
  },
  {
    title: "Kutilayotgan do'konlar",
    value: "12",
    change: "-3",
    trend: "down",
    icon: Store,
  },
  {
    title: "Moderatsiya (mahsulot)",
    value: "34",
    change: "+5",
    trend: "up",
    icon: Package,
  },
];

const recentOrders = [
  {
    id: "ORD-001",
    customer: "Aziz Karimov",
    shop: "TechStore",
    total: 1250000,
    status: "pending",
    date: "2026-01-29 14:30",
  },
  {
    id: "ORD-002",
    customer: "Malika Rahimova",
    shop: "Fashion House",
    total: 450000,
    status: "confirmed",
    date: "2026-01-29 13:15",
  },
  {
    id: "ORD-003",
    customer: "Bobur Toshmatov",
    shop: "Mebel Market",
    total: 3200000,
    status: "shipped",
    date: "2026-01-29 11:45",
  },
  {
    id: "ORD-004",
    customer: "Gulnora Saidova",
    shop: "Beauty Shop",
    total: 180000,
    status: "delivered",
    date: "2026-01-29 10:20",
  },
  {
    id: "ORD-005",
    customer: "Sardor Aliyev",
    shop: "Sport Zone",
    total: 890000,
    status: "pending",
    date: "2026-01-29 09:00",
  },
];

const pendingShops = [
  { id: 1, name: "Gadget World", owner: "Jamshid Qodirov", date: "2026-01-28" },
  { id: 2, name: "Kids Paradise", owner: "Nodira Azimova", date: "2026-01-27" },
  { id: 3, name: "Home Decor", owner: "Timur Rashidov", date: "2026-01-27" },
];

const pendingProducts = [
  { id: 1, name: "iPhone 15 Pro Max", shop: "TechStore", price: 15990000 },
  { id: 2, name: "Samsung TV 55\"", shop: "Elektro Plus", price: 8500000 },
  { id: 3, name: "Nike Air Max", shop: "Sport Zone", price: 1200000 },
];

const statusColors: Record<string, "default" | "warning" | "success" | "secondary"> = {
  pending: "warning",
  confirmed: "default",
  shipped: "secondary",
  delivered: "success",
  cancelled: "destructive" as any,
};

const statusLabels: Record<string, string> = {
  pending: "Kutilmoqda",
  confirmed: "Tasdiqlangan",
  shipped: "Yetkazilmoqda",
  delivered: "Yetkazildi",
  cancelled: "Bekor qilindi",
};

export default function AdminDashboard() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Dashboard</h2>
        <p className="text-muted-foreground">
          Xush kelibsiz! Bu yerda asosiy statistikani ko'rishingiz mumkin.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stat.value} {stat.suffix}
              </div>
              <div className="flex items-center text-xs">
                {stat.trend === "up" ? (
                  <TrendingUp className="mr-1 h-3 w-3 text-green-500" />
                ) : (
                  <TrendingDown className="mr-1 h-3 w-3 text-red-500" />
                )}
                <span className={stat.trend === "up" ? "text-green-500" : "text-red-500"}>
                  {stat.change}
                </span>
                <span className="ml-1 text-muted-foreground">o'tgan oyga nisbatan</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Alerts */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="border-yellow-500/50 bg-yellow-500/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-yellow-500" />
              Kutilayotgan do'konlar
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-3">
              {pendingShops.length} ta do'kon tekshirilishi kerak
            </p>
            <div className="space-y-2">
              {pendingShops.slice(0, 2).map((shop) => (
                <div key={shop.id} className="flex items-center justify-between text-sm">
                  <span className="font-medium">{shop.name}</span>
                  <span className="text-muted-foreground">{shop.owner}</span>
                </div>
              ))}
            </div>
            <Button variant="link" size="sm" className="px-0 mt-2" asChild>
              <Link href="/admin/shops?status=pending">
                Barchasini ko'rish <ArrowRight className="ml-1 h-3 w-3" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="border-blue-500/50 bg-blue-500/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Package className="h-4 w-4 text-blue-500" />
              Moderatsiya kutilmoqda
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-3">
              {pendingProducts.length} ta mahsulot tekshirilishi kerak
            </p>
            <div className="space-y-2">
              {pendingProducts.slice(0, 2).map((product) => (
                <div key={product.id} className="flex items-center justify-between text-sm">
                  <span className="font-medium">{product.name}</span>
                  <span className="text-muted-foreground">{formatPrice(product.price)}</span>
                </div>
              ))}
            </div>
            <Button variant="link" size="sm" className="px-0 mt-2" asChild>
              <Link href="/admin/products?status=pending">
                Barchasini ko'rish <ArrowRight className="ml-1 h-3 w-3" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Recent Orders Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>So'nggi buyurtmalar</CardTitle>
              <CardDescription>Oxirgi 24 soatdagi buyurtmalar</CardDescription>
            </div>
            <Button variant="outline" size="sm" asChild>
              <Link href="/admin/orders">Barchasini ko'rish</Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Buyurtma ID</TableHead>
                <TableHead>Mijoz</TableHead>
                <TableHead>Do'kon</TableHead>
                <TableHead>Summa</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Sana</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentOrders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-medium">{order.id}</TableCell>
                  <TableCell>{order.customer}</TableCell>
                  <TableCell>{order.shop}</TableCell>
                  <TableCell>{formatPrice(order.total)}</TableCell>
                  <TableCell>
                    <Badge variant={statusColors[order.status]}>
                      {statusLabels[order.status]}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{order.date}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Charts Section */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Sotuvlar statistikasi</CardTitle>
            <CardDescription>Oxirgi 7 kunlik sotuvlar</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center text-muted-foreground">
              {/* Chart placeholder - use Recharts here */}
              <div className="text-center">
                <TrendingUp className="h-12 w-12 mx-auto mb-2 text-primary/50" />
                <p>Chart komponent qo'shiladi</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top do'konlar</CardTitle>
            <CardDescription>Eng ko'p sotuvchi do'konlar</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { name: "TechStore", sales: 45000000, orders: 234 },
                { name: "Fashion House", sales: 32000000, orders: 189 },
                { name: "Mebel Market", sales: 28000000, orders: 45 },
                { name: "Beauty Shop", sales: 18000000, orders: 156 },
                { name: "Sport Zone", sales: 15000000, orders: 98 },
              ].map((shop, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium">
                      {i + 1}
                    </div>
                    <div>
                      <div className="font-medium">{shop.name}</div>
                      <div className="text-xs text-muted-foreground">{shop.orders} buyurtma</div>
                    </div>
                  </div>
                  <div className="text-sm font-medium">{formatPrice(shop.sales)}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
