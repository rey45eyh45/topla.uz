"use client";

import { useState } from "react";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import {
  Search,
  MoreHorizontal,
  Eye,
  CheckCircle,
  XCircle,
  Ban,
  Settings,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Package,
  ShoppingCart,
  DollarSign,
  Store,
} from "lucide-react";
import { formatPrice, formatDate } from "@/lib/utils";

// Mock data
const mockShops = [
  {
    id: "1",
    name: "TechStore",
    slug: "techstore",
    owner: "Aziz Karimov",
    ownerPhone: "+998901234567",
    ownerEmail: "aziz@email.com",
    logo: "",
    status: "verified",
    balance: 15000000,
    totalSales: 125000000,
    totalOrders: 456,
    commission: 10,
    rating: 4.8,
    address: "Toshkent, Chilonzor",
    createdAt: "2024-06-15",
  },
  {
    id: "2",
    name: "Fashion House",
    slug: "fashion-house",
    owner: "Malika Rahimova",
    ownerPhone: "+998901234568",
    ownerEmail: "malika@email.com",
    logo: "",
    status: "verified",
    balance: 8500000,
    totalSales: 85000000,
    totalOrders: 312,
    commission: 12,
    rating: 4.5,
    address: "Toshkent, Yunusobod",
    createdAt: "2024-07-20",
  },
  {
    id: "3",
    name: "Gadget World",
    slug: "gadget-world",
    owner: "Jamshid Qodirov",
    ownerPhone: "+998901234569",
    ownerEmail: "jamshid@email.com",
    logo: "",
    status: "pending",
    balance: 0,
    totalSales: 0,
    totalOrders: 0,
    commission: 10,
    rating: 0,
    address: "Samarqand",
    createdAt: "2026-01-28",
  },
  {
    id: "4",
    name: "Kids Paradise",
    slug: "kids-paradise",
    owner: "Nodira Azimova",
    ownerPhone: "+998901234570",
    ownerEmail: "nodira@email.com",
    logo: "",
    status: "pending",
    balance: 0,
    totalSales: 0,
    totalOrders: 0,
    commission: 10,
    rating: 0,
    address: "Buxoro",
    createdAt: "2026-01-27",
  },
  {
    id: "5",
    name: "Sport Zone",
    slug: "sport-zone",
    owner: "Sardor Aliyev",
    ownerPhone: "+998901234571",
    ownerEmail: "sardor@email.com",
    logo: "",
    status: "suspended",
    balance: 2500000,
    totalSales: 45000000,
    totalOrders: 156,
    commission: 10,
    rating: 3.2,
    address: "Toshkent, Sergeli",
    createdAt: "2024-09-10",
  },
];

const statusConfig: Record<string, { label: string; variant: "success" | "warning" | "destructive" | "secondary" }> = {
  verified: { label: "Tasdiqlangan", variant: "success" },
  pending: { label: "Kutilmoqda", variant: "warning" },
  rejected: { label: "Rad etilgan", variant: "destructive" },
  suspended: { label: "To'xtatilgan", variant: "secondary" },
};

