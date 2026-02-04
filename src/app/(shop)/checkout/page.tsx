"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  MapPin,
  CreditCard,
  Truck,
  Clock,
  CheckCircle,
  Plus,
  ChevronDown,
  ChevronUp,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";
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

interface Address {
  id: string;
  title: string;
  address: string;
  apartment?: string;
  entrance?: string;
  floor?: string;
  comment?: string;
}

type PaymentMethod = "cash" | "payme" | "click" | "uzum";
type DeliveryTime = "asap" | "scheduled";

export default function CheckoutPage() {
  const router = useRouter();
  const supabase = createClient();

  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [user, setUser] = useState<any>(null);
  
  // Form state
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<string | null>(null);
  const [showAddAddress, setShowAddAddress] = useState(false);
  const [newAddress, setNewAddress] = useState({
    title: "",
    address: "",
    apartment: "",
    entrance: "",
    floor: "",
    comment: "",
  });
  
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cash");
  const [deliveryTime, setDeliveryTime] = useState<DeliveryTime>("asap");
  const [scheduledDate, setScheduledDate] = useState("");
  const [scheduledTimeSlot, setScheduledTimeSlot] = useState("");
  
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const [comment, setComment] = useState("");
  
  const [expandedSection, setExpandedSection] = useState<string | null>("address");
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    // Load cart
    const cart = JSON.parse(localStorage.getItem("cart") || "[]");
    if (cart.length === 0) {
      router.push("/cart");
      return;
    }
    setCartItems(cart);

    // Check auth
    const { data: { user: authUser } } = await supabase.auth.getUser();
    setUser(authUser);

    if (authUser) {
      // Load profile
      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", authUser.id)
        .single();
      
      if (profile) {
        setName(profile.full_name || "");
        setPhone(profile.phone || "");
      }

      // Load addresses
      const { data: addressesData } = await supabase
        .from("addresses")
        .select("*")
        .eq("user_id", authUser.id)
        .order("created_at", { ascending: false });

      if (addressesData && addressesData.length > 0) {
        setAddresses(addressesData);
        setSelectedAddress(addressesData[0].id);
      }
    }

    setLoading(false);
  }

  function formatPrice(price: number): string {
    return new Intl.NumberFormat("uz-UZ").format(price) + " so'm";
  }

  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const deliveryFee = subtotal >= 100000 ? 0 : 15000;
  const total = subtotal + deliveryFee;

  const paymentMethods = [
    { id: "cash", label: "Naqd pul", icon: "💵" },
    { id: "payme", label: "Payme", icon: "🔵" },
    { id: "click", label: "Click", icon: "🟢" },
    { id: "uzum", label: "Uzum Bank", icon: "🟡" },
  ];

  const timeSlots = [
    "09:00 - 12:00",
    "12:00 - 15:00",
    "15:00 - 18:00",
    "18:00 - 21:00",
  ];

  function validateForm(): boolean {
    const newErrors: Record<string, string> = {};

    if (!name.trim()) newErrors.name = "Ism kiritilishi shart";
    if (!phone.trim()) newErrors.phone = "Telefon raqam kiritilishi shart";
    if (!selectedAddress && !showAddAddress) {
      newErrors.address = "Manzil tanlang yoki yangi qo'shing";
    }
    if (showAddAddress && !newAddress.address.trim()) {
      newErrors.newAddress = "Manzil kiritilishi shart";
    }
    if (deliveryTime === "scheduled" && (!scheduledDate || !scheduledTimeSlot)) {
      newErrors.schedule = "Vaqtni tanlang";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleSubmit() {
    if (!validateForm()) return;

    setSubmitting(true);
    try {
      // Create address if new
      let addressId = selectedAddress;
      if (showAddAddress && newAddress.address) {
        if (user) {
          const { data: addr } = await supabase
            .from("addresses")
            .insert({
              user_id: user.id,
              ...newAddress,
            })
            .select()
            .single();
          addressId = addr?.id;
        }
      }

      // Create order
      const orderData = {
        user_id: user?.id || null,
        address_id: addressId,
        delivery_address: showAddAddress ? newAddress.address : addresses.find(a => a.id === selectedAddress)?.address,
        customer_name: name,
        customer_phone: phone,
        payment_method: paymentMethod,
        delivery_time: deliveryTime === "asap" ? "ASAP" : `${scheduledDate} ${scheduledTimeSlot}`,
        comment: comment,
        subtotal: subtotal,
        delivery_fee: deliveryFee,
        total_amount: total,
        status: "pending",
        items: cartItems.map(item => ({
          product_id: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          image_url: item.image_url,
        })),
      };

      const { data: order, error } = await supabase
        .from("orders")
        .insert(orderData)
        .select()
        .single();

      if (error) throw error;

      // Clear cart
      localStorage.setItem("cart", JSON.stringify([]));
      window.dispatchEvent(new Event("cartUpdated"));

      // Redirect to success page
      router.push(`/checkout/success?order=${order.id}`);
    } catch (error) {
      console.error("Error creating order:", error);
      setErrors({ submit: "Xatolik yuz berdi. Qaytadan urinib ko'ring." });
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="container px-4 sm:px-6">
        <div className="skeleton h-10 w-48 mb-6" />
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            <div className="skeleton h-48 rounded-3xl" />
            <div className="skeleton h-32 rounded-3xl" />
            <div className="skeleton h-32 rounded-3xl" />
          </div>
          <div className="skeleton h-80 rounded-3xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="container px-4 sm:px-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Link href="/cart">
          <Button variant="ghost" size="icon" className="rounded-full glass">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <h1 className="text-2xl sm:text-3xl font-bold">Buyurtma berish</h1>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Form sections */}
        <div className="lg:col-span-2 space-y-4">
          {/* Contact info */}
          <div className="glass rounded-3xl overflow-hidden">
            <button
              className="w-full p-4 flex items-center justify-between"
              onClick={() => setExpandedSection(expandedSection === "contact" ? null : "contact")}
            >
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-lg">👤</span>
                </div>
                <div className="text-left">
                  <h3 className="font-semibold">Aloqa ma'lumotlari</h3>
                  {name && phone && (
                    <p className="text-sm text-muted-foreground">{name} • {phone}</p>
                  )}
                </div>
              </div>
              {expandedSection === "contact" ? (
                <ChevronUp className="h-5 w-5" />
              ) : (
                <ChevronDown className="h-5 w-5" />
              )}
            </button>
            
            {expandedSection === "contact" && (
              <div className="p-4 pt-0 space-y-4">
                <div>
                  <Label>Ism *</Label>
                  <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ismingiz"
                    className={cn("mt-1 rounded-xl glass", errors.name && "border-red-500")}
                  />
                  {errors.name && (
                    <p className="text-sm text-red-500 mt-1">{errors.name}</p>
                  )}
                </div>
                <div>
                  <Label>Telefon raqam *</Label>
                  <Input
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+998 90 123 45 67"
                    className={cn("mt-1 rounded-xl glass", errors.phone && "border-red-500")}
                  />
                  {errors.phone && (
                    <p className="text-sm text-red-500 mt-1">{errors.phone}</p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Delivery address */}
          <div className="glass rounded-3xl overflow-hidden">
            <button
              className="w-full p-4 flex items-center justify-between"
              onClick={() => setExpandedSection(expandedSection === "address" ? null : "address")}
            >
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-green-500/10 flex items-center justify-center">
                  <MapPin className="h-5 w-5 text-green-500" />
                </div>
                <div className="text-left">
                  <h3 className="font-semibold">Yetkazib berish manzili</h3>
                  {selectedAddress && (
                    <p className="text-sm text-muted-foreground truncate max-w-[200px]">
                      {addresses.find(a => a.id === selectedAddress)?.address}
                    </p>
                  )}
                </div>
              </div>
              {expandedSection === "address" ? (
                <ChevronUp className="h-5 w-5" />
              ) : (
                <ChevronDown className="h-5 w-5" />
              )}
            </button>
            
            {expandedSection === "address" && (
              <div className="p-4 pt-0 space-y-3">
                {addresses.map((addr) => (
                  <button
                    key={addr.id}
                    onClick={() => {
                      setSelectedAddress(addr.id);
                      setShowAddAddress(false);
                    }}
                    className={cn(
                      "w-full p-4 rounded-2xl text-left transition-all",
                      selectedAddress === addr.id
                        ? "bg-primary text-white"
                        : "bg-primary/5 hover:bg-primary/10"
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <MapPin className="h-5 w-5 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium">{addr.title || "Manzil"}</p>
                        <p className={cn(
                          "text-sm",
                          selectedAddress === addr.id ? "text-white/80" : "text-muted-foreground"
                        )}>
                          {addr.address}
                        </p>
                      </div>
                    </div>
                  </button>
                ))}

                <button
                  onClick={() => setShowAddAddress(!showAddAddress)}
                  className="w-full p-4 rounded-2xl border-2 border-dashed border-primary/30 text-primary hover:bg-primary/5 transition-colors flex items-center justify-center gap-2"
                >
                  <Plus className="h-5 w-5" />
                  Yangi manzil qo'shish
                </button>

                {showAddAddress && (
                  <div className="space-y-3 p-4 rounded-2xl bg-primary/5">
                    <Input
                      value={newAddress.address}
                      onChange={(e) => setNewAddress({ ...newAddress, address: e.target.value })}
                      placeholder="Manzil (ko'cha, uy)"
                      className={cn("rounded-xl", errors.newAddress && "border-red-500")}
                    />
                    <div className="grid grid-cols-3 gap-3">
                      <Input
                        value={newAddress.apartment}
                        onChange={(e) => setNewAddress({ ...newAddress, apartment: e.target.value })}
                        placeholder="Xonadon"
                        className="rounded-xl"
                      />
                      <Input
                        value={newAddress.entrance}
                        onChange={(e) => setNewAddress({ ...newAddress, entrance: e.target.value })}
                        placeholder="Kirish"
                        className="rounded-xl"
                      />
                      <Input
                        value={newAddress.floor}
                        onChange={(e) => setNewAddress({ ...newAddress, floor: e.target.value })}
                        placeholder="Qavat"
                        className="rounded-xl"
                      />
                    </div>
                    <Input
                      value={newAddress.comment}
                      onChange={(e) => setNewAddress({ ...newAddress, comment: e.target.value })}
                      placeholder="Izoh (kuryerga)"
                      className="rounded-xl"
                    />
                  </div>
                )}

                {errors.address && (
                  <p className="text-sm text-red-500">{errors.address}</p>
                )}
              </div>
            )}
          </div>

          {/* Delivery time */}
          <div className="glass rounded-3xl overflow-hidden">
            <button
              className="w-full p-4 flex items-center justify-between"
              onClick={() => setExpandedSection(expandedSection === "time" ? null : "time")}
            >
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-orange-500/10 flex items-center justify-center">
                  <Clock className="h-5 w-5 text-orange-500" />
                </div>
                <div className="text-left">
                  <h3 className="font-semibold">Yetkazib berish vaqti</h3>
                  <p className="text-sm text-muted-foreground">
                    {deliveryTime === "asap" ? "Imkon qadar tez" : `${scheduledDate} ${scheduledTimeSlot}`}
                  </p>
                </div>
              </div>
              {expandedSection === "time" ? (
                <ChevronUp className="h-5 w-5" />
              ) : (
                <ChevronDown className="h-5 w-5" />
              )}
            </button>
            
            {expandedSection === "time" && (
              <div className="p-4 pt-0 space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setDeliveryTime("asap")}
                    className={cn(
                      "p-4 rounded-2xl text-center transition-all",
                      deliveryTime === "asap"
                        ? "bg-primary text-white"
                        : "bg-primary/5 hover:bg-primary/10"
                    )}
                  >
                    <Truck className="h-6 w-6 mx-auto mb-2" />
                    <p className="font-medium">Tezkor</p>
                    <p className={cn(
                      "text-xs",
                      deliveryTime === "asap" ? "text-white/80" : "text-muted-foreground"
                    )}>
                      30-60 daqiqa
                    </p>
                  </button>
                  <button
                    onClick={() => setDeliveryTime("scheduled")}
                    className={cn(
                      "p-4 rounded-2xl text-center transition-all",
                      deliveryTime === "scheduled"
                        ? "bg-primary text-white"
                        : "bg-primary/5 hover:bg-primary/10"
                    )}
                  >
                    <Clock className="h-6 w-6 mx-auto mb-2" />
                    <p className="font-medium">Rejalashtirilgan</p>
                    <p className={cn(
                      "text-xs",
                      deliveryTime === "scheduled" ? "text-white/80" : "text-muted-foreground"
                    )}>
                      Vaqtni tanlang
                    </p>
                  </button>
                </div>

                {deliveryTime === "scheduled" && (
                  <div className="space-y-3">
                    <Input
                      type="date"
                      value={scheduledDate}
                      onChange={(e) => setScheduledDate(e.target.value)}
                      min={new Date().toISOString().split("T")[0]}
                      className="rounded-xl"
                    />
                    <div className="grid grid-cols-2 gap-2">
                      {timeSlots.map((slot) => (
                        <button
                          key={slot}
                          onClick={() => setScheduledTimeSlot(slot)}
                          className={cn(
                            "p-3 rounded-xl text-sm transition-all",
                            scheduledTimeSlot === slot
                              ? "bg-primary text-white"
                              : "bg-primary/5 hover:bg-primary/10"
                          )}
                        >
                          {slot}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Payment method */}
          <div className="glass rounded-3xl overflow-hidden">
            <button
              className="w-full p-4 flex items-center justify-between"
              onClick={() => setExpandedSection(expandedSection === "payment" ? null : "payment")}
            >
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                  <CreditCard className="h-5 w-5 text-blue-500" />
                </div>
                <div className="text-left">
                  <h3 className="font-semibold">To'lov usuli</h3>
                  <p className="text-sm text-muted-foreground">
                    {paymentMethods.find(p => p.id === paymentMethod)?.label}
                  </p>
                </div>
              </div>
              {expandedSection === "payment" ? (
                <ChevronUp className="h-5 w-5" />
              ) : (
                <ChevronDown className="h-5 w-5" />
              )}
            </button>
            
            {expandedSection === "payment" && (
              <div className="p-4 pt-0 grid grid-cols-2 gap-3">
                {paymentMethods.map((method) => (
                  <button
                    key={method.id}
                    onClick={() => setPaymentMethod(method.id as PaymentMethod)}
                    className={cn(
                      "p-4 rounded-2xl text-center transition-all",
                      paymentMethod === method.id
                        ? "bg-primary text-white"
                        : "bg-primary/5 hover:bg-primary/10"
                    )}
                  >
                    <span className="text-2xl">{method.icon}</span>
                    <p className="font-medium mt-2">{method.label}</p>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Comment */}
          <div className="glass rounded-3xl p-4">
            <Label>Buyurtmaga izoh</Label>
            <Input
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Qo'shimcha ma'lumot..."
              className="mt-2 rounded-xl glass"
            />
          </div>
        </div>

        {/* Order summary */}
        <div className="lg:col-span-1">
          <div className="glass rounded-3xl p-6 sticky top-28 space-y-6">
            <h2 className="text-lg font-bold">Buyurtma</h2>

            {/* Items */}
            <div className="space-y-3 max-h-60 overflow-y-auto">
              {cartItems.map((item) => (
                <div key={item.id} className="flex gap-3">
                  <div className="relative w-16 h-16 rounded-xl overflow-hidden flex-shrink-0">
                    <Image
                      src={item.image_url || "/placeholder-product.jpg"}
                      alt={item.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm line-clamp-2">{item.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {item.quantity} x {formatPrice(item.price)}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Summary */}
            <div className="space-y-3 text-sm border-t border-border/50 pt-4">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Mahsulotlar:</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Yetkazib berish:</span>
                <span className={cn(deliveryFee === 0 && "text-green-600")}>
                  {deliveryFee === 0 ? "Bepul" : formatPrice(deliveryFee)}
                </span>
              </div>
              <div className="border-t border-border/50 pt-3 flex justify-between text-lg font-bold">
                <span>Jami:</span>
                <span className="text-green-600">{formatPrice(total)}</span>
              </div>
            </div>

            {/* Error */}
            {errors.submit && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 text-red-500 text-sm">
                <AlertCircle className="h-5 w-5 flex-shrink-0" />
                {errors.submit}
              </div>
            )}

            {/* Submit */}
            <Button
              className="w-full h-14 rounded-2xl liquid-btn text-lg"
              onClick={handleSubmit}
              disabled={submitting}
            >
              {submitting ? (
                "Yuborilmoqda..."
              ) : (
                <>
                  <CheckCircle className="mr-2 h-5 w-5" />
                  Buyurtma berish
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
