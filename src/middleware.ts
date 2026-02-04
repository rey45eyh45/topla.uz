import { type NextRequest, NextResponse } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

export async function middleware(request: NextRequest) {
  const hostname = request.headers.get('host') || ''
  const url = request.nextUrl.clone()
  
  // Extract subdomain
  // For production: admin.topla.uz, vendor.topla.uz
  // For development: admin.localhost:3000, vendor.localhost:3000
  const currentHost = hostname
    .replace('.localhost:3000', '')
    .replace('.topla.uz', '')
    .replace(':3000', '')
  
  // Handle subdomain routing
  if (currentHost === 'admin') {
    // Rewrite to /admin routes
    if (!url.pathname.startsWith('/admin')) {
      url.pathname = `/admin${url.pathname}`
      return NextResponse.rewrite(url)
    }
  } else if (currentHost === 'vendor') {
    // Rewrite to /vendor routes
    if (!url.pathname.startsWith('/vendor')) {
      url.pathname = `/vendor${url.pathname}`
      return NextResponse.rewrite(url)
    }
  }
  
  // Update Supabase session
  return await updateSession(request)
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
