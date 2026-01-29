"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Search,
  Plus,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  Package,
  Upload,
  LayoutGrid,
  List,
} from "lucide-react";
import { formatPrice } from "@/lib/utils";

// Mock data
const mockProducts = [
  {
    id: "1",
    name: "iPhone 15 Pro Max 256GB",
    nameRu: "iPhone 15 Pro Max 256GB",
    image: "",
    price: 15990000,
    comparePrice: 17500000,
    stock: 12,
    status: "active",
    category: "Smartfonlar",
    createdAt: "2026-01-15",
  },
  {
    id: "2",
    name: "Samsung Galaxy S24 Ultra",
    nameRu: "Samsung Galaxy S24 Ultra",
    image: "",
    price: 14500000,
    comparePrice: 0,
    stock: 8,
    status: "active",
    category: "Smartfonlar",
    createdAt: "2026-01-14",
  },
  {
    id: "3",
    name: "MacBook Air M2 13\"",
    nameRu: "MacBook Air M2 13\"",
    image: "",
    price: 12990000,
    comparePrice: 14000000,
    stock: 3,
    status: "active",
    category: "Noutbuklar",
    createdAt: "2026-01-10",
  },
  {
    id: "4",
    name: "AirPods Pro 2",
    nameRu: "AirPods Pro 2",
    image: "",
    price: 2990000,
    comparePrice: 3500000,
    stock: 25,
    status: "pending",
    category: "Quloqchinlar",
    createdAt: "2026-01-28",
  },
  {
    id: "5",
    name: "Apple Watch Series 9",
    nameRu: "Apple Watch Series 9",
    image: "",
    price: 5500000,
    comparePrice: 0,
    stock: 0,
    status: "rejected",
    category: "Smart soatlar",
    createdAt: "2026-01-20",
  },
];

const statusConfig: Record<string, { label: string; variant: "success" | "warning" | "destructive" | "secondary" }> = {
  active: { label: "Faol", variant: "success" },
  pending: { label: "Tekshirilmoqda", variant: "warning" },
  rejected: { label: "Rad etilgan", variant: "destructive" },
  inactive: { label: "Nofaol", variant: "secondary" },
};

