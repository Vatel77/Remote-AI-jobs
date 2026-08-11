import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

let locales = ['en', 'fr', 'de', 'es']

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname
  
  if (
    pathname.startsWith('/_next') || 
    pathname.startsWith('/api') ||
    pathname.includes('.')
  ) {
    return NextResponse.next()
  }

  const pathnameIsMissingLocale = locales.every(
    (locale) => !pathname.startsWith(`/${locale}/`) && pathname !== `/${locale}`
  )
 
  if (pathnameIsMissingLocale) {
    return NextResponse.rewrite(new URL(`/en${pathname === '/' ? '' : pathname}`, request.url))
  }
}
 
export const config = {
  matcher: ['/((?!_next|api|favicon.ico).*)'],
}
