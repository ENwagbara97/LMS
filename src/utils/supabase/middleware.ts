import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // IMPORTANT: Avoid writing any logic between createServerClient and
  // supabase.auth.getUser(). A simple mistake could make it very hard to debug
  // issues with users being randomly logged out.

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { pathname } = request.nextUrl

  // Public Paths Exemption
  if (pathname === '/login' || pathname === '/setup-password' || pathname.startsWith('/_next') || pathname.startsWith('/api') || pathname === '/auth/callback') {
    return supabaseResponse
  }

  // 1. Unauthenticated hit redirects to Login
  if (!user && pathname !== '/') {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // 2. Route Protection Verification
  if (user) {
    // If they hit root / when authenticated, route them correctly
    if (pathname === '/') {
      const { data: profile } = await supabase.from('profiles').select('role').eq('user_id', user.id).single();
      if (profile?.role === 'admin') {
        return NextResponse.redirect(new URL('/admin', request.url))
      } else {
        return NextResponse.redirect(new URL('/student', request.url))
      }
    }

    // Protect /admin routes from students
    if (pathname.startsWith('/admin')) {
      const { data: profile } = await supabase.from('profiles').select('role').eq('user_id', user.id).single();
      if (profile?.role !== 'admin') {
        return NextResponse.redirect(new URL('/student', request.url))
      }
    }
  }

  return supabaseResponse
}
