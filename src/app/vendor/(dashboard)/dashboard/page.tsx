"use client";

import Link from "next/link";
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
import {
  DollarSign,
  ShoppingCart,
  Package,
  TrendingUp,
  ArrowRight,
  Clock,
  AlertCircle,
  Wallet,
  Plus,
  Eye,
} from "lucide-react";
import { formatPrice } from "@/lib/utils";

// Mock data
const shopStats = {
  balance: 15000000,
  pendingPayout: 5000000,
  todayOrders: 12,
  todaySales: 3500000,
  totalProducts: 156,
  pendingProducts: 5,
  monthSales: 45000000,
};

const recentOrders = [
  {
    id: "ORD-1234",
    customer: "Aziz Karimov",
    items: 3,
    total: 1250000,
    status: "pending",
    date: "14:30",
  },
  {
    id: "ORD-1233",
    customer: "Malika Rahimova",
    items: 1,
    total: 450000,
    status: "confirmed",
    date: "13:15",
  },
  {
    id: "ORD-1232",
    customer: "Bobur Toshmatov",
    items: 2,
    total: 890000,
    status: "shipped",
    date: "11:45",
  },
  {
    id: "ORD-1231",
    customer: "Gulnora Saidova",
    items: 4,
    total: 2100000,
    status: "delivered",
    date: "10:20",
  },
];

const lowStockProducts = [
  { id: 1, name: "iPhone 15 Pro Max", stock: 2 },
  { id: 2, name: "AirPods Pro 2", stock: 3 },
  { id: 3, name: "MacBook Air M2", stock: 1 },
];

const statusColors: Record<string, "warning" | "default" | "secondary" | "success"> = {
  pending: "warning",
  confirmed: "default",
  shipped: "secondary",
  delivered: "success",
};

const statusLabels: Record<string, string> = {
  pending: "Kutilmoqda",
  confirmed: "Tasdiqlangan",
  shipped: "Yetkazilmoqda",
  delivered: "Yetkazildi",
};

export default function VendorDashboard() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Dashboard</h2>
          <p className="text-muted-foreground">Do'koningiz umumiy ko'rinishi</p>
        </div>
        <Button asChild>
          <Link href="/vendor/products/new">
            <Plus className="mr-2 h-4 w-4" />
            Mahsulot qo'shish
          </Link>
        </Button>
      </div>

      {/* Balance Card */}
      <Card className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <p className="text-primary-foreground/80 text-sm">Joriy balans</p>
              <p className="text-4xl font-bold">{formatPrice(shopStats.balance)}</p>
              <p className="text-primary-foreground/60 text-sm mt-1">
                Kutilayotgan: {formatPrice(shopStats.pendingPayout)}
              </p>
            </div>
            <Button variant="secondary" asChild>
              <Link href="/vendor/balance">
                <Wallet className="mr-2 h-4 w-4" />
                Pul yechib olish
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Bugungi buyurtmalar
            </CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{shopStats.todayOrders}</div>
            <p className="text-xs text-muted-foreground">
              <TrendingUp className="inline h-3 w-3 text-green-500 mr-1" />
              +3 kechagiga nisbatan
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Bugungi sotuvlar
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatPrice(shopStats.todaySales)}</div>
            <p className="text-xs text-muted-foreground">
              <TrendingUp className="inline h-3 w-3 text-green-500 mr-1" />
              +12% kechagiga nisbatan
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Jami mahsulotlar
            </CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{shopStats.totalProducts}</div>
            <p className="text-xs text-muted-foreground">
              {shopStats.pendingProducts} ta moderatsiyada
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Oylik sotuvlar
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatPrice(shopStats.monthSales)}</div>
            <p className="text-xs text-muted-foreground">
              <TrendingUp className="inline h-3 w-3 text-green-500 mr-1" />
              +23% o'tgan oyga nisbatan
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Alerts */}
      {lowStockProducts.length > 0 && (
        <Card className="border-yellow-500/50 bg-yellow-500/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-yellow-500" />
              Kam qolgan mahsulotlar
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {lowStockProducts.map((product) => (
                <Badge key={product.id} variant="outline" className="gap-2">
                  {product.name}
                  <span className="text-yellow-500 font-bold">{product.stock} ta</span>
                </Badge>
              ))}
            </div>
            <Button variant="link" size="sm" className="px-0 mt-2" asChild>
              <Link href="/vendor/products?stock=low">
                Barchasini ko'rish <ArrowRight className="ml-1 h-3 w-3" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Content Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Orders */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>So'nggi buyurtmalar</CardTitle>
                <CardDescription>Bugungi buyurtmalar</CardDescription>
              </div>
              <Button variant="outline" size="sm" asChild>
                <Link href="/vendor/orders">Barchasi</Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Buyurtma</TableHead>
                  <TableHead>Summa</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentOrders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{order.id}</div>
                        <div className="text-xs text-muted-foreground">
                          {order.customer} • {order.items} ta
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{formatPrice(order.total)}</TableCell>
                    <TableCell>
                      <Badge variant={statusColors[order.status]}>
                        {statusLabels[order.status]}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon" asChild>
                        <Link href={`/vendor/orders/${order.id}`}>
                          <Eye className="h-4 w-4" />
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Sales Chart Placeholder */}
        <Card>
          <CardHeader>
            <CardTitle>Sotuvlar statistikasi</CardTitle>
            <CardDescription>Oxirgi 7 kunlik sotuvlar</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center text-muted-foreground">
              <div className="text-center">
                <TrendingUp className="h-12 w-12 mx-auto mb-2 text-primary/50" />
                <p>Chart komponent qo'shiladi</p>
                <p className="text-xs mt-1">Recharts kutubxonasi</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="cursor-pointer hover:border-primary/50 transition-colors">
          <Link href="/vendor/products/new">
            <CardContent className="pt-6 text-center">
              <Plus className="h-8 w-8 mx-auto mb-2 text-primary" />
              <h3 className="font-medium">Yangi mahsulot</h3>
              <p className="text-sm text-muted-foreground">Mahsulot qo'shish</p>
            </CardContent>
          </Link>
        </Card>
        <Card className="cursor-pointer hover:border-primary/50 transition-colors">
          <Link href="/vendor/orders?status=pending">
            <CardContent className="pt-6 text-center">
              <Clock className="h-8 w-8 mx-auto mb-2 text-yellow-500" />
              <h3 className="font-medium">Kutilayotgan</h3>
              <p className="text-sm text-muted-foreground">3 ta buyurtma</p>
            </CardContent>
          </Link>
        </Card>
        <Card className="cursor-pointer hover:border-primary/50 transition-colors">
          <Link href="/vendor/balance">
            <CardContent className="pt-6 text-center">
              <Wallet className="h-8 w-8 mx-auto mb-2 text-green-500" />
              <h3 className="font-medium">Pul yechish</h3>
              <p className="text-sm text-muted-foreground">{formatPrice(shopStats.balance)}</p>
            </CardContent>
          </Link>
        </Card>
      </div>
    </div>
  );
}
