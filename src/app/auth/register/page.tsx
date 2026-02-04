"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  User,
  Phone,
  ArrowLeft,
  ShoppingBag,
  CheckCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";

export default function RegisterPage() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const supabase = createClient();

  function updateFormData(key: string, value: string) {
    setFormData((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError("Parollar mos kelmaydi");
      return;
    }

    if (formData.password.length < 6) {
      setError("Parol kamida 6 ta belgidan iborat bo'lishi kerak");
      return;
    }

    setLoading(true);

    try {
      // Sign up
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.fullName,
            phone: formData.phone,
          },
        },
      });

      if (authError) {
        if (authError.message.includes("already registered")) {
          setError("Bu email allaqachon ro'yxatdan o'tgan");
        } else {
          setError(authError.message);
        }
        return;
      }

      // Create profile
      if (authData.user) {
        await supabase.from("profiles").upsert({
          id: authData.user.id,
          full_name: formData.fullName,
          phone: formData.phone,
          email: formData.email,
        });
      }

      setSuccess(true);
    } catch (err) {
      setError("Xatolik yuz berdi");
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="min-h-screen gradient-bg relative overflow-hidden flex items-center justify-center p-4">
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="blob blob-1" />
          <div className="blob blob-2" />
          <div className="blob blob-3" />
        </div>

        <div className="glass rounded-3xl p-8 max-w-md w-full text-center fade-up relative z-10">
          <div className="h-20 w-20 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="h-10 w-10 text-green-500" />
          </div>
          <h2 className="text-2xl font-bold mb-3">Ro'yxatdan o'tdingiz!</h2>
          <p className="text-muted-foreground mb-6">
            Emailingizga tasdiqlash xabari yuborildi. Iltimos, emailingizni tekshiring.
          </p>
          <Link href="/auth/login">
            <Button className="liquid-btn">Kirish sahifasiga o'tish</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen gradient-bg relative overflow-hidden flex items-center justify-center p-4">
      {/* Background blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="blob blob-1" />
        <div className="blob blob-2" />
        <div className="blob blob-3" />
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Back button */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground mb-8 hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Bosh sahifa
        </Link>

        <div className="glass rounded-3xl p-8 fade-up">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-primary/30">
              <ShoppingBag className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold">Ro'yxatdan o'ting</h1>
            <p className="text-muted-foreground mt-1">Yangi hisob yarating</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="fullName">To'liq ism</Label>
              <div className="relative mt-1">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  id="fullName"
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => updateFormData("fullName", e.target.value)}
                  placeholder="Ism Familiya"
                  className="pl-10 h-12 rounded-xl glass"
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="email">Email</Label>
              <div className="relative mt-1">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => updateFormData("email", e.target.value)}
                  placeholder="email@example.com"
                  className="pl-10 h-12 rounded-xl glass"
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="phone">Telefon raqam</Label>
              <div className="relative mt-1">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => updateFormData("phone", e.target.value)}
                  placeholder="+998 90 123 45 67"
                  className="pl-10 h-12 rounded-xl glass"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="password">Parol</Label>
              <div className="relative mt-1">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={(e) => updateFormData("password", e.target.value)}
                  placeholder="••••••••"
                  className="pl-10 pr-10 h-12 rounded-xl glass"
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            <div>
              <Label htmlFor="confirmPassword">Parolni tasdiqlang</Label>
              <div className="relative mt-1">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  id="confirmPassword"
                  type={showPassword ? "text" : "password"}
                  value={formData.confirmPassword}
                  onChange={(e) => updateFormData("confirmPassword", e.target.value)}
                  placeholder="••••••••"
                  className="pl-10 h-12 rounded-xl glass"
                  required
                />
              </div>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-red-500/10 text-red-500 text-sm text-center">
                {error}
              </div>
            )}

            <Button
              type="submit"
              className="w-full h-12 rounded-xl liquid-btn"
              disabled={loading}
            >
              {loading ? "Kuting..." : "Ro'yxatdan o'tish"}
            </Button>

            <p className="text-xs text-center text-muted-foreground">
              Ro'yxatdan o'tish orqali siz{" "}
              <Link href="/terms" className="text-primary hover:underline">
                foydalanish shartlari
              </Link>{" "}
              va{" "}
              <Link href="/privacy" className="text-primary hover:underline">
                maxfiylik siyosati
              </Link>
              ga rozilik bildirasiz.
            </p>
          </form>

          {/* Login link */}
          <p className="mt-8 text-center text-sm text-muted-foreground">
            Hisobingiz bormi?{" "}
            <Link
              href="/auth/login"
              className="text-primary font-medium hover:underline"
            >
              Kirish
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