export default function AdminShopsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedShop, setSelectedShop] = useState<typeof mockShops[0] | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isCommissionOpen, setIsCommissionOpen] = useState(false);
  const [newCommission, setNewCommission] = useState("");

  const filteredShops = mockShops.filter((shop) => {
    const matchesSearch =
      shop.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      shop.owner.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || shop.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleVerify = (shop: typeof mockShops[0]) => {
    // TODO: Implement verification
    console.log("Verify shop:", shop.id);
  };

  const handleReject = (shop: typeof mockShops[0]) => {
    // TODO: Implement rejection
    console.log("Reject shop:", shop.id);
  };

  const handleSuspend = (shop: typeof mockShops[0]) => {
    // TODO: Implement suspension
    console.log("Suspend shop:", shop.id);
  };

  const handleCommissionChange = () => {
    // TODO: Implement commission change
    console.log("Change commission:", selectedShop?.id, newCommission);
    setIsCommissionOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Do'konlar</h2>
        <p className="text-muted-foreground">
          Barcha do'konlarni boshqarish va moderatsiya qilish
        </p>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="all" className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-4 justify-between">
          <TabsList>
            <TabsTrigger value="all">Barchasi ({mockShops.length})</TabsTrigger>
            <TabsTrigger value="pending">
              Kutilmoqda ({mockShops.filter((s) => s.status === "pending").length})
            </TabsTrigger>
            <TabsTrigger value="verified">
              Tasdiqlangan ({mockShops.filter((s) => s.status === "verified").length})
            </TabsTrigger>
            <TabsTrigger value="suspended">
              To'xtatilgan ({mockShops.filter((s) => s.status === "suspended").length})
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
          </div>
        </div>

        <TabsContent value="all" className="space-y-4">
          <ShopsTable
            shops={filteredShops}
            onView={(shop) => {
              setSelectedShop(shop);
              setIsDetailOpen(true);
            }}
            onVerify={handleVerify}
            onReject={handleReject}
            onSuspend={handleSuspend}
            onCommission={(shop) => {
              setSelectedShop(shop);
              setNewCommission(shop.commission.toString());
              setIsCommissionOpen(true);
            }}
          />
        </TabsContent>

        <TabsContent value="pending" className="space-y-4">
          <ShopsTable
            shops={filteredShops.filter((s) => s.status === "pending")}
            onView={(shop) => {
              setSelectedShop(shop);
              setIsDetailOpen(true);
            }}
            onVerify={handleVerify}
            onReject={handleReject}
            onSuspend={handleSuspend}
            onCommission={(shop) => {
              setSelectedShop(shop);
              setNewCommission(shop.commission.toString());
              setIsCommissionOpen(true);
            }}
          />
        </TabsContent>

        <TabsContent value="verified" className="space-y-4">
          <ShopsTable
            shops={filteredShops.filter((s) => s.status === "verified")}
            onView={(shop) => {
              setSelectedShop(shop);
              setIsDetailOpen(true);
            }}
            onVerify={handleVerify}
            onReject={handleReject}
            onSuspend={handleSuspend}
            onCommission={(shop) => {
              setSelectedShop(shop);
              setNewCommission(shop.commission.toString());
              setIsCommissionOpen(true);
            }}
          />
        </TabsContent>

        <TabsContent value="suspended" className="space-y-4">
          <ShopsTable
            shops={filteredShops.filter((s) => s.status === "suspended")}
            onView={(shop) => {
              setSelectedShop(shop);
              setIsDetailOpen(true);
            }}
            onVerify={handleVerify}
            onReject={handleReject}
            onSuspend={handleSuspend}
            onCommission={(shop) => {
              setSelectedShop(shop);
              setNewCommission(shop.commission.toString());
              setIsCommissionOpen(true);
            }}
          />
        </TabsContent>
      </Tabs>

      {/* Shop Detail Dialog */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Do'kon ma'lumotlari</DialogTitle>
          </DialogHeader>
          {selectedShop && (
            <div className="space-y-6">
              {/* Shop Header */}
              <div className="flex items-start gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={selectedShop.logo} />
                  <AvatarFallback className="text-lg">
                    {selectedShop.name.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-xl font-semibold">{selectedShop.name}</h3>
                    <Badge variant={statusConfig[selectedShop.status].variant}>
                      {statusConfig[selectedShop.status].label}
                    </Badge>
                  </div>
                  <p className="text-muted-foreground">@{selectedShop.slug}</p>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-4 gap-4">
                <Card>
                  <CardContent className="pt-4">
                    <DollarSign className="h-5 w-5 text-muted-foreground mb-1" />
                    <div className="text-lg font-semibold">{formatPrice(selectedShop.balance)}</div>
                    <div className="text-xs text-muted-foreground">Balans</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-4">
                    <ShoppingCart className="h-5 w-5 text-muted-foreground mb-1" />
                    <div className="text-lg font-semibold">{selectedShop.totalOrders}</div>
                    <div className="text-xs text-muted-foreground">Buyurtmalar</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-4">
                    <DollarSign className="h-5 w-5 text-muted-foreground mb-1" />
                    <div className="text-lg font-semibold">{formatPrice(selectedShop.totalSales)}</div>
                    <div className="text-xs text-muted-foreground">Jami sotuvlar</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-4">
                    <Store className="h-5 w-5 text-muted-foreground mb-1" />
                    <div className="text-lg font-semibold">{selectedShop.commission}%</div>
                    <div className="text-xs text-muted-foreground">Komissiya</div>
                  </CardContent>
                </Card>
              </div>

              {/* Owner Info */}
              <div className="space-y-2">
                <h4 className="font-medium">Egasi ma'lumotlari</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">Ism:</span>
                    <span>{selectedShop.owner}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{selectedShop.ownerPhone}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span>{selectedShop.ownerEmail}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span>{selectedShop.address}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>Ro'yxatdan o'tgan: {formatDate(selectedShop.createdAt)}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            {selectedShop?.status === "pending" && (
              <>
                <Button variant="destructive" onClick={() => handleReject(selectedShop)}>
                  <XCircle className="mr-2 h-4 w-4" />
                  Rad etish
                </Button>
                <Button onClick={() => handleVerify(selectedShop)}>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Tasdiqlash
                </Button>
              </>
            )}
            {selectedShop?.status === "verified" && (
              <Button variant="destructive" onClick={() => handleSuspend(selectedShop)}>
                <Ban className="mr-2 h-4 w-4" />
                To'xtatish
              </Button>
            )}
            {selectedShop?.status === "suspended" && (
              <Button onClick={() => handleVerify(selectedShop)}>
                <CheckCircle className="mr-2 h-4 w-4" />
                Qayta faollashtirish
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Commission Dialog */}
      <Dialog open={isCommissionOpen} onOpenChange={setIsCommissionOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Komissiyani o'zgartirish</DialogTitle>
            <DialogDescription>
              {selectedShop?.name} uchun yangi komissiya foizini kiriting
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Komissiya (%)</Label>
              <Input
                type="number"
                min="0"
                max="100"
                value={newCommission}
                onChange={(e) => setNewCommission(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCommissionOpen(false)}>
              Bekor qilish
            </Button>
            <Button onClick={handleCommissionChange}>Saqlash</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Shops Table Component
function ShopsTable({
  shops,
  onView,
  onVerify,
  onReject,
  onSuspend,
  onCommission,
}: {
  shops: typeof mockShops;
  onView: (shop: typeof mockShops[0]) => void;
  onVerify: (shop: typeof mockShops[0]) => void;
  onReject: (shop: typeof mockShops[0]) => void;
  onSuspend: (shop: typeof mockShops[0]) => void;
  onCommission: (shop: typeof mockShops[0]) => void;
}) {
  if (shops.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Store className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground">Do'konlar topilmadi</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Do'kon</TableHead>
            <TableHead>Egasi</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Balans</TableHead>
            <TableHead>Komissiya</TableHead>
            <TableHead>Sana</TableHead>
            <TableHead className="w-[50px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {shops.map((shop) => (
            <TableRow key={shop.id}>
              <TableCell>
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage src={shop.logo} />
                    <AvatarFallback>{shop.name.slice(0, 2).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium">{shop.name}</div>
                    <div className="text-xs text-muted-foreground">{shop.totalOrders} buyurtma</div>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <div>
                  <div className="font-medium">{shop.owner}</div>
                  <div className="text-xs text-muted-foreground">{shop.ownerPhone}</div>
                </div>
              </TableCell>
              <TableCell>
                <Badge variant={statusConfig[shop.status].variant}>
                  {statusConfig[shop.status].label}
                </Badge>
              </TableCell>
              <TableCell>{formatPrice(shop.balance)}</TableCell>
              <TableCell>{shop.commission}%</TableCell>
              <TableCell className="text-muted-foreground">{formatDate(shop.createdAt)}</TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Amallar</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => onView(shop)}>
                      <Eye className="mr-2 h-4 w-4" />
                      Ko'rish
                    </DropdownMenuItem>
                    {shop.status === "pending" && (
                      <>
                        <DropdownMenuItem onClick={() => onVerify(shop)}>
                          <CheckCircle className="mr-2 h-4 w-4" />
                          Tasdiqlash
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onReject(shop)} className="text-destructive">
                          <XCircle className="mr-2 h-4 w-4" />
                          Rad etish
                        </DropdownMenuItem>
                      </>
                    )}
                    {shop.status === "verified" && (
                      <DropdownMenuItem onClick={() => onSuspend(shop)} className="text-destructive">
                        <Ban className="mr-2 h-4 w-4" />
                        To'xtatish
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => onCommission(shop)}>
                      <Settings className="mr-2 h-4 w-4" />
                      Komissiya o'zgartirish
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
