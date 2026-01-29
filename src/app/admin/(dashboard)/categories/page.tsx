'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { getCategories, createCategory, updateCategory, deleteCategory, toggleCategoryStatus, type Category } from './actions'
import { Loader2, Plus, Edit, Trash2, ChevronDown, ChevronRight, Power } from 'lucide-react'
import { useToast } from "@/components/ui/use-toast"

const iconOptions = [
  { value: 'cpu', label: '💻 Elektronika' },
  { value: 'shirt', label: '👕 Kiyim' },
  { value: 'home', label: '🏠 Uy' },
  { value: 'dumbbell', label: '🏋️ Sport' },
  { value: 'heart', label: '💄 Go\'zallik' },
  { value: 'baby', label: '👶 Bolalar' },
  { value: 'utensils', label: '🍽️ Oziq-ovqat' },
  { value: 'car', label: '🚗 Avtomobil' },
  { value: 'book', label: '📚 Kitoblar' },
  { value: 'footprints', label: '👞 Oyoq kiyimlar' },
]

export default function AdminCategoriesPage() {
  const { toast } = useToast()
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  
  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null)
  const [expandedCategories, setExpandedCategories] = useState<string[]>([])

  // Form state
  const [formData, setFormData] = useState({
    nameUz: '',
    nameRu: '',
    icon: '',
    parentId: 'none',
  })

  const loadCategories = async () => {
    try {
      setLoading(true)
      const data = await getCategories()
      setCategories(data)
    } catch (error) {
      console.error(error)
      toast({
        title: "Xatolik",
        description: "Kategoriyalarni yuklashda xatolik yuz berdi",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadCategories()
  }, [])

  const toggleExpand = (categoryId: string) => {
    setExpandedCategories(prev =>
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    )
  }

  const handleAdd = async () => {
    try {
      setActionLoading(true)
      const fd = new FormData()
      fd.append('name_uz', formData.nameUz)
      fd.append('name_ru', formData.nameRu)
      fd.append('icon', formData.icon)
      if (formData.parentId && formData.parentId !== 'none') {
        fd.append('parent_id', formData.parentId)
      }

      await createCategory(fd)
      await loadCategories()
      
      setAddDialogOpen(false)
      setFormData({ nameUz: '', nameRu: '', icon: '', parentId: 'none' })
      toast({ title: "Muvaffaqiyatli", description: "Kategoriya qo'shildi" })
    } catch (error) {
      toast({ title: "Xatolik", description: "Kategoriya qo'shishda xatolik", variant: "destructive" })
    } finally {
      setActionLoading(false)
    }
  }

  const handleEdit = async () => {
    if (!selectedCategory) return

    try {
      setActionLoading(true)
      const fd = new FormData()
      fd.append('name_uz', formData.nameUz)
      fd.append('name_ru', formData.nameRu)
      fd.append('icon', formData.icon)
      
      await updateCategory(selectedCategory.id, fd)
      await loadCategories()
      
      setEditDialogOpen(false)
      setSelectedCategory(null)
      toast({ title: "Muvaffaqiyatli", description: "Kategoriya yangilandi" })
    } catch (error) {
      toast({ title: "Xatolik", description: "Kategoriya yangilashda xatolik", variant: "destructive" })
    } finally {
      setActionLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if(!confirm("Haqiqatan ham o'chirmoqchimisiz?")) return;

    try {
      await deleteCategory(id)
      await loadCategories()
      toast({ title: "Muvaffaqiyatli", description: "Kategoriya o'chirildi" })
    } catch (error) {
      toast({ title: "Xatolik", description: "Kategoriya o'chirishda xatolik", variant: "destructive" })
    }
  }

  const handleToggleStatus = async (category: Category) => {
    try {
      await toggleCategoryStatus(category.id, !category.is_active)
      await loadCategories()
    } catch (error) {
       toast({ title: "Xatolik", description: "Status o'zgartirishda xatolik", variant: "destructive" })
    }
  }

  const openEditDialog = (category: Category) => {
    setSelectedCategory(category)
    setFormData({
      nameUz: category.name_uz,
      nameRu: category.name_ru || '',
      icon: category.icon || '',
      parentId: category.parent_id || 'none',
    })
    setEditDialogOpen(true)
  }

  if (loading) {
    return <div className="flex justify-center p-8"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Kategoriyalar</h1>
          <p className="text-muted-foreground">
            Mahsulot kategoriyalarini boshqaring
          </p>
        </div>
        <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="mr-2 h-4 w-4" /> Kategoriya qo'shish</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Yangi kategoriya</DialogTitle>
              <DialogDescription>
                Yangi kategoriya yoki subcategoriya qo'shing
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Nomi (O'zbek)</Label>
                  <Input
                    value={formData.nameUz}
                    onChange={(e) => setFormData({ ...formData, nameUz: e.target.value })}
                    placeholder="Elektronika"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Nomi (Rus)</Label>
                  <Input
                    value={formData.nameRu}
                    onChange={(e) => setFormData({ ...formData, nameRu: e.target.value })}
                    placeholder="Электроника"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Icon</Label>
                <Select
                  value={formData.icon}
                  onValueChange={(value) => setFormData({ ...formData, icon: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Icon tanlang" />
                  </SelectTrigger>
                  <SelectContent>
                    {iconOptions.map((icon) => (
                      <SelectItem key={icon.value} value={icon.value}>
                        {icon.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Asosiy kategoriya (ixtiyoriy)</Label>
                <Select
                  value={formData.parentId}
                  onValueChange={(value) => setFormData({ ...formData, parentId: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Asosiy kategoriya tanlang" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Asosiy kategoriya (Ota kategoriya)</SelectItem>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.name_uz}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setAddDialogOpen(false)}>
                Bekor qilish
              </Button>
              <Button onClick={handleAdd} disabled={actionLoading}>
                {actionLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Qo'shish
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Kategoriyalar ro'yxati</CardTitle>
          <CardDescription>
            Jami {categories.length} ta asosiy kategoriya
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12"></TableHead>
                <TableHead>Nomi (UZ)</TableHead>
                <TableHead>Nomi (RU)</TableHead>
                <TableHead>Subcategoriyalar</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Amallar</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {categories.length === 0 ? (
                <TableRow>
                   <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">Kategoriyalar mavjud emas</TableCell>
                </TableRow>
              ) : categories.map((category) => (
                <>
                  <TableRow key={category.id} className="bg-muted/30">
                    <TableCell>
                      {category.children && category.children.length > 0 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleExpand(category.id)}
                          className="h-8 w-8 p-0"
                        >
                          {expandedCategories.includes(category.id) ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                        </Button>
                      )}
                    </TableCell>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">
                          {(() => {
                            if (!category.icon) return '📦';
                            const option = iconOptions.find(i => i.value === category.icon);
                            return option ? option.label.split(' ')[0] : category.icon;
                          })()}
                        </span>
                        {category.name_uz}
                      </div>
                    </TableCell>
                    <TableCell>{category.name_ru}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">
                        {category.children?.length || 0} ta
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant={category.is_active ? "default" : "secondary"}
                        className={category.is_active ? 'bg-green-500 hover:bg-green-600' : 'bg-gray-500 hover:bg-gray-600'}
                      >
                        {category.is_active ? 'Faol' : 'Nofaol'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEditDialog(category)}
                          title="Tahrirlash"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                           variant="ghost"
                           size="sm"
                           onClick={() => handleToggleStatus(category)}
                           title={category.is_active ? "O'chirish (Status)" : "Yoqish"}
                        >
                            <Power className={`h-4 w-4 ${category.is_active ? 'text-green-500' : 'text-gray-400'}`} />
                        </Button>
                         <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(category.id)}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50"
                          title="Butunlay o'chirish"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                  {/* Subcategories */}
                  {expandedCategories.includes(category.id) &&
                    category.children?.map((sub) => (
                      <TableRow key={sub.id} className="bg-white hover:bg-gray-50">
                        <TableCell></TableCell>
                        <TableCell className="pl-12 text-sm">
                           ↳ {sub.name_uz}
                        </TableCell>
                        <TableCell className="text-sm">{sub.name_ru}</TableCell>
                        <TableCell>-</TableCell>
                        <TableCell>
                          <Badge 
                             variant="outline" 
                             className={sub.is_active ? 'border-green-500 text-green-500' : 'border-gray-400 text-gray-400'}
                          >
                             {sub.is_active ? 'Faol' : 'Nofaol'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm" onClick={() => openEditDialog(sub)}>
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleDelete(sub.id)} className="text-red-500">
                             <Trash2 className="h-3 w-3" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                </>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Kategoriyani tahrirlash</DialogTitle>
            <DialogDescription>
              "{selectedCategory?.name_uz}" kategoriyasini tahrirlang
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Nomi (O'zbek)</Label>
                <Input
                  value={formData.nameUz}
                  onChange={(e) => setFormData({ ...formData, nameUz: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Nomi (Rus)</Label>
                <Input
                  value={formData.nameRu}
                  onChange={(e) => setFormData({ ...formData, nameRu: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Icon</Label>
              <Select
                value={formData.icon}
                onValueChange={(value) => setFormData({ ...formData, icon: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {iconOptions.map((icon) => (
                    <SelectItem key={icon.value} value={icon.value}>
                      {icon.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              Bekor qilish
            </Button>
            <Button onClick={handleEdit} disabled={actionLoading}>
               {actionLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
               Saqlash
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
