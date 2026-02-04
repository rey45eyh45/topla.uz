'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { 
  HelpCircle, MessageCircle, Phone, Mail, Book, 
  ChevronRight, Send, Loader2, ExternalLink
} from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'

const faqs = [
  {
    question: "Mahsulot qanday qo'shiladi?",
    answer: "Mahsulotlar sahifasiga o'ting, 'Yangi mahsulot' tugmasini bosing. Mahsulot nomini, narxini, tavsifini va rasmini kiriting. Keyin 'Saqlash' tugmasini bosing."
  },
  {
    question: "Buyurtmalarni qanday boshqaraman?",
    answer: "Buyurtmalar sahifasida barcha buyurtmalarni ko'rishingiz mumkin. Har bir buyurtma uchun statusni o'zgartirish, tafsilotlarni ko'rish va mijoz bilan bog'lanish imkoniyati mavjud."
  },
  {
    question: "To'lovlar qachon amalga oshiriladi?",
    answer: "To'lovlar har hafta dushanba kunlari amalga oshiriladi. Minimal to'lov miqdori 100,000 so'm. Balans sahifasida to'lov tarixini ko'rishingiz mumkin."
  },
  {
    question: "Do'konimni qanday faollashtiraman?",
    answer: "Hujjatlar sahifasiga o'tib, barcha kerakli hujjatlarni yuklang. Admin tomonidan tasdiqlangandan so'ng do'koningiz avtomatik faollashadi."
  },
  {
    question: "Yetkazib berish zonalarini qanday sozlash mumkin?",
    answer: "Sozlamalar sahifasida yetkazib berish zonalarini belgilashingiz mumkin. Har bir zona uchun alohida narx va yetkazib berish vaqtini sozlash imkoniyati mavjud."
  },
  {
    question: "Aksiya yoki chegirmalarni qanday qo'shaman?",
    answer: "Mahsulotni tahrirlashda 'Chegirma narxi' maydoniga chegirmali narxni kiriting. Yoki admin bilan bog'lanib promo kod so'rang."
  },
  {
    question: "Reyting qanday hisoblanadi?",
    answer: "Reyting mijozlarning baholari asosida hisoblanadi. Yaxshi xizmat ko'rsatish, tez yetkazish va sifatli mahsulotlar reytingni oshiradi."
  },
  {
    question: "Mahsulot rasmlari uchun talablar qanday?",
    answer: "Rasmlar kamida 800x800 piksel o'lchamda bo'lishi kerak. JPG, PNG formatlar qo'llab-quvvatlanadi. Fayl hajmi 5MB dan oshmasligi kerak."
  }
]

const contacts = [
  {
    icon: Phone,
    title: "Telefon",
    value: "+998 99 999 99 99",
    description: "Dush-Juma 9:00 - 18:00",
    action: "tel:+998999999999"
  },
  {
    icon: MessageCircle,
    title: "Telegram",
    value: "@topla_support",
    description: "24/7 qo'llab-quvvatlash",
    action: "https://t.me/topla_support"
  },
  {
    icon: Mail,
    title: "Email",
    value: "support@topla.uz",
    description: "Javob 24 soat ichida",
    action: "mailto:support@topla.uz"
  }
]

export default function VendorHelpPage() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    subject: '',
    message: ''
  })

  const handleSubmit = async () => {
    if (!formData.subject || !formData.message) {
      toast({ title: "Xatolik", description: "Barcha maydonlarni to'ldiring", variant: "destructive" })
      return
    }

    setLoading(true)
    // TODO: Send support request
    await new Promise(resolve => setTimeout(resolve, 1000))
    toast({ title: "Yuborildi", description: "Xabaringiz qabul qilindi. Tez orada javob beramiz." })
    setFormData({ subject: '', message: '' })
    setLoading(false)
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h1 className="text-xl sm:text-3xl font-bold tracking-tight">Yordam</h1>
        <p className="text-sm sm:text-base text-muted-foreground">Savollaringizga javob toping yoki biz bilan bog'laning</p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {contacts.map((contact, i) => (
          <a key={i} href={contact.action} target="_blank" rel="noopener noreferrer">
            <Card className="hover:bg-muted/50 transition-colors cursor-pointer h-full">
              <CardContent className="p-4 flex items-center gap-4">
                <div className="p-3 rounded-lg bg-primary/10">
                  <contact.icon className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="font-medium">{contact.title}</p>
                  <p className="text-sm text-primary">{contact.value}</p>
                  <p className="text-xs text-muted-foreground">{contact.description}</p>
                </div>
                <ExternalLink className="h-4 w-4 text-muted-foreground" />
              </CardContent>
            </Card>
          </a>
        ))}
      </div>

      {/* FAQ */}
      <Card>
        <CardHeader className="p-3 sm:p-6">
          <CardTitle className="text-base sm:text-lg flex items-center gap-2">
            <Book className="h-5 w-5" />
            Ko'p so'raladigan savollar
          </CardTitle>
        </CardHeader>
        <CardContent className="p-3 sm:p-6 pt-0">
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, i) => (
              <AccordionItem key={i} value={`item-${i}`}>
                <AccordionTrigger className="text-left text-sm sm:text-base">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </CardContent>
      </Card>

      {/* Contact Form */}
      <Card>
        <CardHeader className="p-3 sm:p-6">
          <CardTitle className="text-base sm:text-lg flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            Xabar yuborish
          </CardTitle>
          <CardDescription>Savolingiz yoki muammo bo'lsa, bizga yozing</CardDescription>
        </CardHeader>
        <CardContent className="p-3 sm:p-6 pt-0 space-y-4">
          <div className="space-y-2">
            <Label>Mavzu</Label>
            <Input
              placeholder="Masalan: To'lov bilan bog'liq savol"
              value={formData.subject}
              onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label>Xabar</Label>
            <Textarea
              placeholder="Savolingizni batafsil yozing..."
              rows={4}
              value={formData.message}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFormData({ ...formData, message: e.target.value })}
            />
          </div>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Send className="h-4 w-4 mr-2" />
            )}
            Yuborish
          </Button>
        </CardContent>
      </Card>

      {/* Resources */}
      <Card>
        <CardHeader className="p-3 sm:p-6">
          <CardTitle className="text-base sm:text-lg">Foydali manbalar</CardTitle>
        </CardHeader>
        <CardContent className="p-3 sm:p-6 pt-0">
          <div className="space-y-2">
            {[
              { title: "Boshlang'ich qo'llanma", desc: "Platformadan foydalanishni o'rganish" },
              { title: "Video darsliklar", desc: "Qadamba-qadam ko'rsatmalar" },
              { title: "Siyosat va qoidalar", desc: "Platformada ishlash qoidalari" },
              { title: "API dokumentatsiyasi", desc: "Texnik integratsiya uchun" }
            ].map((item, i) => (
              <button 
                key={i} 
                className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-muted transition-colors text-left"
                onClick={() => toast({ title: "Tez orada", description: "Bu bo'lim tayyorlanmoqda" })}
              >
                <div>
                  <p className="font-medium text-sm">{item.title}</p>
                  <p className="text-xs text-muted-foreground">{item.desc}</p>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
