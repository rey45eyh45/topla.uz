"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ShoppingBag, Loader2, CheckCircle, ArrowRight, ArrowLeft, Upload, Store, User, FileText } from "lucide-react";

export default function VendorRegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  
  // Step 1: Personal Info
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  
  // Step 2: Shop Info
  const [shopName, setShopName] = useState("");
  const [shopDescription, setShopDescription] = useState("");
  const [category, setCategory] = useState("");
  const [city, setCity] = useState("");
  const [address, setAddress] = useState("");
  
  // Step 3: Documents
  const [businessType, setBusinessType] = useState("");

  const handleNext = () => {
    if (step < 3) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // TODO: Implement actual registration
    setTimeout(() => {
      setStep(4); // Success state
      setIsLoading(false);
    }, 2000);
  };

  // Success State
  if (step === 4) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/50 p-4">
        <Card className="w-full max-w-md text-center">
          <CardContent className="pt-10 pb-8">
            <div className="h-16 w-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Ariza qabul qilindi!</h2>
            <p className="text-muted-foreground mb-6">
              Arizangiz muvaffaqiyatli yuborildi. Adminlar tekshirib chiqqanidan so'ng sizga xabar beramiz. 
              Bu odatda 1-2 ish kunini oladi.
            </p>
            <div className="space-y-3">
              <Button asChild className="w-full">
                <Link href="/vendor/login">Kabinetga o'tish</Link>
              </Button>
              <Button variant="outline" asChild className="w-full">
                <Link href="/">Bosh sahifaga qaytish</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <div className="h-10 w-10 rounded-xl bg-primary flex items-center justify-center">
              <ShoppingBag className="h-6 w-6 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold">TOPLA.UZ</span>
          </Link>
          <h1 className="text-2xl font-bold">Sotuvchi bo'lish</h1>
          <p className="text-muted-foreground">Do'koningizni ro'yxatdan o'tkazing</p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center gap-4">
            {[
              { num: 1, icon: User, label: "Shaxsiy" },
              { num: 2, icon: Store, label: "Do'kon" },
              { num: 3, icon: FileText, label: "Hujjatlar" },
            ].map((s, i) => (
              <div key={s.num} className="flex items-center">
                <div
                  className={`flex items-center gap-2 px-4 py-2 rounded-full ${
                    step >= s.num
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  <s.icon className="h-4 w-4" />
                  <span className="text-sm font-medium hidden sm:inline">{s.label}</span>
                  <span className="text-sm font-medium sm:hidden">{s.num}</span>
                </div>
                {i < 2 && (
                  <div
                    className={`w-12 h-0.5 mx-2 ${
                      step > s.num ? "bg-primary" : "bg-muted"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Form Card */}
        <Card>
          <CardHeader>
            <CardTitle>
              {step === 1 && "Shaxsiy ma'lumotlar"}
              {step === 2 && "Do'kon ma'lumotlari"}
              {step === 3 && "Hujjatlar"}
            </CardTitle>
            <CardDescription>
              {step === 1 && "O'zingiz haqingizda ma'lumot kiriting"}
              {step === 2 && "Do'koningiz haqida ma'lumot kiriting"}
              {step === 3 && "Ro'yxatdan o'tish uchun kerakli hujjatlarni yuklang"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit}>
              {/* Step 1: Personal Info */}
              {step === 1 && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="fullName">To'liq ism</Label>
                    <Input
                      id="fullName"
                      placeholder="Aziz Karimov"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Telefon raqam</Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="+998 90 123 45 67"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="email@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Parol</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="Kamida 8 ta belgi"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      minLength={8}
                    />
                  </div>
                </div>
              )}

              {/* Step 2: Shop Info */}
              {step === 2 && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="shopName">Do'kon nomi</Label>
                    <Input
                      id="shopName"
                      placeholder="TechStore"
                      value={shopName}
                      onChange={(e) => setShopName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="shopDescription">Do'kon haqida</Label>
                    <textarea
                      id="shopDescription"
                      className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      placeholder="Do'koningiz haqida qisqacha ma'lumot..."
                      value={shopDescription}
                      onChange={(e) => setShopDescription(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Asosiy kategoriya</Label>
                    <Select value={category} onValueChange={setCategory}>
                      <SelectTrigger>
                        <SelectValue placeholder="Kategoriyani tanlang" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="electronics">Elektronika</SelectItem>
                        <SelectItem value="clothing">Kiyim</SelectItem>
                        <SelectItem value="home">Uy-ro'zg'or</SelectItem>
                        <SelectItem value="beauty">Go'zallik</SelectItem>
                        <SelectItem value="sport">Sport</SelectItem>
                        <SelectItem value="food">Oziq-ovqat</SelectItem>
                        <SelectItem value="kids">Bolalar</SelectItem>
                        <SelectItem value="other">Boshqa</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Shahar</Label>
                      <Select value={city} onValueChange={setCity}>
                        <SelectTrigger>
                          <SelectValue placeholder="Shahar" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="tashkent">Toshkent</SelectItem>
                          <SelectItem value="samarkand">Samarqand</SelectItem>
                          <SelectItem value="bukhara">Buxoro</SelectItem>
                          <SelectItem value="namangan">Namangan</SelectItem>
                          <SelectItem value="andijan">Andijon</SelectItem>
                          <SelectItem value="fergana">Farg'ona</SelectItem>
                          <SelectItem value="other">Boshqa</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="address">Manzil</Label>
                      <Input
                        id="address"
                        placeholder="Ko'cha, uy"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Step 3: Documents */}
              {step === 3 && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Biznes turi</Label>
                    <Select value={businessType} onValueChange={setBusinessType}>
                      <SelectTrigger>
                        <SelectValue placeholder="Biznes turini tanlang" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="individual">Jismoniy shaxs</SelectItem>
                        <SelectItem value="ip">Yakka tartibdagi tadbirkor (YaTT)</SelectItem>
                        <SelectItem value="llc">Mas'uliyati cheklangan jamiyat (MChJ)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Passport / ID karta nusxasi</Label>
                    <div className="border-2 border-dashed rounded-lg p-8 text-center hover:border-primary/50 transition-colors cursor-pointer">
                      <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">
                        Faylni tanlash uchun bosing yoki shu yerga tashlang
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        PNG, JPG, PDF (max 5MB)
                      </p>
                    </div>
                  </div>

                  {businessType && businessType !== "individual" && (
                    <div className="space-y-2">
                      <Label>Guvohnoma nusxasi</Label>
                      <div className="border-2 border-dashed rounded-lg p-8 text-center hover:border-primary/50 transition-colors cursor-pointer">
                        <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">
                          YaTT yoki MChJ guvohnomasi
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          PNG, JPG, PDF (max 5MB)
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="bg-muted/50 rounded-lg p-4">
                    <p className="text-sm text-muted-foreground">
                      📋 Hujjatlaringiz xavfsiz saqlanadi va faqat tekshirish maqsadida ishlatiladi.
                      Shaxsiy ma'lumotlaringiz uchinchi shaxslarga berilmaydi.
                    </p>
                  </div>
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="flex justify-between mt-6">
                {step > 1 ? (
                  <Button type="button" variant="outline" onClick={handleBack}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Orqaga
                  </Button>
                ) : (
                  <div />
                )}
                
                {step < 3 ? (
                  <Button type="button" onClick={handleNext}>
                    Keyingi
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                ) : (
                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Yuborilmoqda...
                      </>
                    ) : (
                      <>
                        Ariza yuborish
                        <CheckCircle className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>
                )}
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Login Link */}
        <p className="text-center text-sm text-muted-foreground mt-6">
          Allaqachon ro'yxatdan o'tganmisiz?{" "}
          <Link href="/vendor/login" className="text-primary hover:underline font-medium">
            Kirish
          </Link>
        </p>
      </div>
    </div>
  );
}
