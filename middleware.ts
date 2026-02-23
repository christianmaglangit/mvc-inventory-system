import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({ name, value, ...options })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({ name, value, ...options })
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({ name, value: '', ...options })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({ name, value: '', ...options })
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  const url = request.nextUrl.clone()
  const role = user?.user_metadata?.department

  // 1. Protection: Kung hindi logged in at sinusubukang pumasok sa dashboard
  if (!user && url.pathname.includes('_dashboard')) {
    url.pathname = '/'
    return NextResponse.redirect(url)
  }

  // 2. Role-Based Access Control (RBAC)
  if (user) {
    const deptRoutes: Record<string, string> = {
      'IT Dept.': '/mis_dashboard',
      'HR Dept.': '/hr_dashboard',
      'Finance': '/finance_dashboard',
      'Marketing': '/marketing_dashboard',
      'Operations': '/operations_dashboard',
      'Logistics': '/logistics_dashboard'
    }

    const targetDashboard = deptRoutes[role] || '/dashboard'

    // Iwasan ang maling dashboard folder
    if (url.pathname.includes('_dashboard') && !url.pathname.startsWith(targetDashboard)) {
      url.pathname = targetDashboard
      return NextResponse.redirect(url)
    }

    // Kung logged in na pero nasa login page (/), i-forward sa dashboard
    if (url.pathname === '/') {
      url.pathname = targetDashboard
      return NextResponse.redirect(url)
    }
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}