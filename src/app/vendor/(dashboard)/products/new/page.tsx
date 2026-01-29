"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Upload, X, Plus, Loader2, Save } from "lucide-react";

const categories = [
  { id: "1", name: "Elektronika", subcategories: ["Smartfonlar", "Noutbuklar", "Planshetlar", "Quloqchinlar", "Smart soatlar", "Televizorlar"] },
  { id: "2", name: "Kiyim", subcategories: ["Erkaklar kiyimi", "Ayollar kiyimi", "Bolalar kiyimi", "Poyabzallar", "Aksessuarlar"] },
  { id: "3", name: "Uy-ro'zg'or", subcategories: ["Oshxona jihozlari", "Mebel", "Yoritish", "Uy bezaklari"] },
];

export default function NewProductPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("basic");
  
  // Basic info
  const [nameUz, setNameUz] = useState("");
  const [nameRu, setNameRu] = useState("");
  const [descriptionUz, setDescriptionUz] = useState("");
  const [descriptionRu, setDescriptionRu] = useState("");
  
  // Pricing
  const [price, setPrice] = useState("");
  const [comparePrice, setComparePrice] = useState("");
  const [stock, setStock] = useState("");
  const [sku, setSku] = useState("");
  
  // Category
  const [category, setCategory] = useState("");
  const [subcategory, setSubcategory] = useState("");
  
  // Images
  const [images, setImages] = useState<string[]>([]);

  const selectedCategory = categories.find((c) => c.id === category);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // TODO: Implement actual product creation
    setTimeout(() => {
      router.push("/vendor/products");
    }, 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/vendor/products">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Yangi mahsulot</h2>
          <p className="text-muted-foreground">Yangi mahsulot qo'shish</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Info */}
            <Card>
              <CardHeader>
                <CardTitle>Asosiy ma'lumotlar</CardTitle>
                <CardDescription>Mahsulot nomi va tavsifi</CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="mb-4">
                    <TabsTrigger value="basic">O'zbekcha</TabsTrigger>
                    <TabsTrigger value="russian">Ruscha</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="basic" className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="nameUz">Mahsulot nomi (O'zbekcha)</Label>
                      <Input
                        id="nameUz"
                        placeholder="iPhone 15 Pro Max"
                        value={nameUz}
                        onChange={(e) => setNameUz(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="descriptionUz">Tavsif (O'zbekcha)</Label>
                      <textarea
                        id="descriptionUz"
                        className="flex min-h-[150px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        placeholder="Mahsulot haqida batafsil ma'lumot..."
                        value={descriptionUz}
                        onChange={(e) => setDescriptionUz(e.target.value)}
                      />
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="russian" className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="nameRu">Mahsulot nomi (Ruscha)</Label>
                      <Input
                        id="nameRu"
                        placeholder="iPhone 15 Pro Max"
                        value={nameRu}
                        onChange={(e) => setNameRu(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="descriptionRu">Tavsif (Ruscha)</Label>
                      <textarea
                        id="descriptionRu"
                        className="flex min-h-[150px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        placeholder="Подробная информация о продукте..."
                        value={descriptionRu}
                        onChange={(e) => setDescriptionRu(e.target.value)}
                      />
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>

            {/* Images */}
            <Card>
              <CardHeader>
                <CardTitle>Rasmlar</CardTitle>
                <CardDescription>Mahsulot rasmlari (kamida 1 ta)</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {images.map((image, i) => (
                    <div key={i} className="relative aspect-square bg-muted rounded-lg">
                      <img src={image} alt="" className="w-full h-full object-cover rounded-lg" />
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute top-1 right-1 h-6 w-6"
                        onClick={() => setImages(images.filter((_, index) => index !== i))}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                  <div className="aspect-square border-2 border-dashed rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-primary/50 transition-colors">
                    <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                    <p className="text-xs text-muted-foreground text-center px-2">
                      Rasm yuklash
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Pricing */}
            <Card>
              <CardHeader>
                <CardTitle>Narx va ombor</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="price">Narx (so'm)</Label>
                    <Input
                      id="price"
                      type="number"
                      placeholder="1000000"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="comparePrice">Eski narx (ixtiyoriy)</Label>
                    <Input
                      id="comparePrice"
                      type="number"
                      placeholder="1200000"
                      value={comparePrice}
                      onChange={(e) => setComparePrice(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="stock">Ombordagi miqdor</Label>
                    <Input
                      id="stock"
                      type="number"
                      placeholder="10"
                      value={stock}
                      onChange={(e) => setStock(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="sku">SKU (ixtiyoriy)</Label>
                    <Input
                      id="sku"
                      placeholder="IPHONE-15-PRO"
                      value={sku}
                      onChange={(e) => setSku(e.target.value)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Category */}
            <Card>
              <CardHeader>
                <CardTitle>Kategoriya</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Asosiy kategoriya</Label>
                  <Select value={category} onValueChange={(val) => {
                    setCategory(val);
                    setSubcategory("");
                  }}>
                    <SelectTrigger>
                      <SelectValue placeholder="Tanlang" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>
                          {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {selectedCategory && (
                  <div className="space-y-2">
                    <Label>Subkategoriya</Label>
                    <Select value={subcategory} onValueChange={setSubcategory}>
                      <SelectTrigger>
                        <SelectValue placeholder="Tanlang" />
                      </SelectTrigger>
                      <SelectContent>
                        {selectedCategory.subcategories.map((sub) => (
                          <SelectItem key={sub} value={sub}>
                            {sub}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Actions */}
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-3">
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saqlanmoqda...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Saqlash
                      </>
                    )}
                  </Button>
                  <Button type="button" variant="outline" className="w-full" asChild>
                    <Link href="/vendor/products">Bekor qilish</Link>
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground text-center mt-4">
                  Mahsulot moderatsiyadan o'tgandan so'ng saytda paydo bo'ladi
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </div>
  );
}
