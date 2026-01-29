"use client";

import Link from "next/link";
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  CheckCircle,
  XCircle,
  Loader2,
  CreditCard,
  DollarSign,
  TrendingUp,
} from "lucide-react";
import { formatPrice, formatDateTime } from "@/lib/utils";

// Mock data
const balanceData = {
  available: 15000000,
  pending: 5000000,
  totalEarned: 125000000,
  totalWithdrawn: 110000000,
  commissionRate: 10,
};

const transactions = [
  {
    id: "1",
    type: "order",
    description: "Buyurtma #ORD-1234",
    amount: 1250000,
    commission: 125000,
    status: "completed",
    date: "2026-01-29T14:30:00",
  },
  {
    id: "2",
    type: "payout",
    description: "Pul yechish",
    amount: -5000000,
    commission: 0,
    status: "completed",
    date: "2026-01-28T10:00:00",
  },
  {
    id: "3",
    type: "order",
    description: "Buyurtma #ORD-1233",
    amount: 450000,
    commission: 45000,
    status: "completed",
    date: "2026-01-28T09:15:00",
  },
  {
    id: "4",
    type: "payout",
    description: "Pul yechish",
    amount: -3000000,
    commission: 0,
    status: "pending",
    date: "2026-01-27T16:00:00",
  },
  {
    id: "5",
    type: "order",
    description: "Buyurtma #ORD-1232",
    amount: 890000,
    commission: 89000,
    status: "completed",
    date: "2026-01-27T11:45:00",
  },
];

const payoutHistory = [
  {
    id: "1",
    amount: 5000000,
    cardNumber: "8600 **** **** 1234",
    cardHolder: "AZIZ KARIMOV",
    status: "completed",
    requestedAt: "2026-01-25T10:00:00",
    completedAt: "2026-01-26T14:30:00",
  },
  {
    id: "2",
    amount: 3000000,
    cardNumber: "8600 **** **** 1234",
    cardHolder: "AZIZ KARIMOV",
    status: "pending",
    requestedAt: "2026-01-27T16:00:00",
    completedAt: null,
  },
];

const statusConfig: Record<string, { label: string; variant: "success" | "warning" | "destructive" }> = {
  completed: { label: "Bajarildi", variant: "success" },
  pending: { label: "Kutilmoqda", variant: "warning" },
  rejected: { label: "Rad etildi", variant: "destructive" },
};

export default function VendorBalancePage() {
  const [isPayoutOpen, setIsPayoutOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [payoutAmount, setPayoutAmount] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [cardHolder, setCardHolder] = useState("");

  const handlePayout = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // TODO: Implement actual payout request
    setTimeout(() => {
      setIsLoading(false);
      setIsPayoutOpen(false);
      setPayoutAmount("");
    }, 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Hisobim</h2>
        <p className="text-muted-foreground">Balans va tranzaksiyalar tarixi</p>
      </div>

      {/* Balance Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-2">
              <Wallet className="h-5 w-5" />
              <span className="text-sm font-medium">Mavjud balans</span>
            </div>
            <div className="text-3xl font-bold">{formatPrice(balanceData.available)}</div>
            <Button
              variant="secondary"
              size="sm"
              className="mt-4"
              onClick={() => setIsPayoutOpen(true)}
            >
              Pul yechib olish
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-2 text-muted-foreground">
              <Clock className="h-5 w-5" />
              <span className="text-sm font-medium">Kutilayotgan</span>
            </div>
            <div className="text-2xl font-bold">{formatPrice(balanceData.pending)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Yetkazilgandan keyin qo'shiladi
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-2 text-muted-foreground">
              <TrendingUp className="h-5 w-5" />
              <span className="text-sm font-medium">Jami daromad</span>
            </div>
            <div className="text-2xl font-bold">{formatPrice(balanceData.totalEarned)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Komissiya: {balanceData.commissionRate}%
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-2 text-muted-foreground">
              <DollarSign className="h-5 w-5" />
              <span className="text-sm font-medium">Yechib olingan</span>
            </div>
            <div className="text-2xl font-bold">{formatPrice(balanceData.totalWithdrawn)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Jami yechib olingan summa
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Transactions Table */}
      <Card>
        <CardHeader>
          <CardTitle>Tranzaksiyalar tarixi</CardTitle>
          <CardDescription>Oxirgi 30 kunlik tranzaksiyalar</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tavsif</TableHead>
                <TableHead>Summa</TableHead>
                <TableHead>Komissiya</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Sana</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.map((tx) => (
                <TableRow key={tx.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div
                        className={`h-8 w-8 rounded-full flex items-center justify-center ${
                          tx.type === "order"
                            ? "bg-green-500/20 text-green-500"
                            : "bg-blue-500/20 text-blue-500"
                        }`}
                      >
                        {tx.type === "order" ? (
                          <ArrowDownRight className="h-4 w-4" />
                        ) : (
                          <ArrowUpRight className="h-4 w-4" />
                        )}
                      </div>
                      <span className="font-medium">{tx.description}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className={tx.amount > 0 ? "text-green-500" : "text-blue-500"}>
                      {tx.amount > 0 ? "+" : ""}
                      {formatPrice(tx.amount)}
                    </span>
                  </TableCell>
                  <TableCell>
                    {tx.commission > 0 ? (
                      <span className="text-red-500">-{formatPrice(tx.commission)}</span>
                    ) : (
                      "-"
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant={statusConfig[tx.status].variant}>
                      {statusConfig[tx.status].label}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {formatDateTime(tx.date)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Payout History */}
      <Card>
        <CardHeader>
          <CardTitle>Pul yechish tarixi</CardTitle>
          <CardDescription>So'rovlar va ularning holati</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Summa</TableHead>
                <TableHead>Karta</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>So'rov sanasi</TableHead>
                <TableHead>Bajarilgan</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {payoutHistory.map((payout) => (
                <TableRow key={payout.id}>
                  <TableCell className="font-medium">{formatPrice(payout.amount)}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <CreditCard className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <div>{payout.cardNumber}</div>
                        <div className="text-xs text-muted-foreground">{payout.cardHolder}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={statusConfig[payout.status].variant}>
                      {statusConfig[payout.status].label}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {formatDateTime(payout.requestedAt)}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {payout.completedAt ? formatDateTime(payout.completedAt) : "-"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Payout Dialog */}
      <Dialog open={isPayoutOpen} onOpenChange={setIsPayoutOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Pul yechib olish</DialogTitle>
            <DialogDescription>
              Mavjud balans: {formatPrice(balanceData.available)}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handlePayout}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="amount">Summa (so'm)</Label>
                <Input
                  id="amount"
                  type="number"
                  placeholder="1000000"
                  value={payoutAmount}
                  onChange={(e) => setPayoutAmount(e.target.value)}
                  max={balanceData.available}
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Minimal summa: 100,000 so'm
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="cardNumber">Karta raqami</Label>
                <Input
                  id="cardNumber"
                  placeholder="8600 1234 5678 9012"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cardHolder">Karta egasi</Label>
                <Input
                  id="cardHolder"
                  placeholder="AZIZ KARIMOV"
                  value={cardHolder}
                  onChange={(e) => setCardHolder(e.target.value.toUpperCase())}
                  required
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsPayoutOpen(false)}>
                Bekor qilish
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Yuborilmoqda...
                  </>
                ) : (
                  "So'rov yuborish"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
