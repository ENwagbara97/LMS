import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Public Paths Exemption
  if (pathname === '/login' || pathname === '/setup-password' || pathname.startsWith('/_next') || pathname.startsWith('/api')) {
    return NextResponse.next()
  }

  // Simulated Auth via Cookies (for Local Sandbox Mock)
  // Logic: Real app will wait on supabase.auth.getSession()
  const userRoleCookie = request.cookies.get('user_role')
  const isAuthenticated = !!userRoleCookie

  // 1. Unauthenticated hit redirects to Login
  if (!isAuthenticated && pathname !== '/') {
    // We let root `/` naturally redirect to student via page.tsx or we bounce.
    if (pathname !== '/') {
        return NextResponse.redirect(new URL('/login', request.url))
    }
  }

  // 2. Route Protection Verification
  if (isAuthenticated && userRoleCookie.value === 'student' && pathname.startsWith('/admin')) {
    return NextResponse.redirect(new URL('/student', request.url))
  }
  
  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
