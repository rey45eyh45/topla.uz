'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { 
  FileText, Upload, CheckCircle, Clock, XCircle, AlertTriangle,
  FileImage, FilePlus, Loader2
} from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'

type Document = {
  id: string
  name: string
  type: 'license' | 'certificate' | 'id' | 'tax' | 'other'
  status: 'pending' | 'approved' | 'rejected'
  file_url: string | null
  uploaded_at: string
  reviewed_at: string | null
  notes: string | null
}

// Mock data - will be replaced with real data from actions.ts
const mockDocuments: Document[] = [
  {
    id: '1',
    name: 'Biznes litsenziya',
    type: 'license',
    status: 'approved',
    file_url: null,
    uploaded_at: '2024-01-15T10:00:00Z',
    reviewed_at: '2024-01-16T14:30:00Z',
    notes: null
  },
  {
    id: '2',
    name: 'Soliq guvohnomasi',
    type: 'tax',
    status: 'pending',
    file_url: null,
    uploaded_at: '2024-01-20T09:00:00Z',
    reviewed_at: null,
    notes: null
  },
  {
    id: '3',
    name: 'Sifat sertifikati',
    type: 'certificate',
    status: 'rejected',
    file_url: null,
    uploaded_at: '2024-01-10T11:00:00Z',
    reviewed_at: '2024-01-11T16:00:00Z',
    notes: 'Hujjat noaniq. Iltimos, yangi rasm yuklang.'
  }
]

const requiredDocs = [
  { type: 'license', name: "Biznes litsenziya", description: "Faoliyat uchun litsenziya yoki guvohnoma" },
  { type: 'certificate', name: "Sifat sertifikati", description: "Mahsulot sifat sertifikati (agar bo'lsa)" },
  { type: 'tax', name: "Soliq guvohnomasi", description: "Soliq to'lovchisi sifatida ro'yxatga olinganlik" },
  { type: 'id', name: "Shaxsni tasdiqlash", description: "Passport yoki ID karta nusxasi" }
]

export default function VendorDocumentsPage() {
  const { toast } = useToast()
  const [documents] = useState<Document[]>(mockDocuments)
  const [uploading, setUploading] = useState(false)

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="h-3 w-3 mr-1" /> Tasdiqlangan</Badge>
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800"><Clock className="h-3 w-3 mr-1" /> Kutilmoqda</Badge>
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800"><XCircle className="h-3 w-3 mr-1" /> Rad etilgan</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getDocByType = (type: string) => documents.find(d => d.type === type)

  const handleUpload = async (type: string) => {
    // TODO: Implement file upload with Supabase Storage
    toast({
      title: "Tez orada",
      description: "Hujjat yuklash funksiyasi tayyorlanmoqda"
    })
  }

  const approvedCount = documents.filter(d => d.status === 'approved').length
  const pendingCount = documents.filter(d => d.status === 'pending').length
  const rejectedCount = documents.filter(d => d.status === 'rejected').length

  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h1 className="text-xl sm:text-3xl font-bold tracking-tight">Hujjatlar</h1>
        <p className="text-sm sm:text-base text-muted-foreground">Do'kon hujjatlarini yuklash va boshqarish</p>
      </div>

      {/* Status Overview */}
      <div className="grid grid-cols-3 gap-2 sm:gap-4">
        <Card className="bg-green-50 border-green-200">
          <CardContent className="p-3 sm:p-4 flex items-center gap-3">
            <CheckCircle className="h-6 w-6 sm:h-8 sm:w-8 text-green-600" />
            <div>
              <p className="text-lg sm:text-2xl font-bold text-green-700">{approvedCount}</p>
              <p className="text-xs sm:text-sm text-green-600">Tasdiqlangan</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-yellow-50 border-yellow-200">
          <CardContent className="p-3 sm:p-4 flex items-center gap-3">
            <Clock className="h-6 w-6 sm:h-8 sm:w-8 text-yellow-600" />
            <div>
              <p className="text-lg sm:text-2xl font-bold text-yellow-700">{pendingCount}</p>
              <p className="text-xs sm:text-sm text-yellow-600">Kutilmoqda</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-red-50 border-red-200">
          <CardContent className="p-3 sm:p-4 flex items-center gap-3">
            <XCircle className="h-6 w-6 sm:h-8 sm:w-8 text-red-600" />
            <div>
              <p className="text-lg sm:text-2xl font-bold text-red-700">{rejectedCount}</p>
              <p className="text-xs sm:text-sm text-red-600">Rad etilgan</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Required Documents */}
      <Card>
        <CardHeader className="p-3 sm:p-6">
          <CardTitle className="text-base sm:text-lg">Kerakli hujjatlar</CardTitle>
          <CardDescription>Do'konni faollashtirish uchun quyidagi hujjatlarni yuklang</CardDescription>
        </CardHeader>
        <CardContent className="p-3 sm:p-6 pt-0 space-y-4">
          {requiredDocs.map((req) => {
            const uploaded = getDocByType(req.type)
            return (
              <div key={req.type} className="border rounded-lg p-3 sm:p-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg ${uploaded ? 'bg-primary/10' : 'bg-muted'}`}>
                      <FileText className={`h-5 w-5 ${uploaded ? 'text-primary' : 'text-muted-foreground'}`} />
                    </div>
                    <div>
                      <h4 className="font-medium">{req.name}</h4>
                      <p className="text-xs sm:text-sm text-muted-foreground">{req.description}</p>
                      {uploaded && (
                        <div className="mt-2">
                          {getStatusBadge(uploaded.status)}
                          {uploaded.status === 'rejected' && uploaded.notes && (
                            <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                              <AlertTriangle className="h-3 w-3" />
                              {uploaded.notes}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                  <Button 
                    variant={uploaded ? "outline" : "default"}
                    size="sm"
                    onClick={() => handleUpload(req.type)}
                    disabled={uploading}
                  >
                    {uploading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : uploaded ? (
                      <>
                        <Upload className="h-4 w-4 mr-1" />
                        Yangilash
                      </>
                    ) : (
                      <>
                        <FilePlus className="h-4 w-4 mr-1" />
                        Yuklash
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )
          })}
        </CardContent>
      </Card>

      {/* Uploaded Documents */}
      <Card>
        <CardHeader className="p-3 sm:p-6">
          <CardTitle className="text-base sm:text-lg">Yuklangan hujjatlar</CardTitle>
        </CardHeader>
        <CardContent className="p-3 sm:p-6 pt-0">
          {documents.length === 0 ? (
            <div className="text-center py-8">
              <FileImage className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
              <p className="text-muted-foreground">Hali hujjat yuklanmagan</p>
            </div>
          ) : (
            <div className="space-y-3">
              {documents.map((doc) => (
                <div key={doc.id} className="flex items-center justify-between border-b pb-3 last:border-0">
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium text-sm">{doc.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(doc.uploaded_at).toLocaleDateString('uz-UZ')}
                      </p>
                    </div>
                  </div>
                  {getStatusBadge(doc.status)}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Info */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-4 flex gap-3">
          <AlertTriangle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-800">
            <p className="font-medium">Muhim ma'lumot</p>
            <p className="mt-1">Hujjatlar tasdiqlangandan so'ng do'koningiz platformada faollashtiriladi. Tasdiqlash 1-3 ish kuni davom etadi.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
