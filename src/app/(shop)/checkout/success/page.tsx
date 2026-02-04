"use client";

import { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CheckCircle, Package, ArrowRight, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import Confetti from "react-confetti";

function SuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("order");
  const [showConfetti, setShowConfetti] = useState(true);
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    setWindowSize({
      width: window.innerWidth,
      height: window.innerHeight,
    });

    const timer = setTimeout(() => {
      setShowConfetti(false);
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="container px-4 sm:px-6 min-h-[80vh] flex items-center justify-center">
      {showConfetti && (
        <Confetti
          width={windowSize.width}
          height={windowSize.height}
          recycle={false}
          numberOfPieces={200}
          colors={["#6366f1", "#8b5cf6", "#ec4899", "#22c55e", "#eab308"]}
        />
      )}

      <div className="glass rounded-3xl p-8 sm:p-12 text-center max-w-lg mx-auto fade-up">
        <div className="relative inline-block mb-6">
          <div className="h-24 w-24 rounded-full bg-green-500/20 flex items-center justify-center mx-auto">
            <CheckCircle className="h-12 w-12 text-green-500" />
          </div>
          <div className="absolute -top-2 -right-2 h-8 w-8 rounded-full bg-primary flex items-center justify-center animate-bounce">
            <span className="text-white text-lg">🎉</span>
          </div>
        </div>

        <h1 className="text-2xl sm:text-3xl font-bold mb-3">
          Buyurtmangiz qabul qilindi!
        </h1>
        <p className="text-muted-foreground mb-6">
          Tez orada sizga aloqaga chiqamiz va buyurtmangizni yetkazib beramiz
        </p>

        {orderId && (
          <div className="glass rounded-2xl p-4 mb-6">
            <p className="text-sm text-muted-foreground">Buyurtma raqami:</p>
            <p className="text-lg font-bold text-primary">#{orderId.slice(0, 8).toUpperCase()}</p>
          </div>
        )}

        <div className="space-y-4 mb-8">
          <div className="flex items-center gap-3 text-left">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Package className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="font-medium">Buyurtma tayyorlanmoqda</p>
              <p className="text-sm text-muted-foreground">Taxminan 30-60 daqiqa</p>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <Link href="/" className="flex-1">
            <Button variant="outline" className="w-full h-12 rounded-xl glass">
              <Home className="mr-2 h-4 w-4" />
              Bosh sahifa
            </Button>
          </Link>
          {orderId && (
            <Link href={`/profile/orders/${orderId}`} className="flex-1">
              <Button className="w-full h-12 rounded-xl liquid-btn">
                Buyurtmani kuzatish
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={
      <div className="container px-4 sm:px-6 min-h-[80vh] flex items-center justify-center">
        <div className="skeleton h-96 w-full max-w-lg rounded-3xl" />
      </div>
    }>
      <SuccessContent />
    </Suspense>
  );
}