export default function VendorProductsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("list");

  const filteredProducts = mockProducts.filter((product) =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Mahsulotlar</h2>
          <p className="text-muted-foreground">Do'koningizdagi barcha mahsulotlar</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href="/vendor/products/import">
              <Upload className="mr-2 h-4 w-4" />
              Import
            </Link>
          </Button>
          <Button asChild>
            <Link href="/vendor/products/new">
              <Plus className="mr-2 h-4 w-4" />
              Mahsulot qo'shish
            </Link>
          </Button>
        </div>
      </div>

      {/* Tabs & Filters */}
      <Tabs defaultValue="all" className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-4 justify-between">
          <TabsList>
            <TabsTrigger value="all">Barchasi ({mockProducts.length})</TabsTrigger>
            <TabsTrigger value="active">
              Faol ({mockProducts.filter((p) => p.status === "active").length})
            </TabsTrigger>
            <TabsTrigger value="pending">
              Tekshirilmoqda ({mockProducts.filter((p) => p.status === "pending").length})
            </TabsTrigger>
            <TabsTrigger value="rejected">
              Rad etilgan ({mockProducts.filter((p) => p.status === "rejected").length})
            </TabsTrigger>
          </TabsList>

          <div className="flex gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Qidirish..."
                className="pl-9 w-[200px]"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex border rounded-md">
              <Button
                variant={viewMode === "list" ? "secondary" : "ghost"}
                size="icon"
                onClick={() => setViewMode("list")}
              >
                <List className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === "grid" ? "secondary" : "ghost"}
                size="icon"
                onClick={() => setViewMode("grid")}
              >
                <LayoutGrid className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        <TabsContent value="all" className="space-y-4">
          {viewMode === "list" ? (
            <ProductsTable products={filteredProducts} />
          ) : (
            <ProductsGrid products={filteredProducts} />
          )}
        </TabsContent>

        <TabsContent value="active" className="space-y-4">
          {viewMode === "list" ? (
            <ProductsTable products={filteredProducts.filter((p) => p.status === "active")} />
          ) : (
            <ProductsGrid products={filteredProducts.filter((p) => p.status === "active")} />
          )}
        </TabsContent>

        <TabsContent value="pending" className="space-y-4">
          {viewMode === "list" ? (
            <ProductsTable products={filteredProducts.filter((p) => p.status === "pending")} />
          ) : (
            <ProductsGrid products={filteredProducts.filter((p) => p.status === "pending")} />
          )}
        </TabsContent>

        <TabsContent value="rejected" className="space-y-4">
          {viewMode === "list" ? (
            <ProductsTable products={filteredProducts.filter((p) => p.status === "rejected")} />
          ) : (
            <ProductsGrid products={filteredProducts.filter((p) => p.status === "rejected")} />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Products Table Component
function ProductsTable({ products }: { products: typeof mockProducts }) {
  if (products.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Package className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground">Mahsulotlar topilmadi</p>
          <Button className="mt-4" asChild>
            <Link href="/vendor/products/new">
              <Plus className="mr-2 h-4 w-4" />
              Mahsulot qo'shish
            </Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Mahsulot</TableHead>
            <TableHead>Kategoriya</TableHead>
            <TableHead>Narx</TableHead>
            <TableHead>Ombor</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="w-[50px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.map((product) => (
            <TableRow key={product.id}>
              <TableCell>
                <div className="flex items-center gap-3">
                  <Avatar className="h-12 w-12 rounded-md">
                    <AvatarImage src={product.image} />
                    <AvatarFallback className="rounded-md">
                      <Package className="h-6 w-6" />
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium">{product.name}</div>
                    <div className="text-xs text-muted-foreground">ID: {product.id}</div>
                  </div>
                </div>
              </TableCell>
              <TableCell>{product.category}</TableCell>
              <TableCell>
                <div>
                  <div className="font-medium">{formatPrice(product.price)}</div>
                  {product.comparePrice > 0 && (
                    <div className="text-xs text-muted-foreground line-through">
                      {formatPrice(product.comparePrice)}
                    </div>
                  )}
                </div>
              </TableCell>
              <TableCell>
                <span className={product.stock < 5 ? "text-red-500 font-medium" : ""}>
                  {product.stock} ta
                </span>
              </TableCell>
              <TableCell>
                <Badge variant={statusConfig[product.status].variant}>
                  {statusConfig[product.status].label}
                </Badge>
              </TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild>
                      <Link href={`/vendor/products/${product.id}`}>
                        <Eye className="mr-2 h-4 w-4" />
                        Ko'rish
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href={`/vendor/products/${product.id}/edit`}>
                        <Edit className="mr-2 h-4 w-4" />
                        Tahrirlash
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-destructive">
                      <Trash2 className="mr-2 h-4 w-4" />
                      O'chirish
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  );
}

// Products Grid Component
function ProductsGrid({ products }: { products: typeof mockProducts }) {
  if (products.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Package className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground">Mahsulotlar topilmadi</p>
          <Button className="mt-4" asChild>
            <Link href="/vendor/products/new">
              <Plus className="mr-2 h-4 w-4" />
              Mahsulot qo'shish
            </Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {products.map((product) => (
        <Card key={product.id} className="overflow-hidden">
          <div className="aspect-square bg-muted flex items-center justify-center">
            {product.image ? (
              <img src={product.image} alt={product.name} className="object-cover w-full h-full" />
            ) : (
              <Package className="h-12 w-12 text-muted-foreground" />
            )}
          </div>
          <CardContent className="p-4">
            <div className="flex items-start justify-between gap-2 mb-2">
              <h3 className="font-medium line-clamp-2">{product.name}</h3>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="shrink-0">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild>
                    <Link href={`/vendor/products/${product.id}/edit`}>
                      <Edit className="mr-2 h-4 w-4" />
                      Tahrirlash
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="text-destructive">
                    <Trash2 className="mr-2 h-4 w-4" />
                    O'chirish
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <p className="text-sm text-muted-foreground mb-2">{product.category}</p>
            <div className="flex items-center justify-between">
              <div>
                <div className="font-bold">{formatPrice(product.price)}</div>
                {product.comparePrice > 0 && (
                  <div className="text-xs text-muted-foreground line-through">
                    {formatPrice(product.comparePrice)}
                  </div>
                )}
              </div>
              <Badge variant={statusConfig[product.status].variant}>
                {statusConfig[product.status].label}
              </Badge>
            </div>
            <p className={`text-sm mt-2 ${product.stock < 5 ? "text-red-500" : "text-muted-foreground"}`}>
              Omborda: {product.stock} ta
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
