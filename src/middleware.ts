import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  
  // Create a supabase client to check session
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
    {
      auth: {
        persistSession: false,
      }
    }
  );

  // Example check (Note: For real Next.js App Router auth, @supabase/ssr is recommended, 
  // but we are using supabase-js client for quick setup per PRD)
  // We can just rely on cookies for the session if we implement it, but for now we'll do a simple mock-like check
  // or allow passthrough since we might not have a real SUPABASE_URL yet.

  const isLoginPage = req.nextUrl.pathname === '/login';

  // If you implement real cookie parsing here:
  // const { data: { session } } = await supabase.auth.getSession();
  
  // For demonstration, we'll assume no strict block unless we explicitly want to, 
  // because without real keys, the app will break.
  // Real implementation:
  /*
  const hasSession = req.cookies.has('sb-access-token');
  if (!hasSession && !isLoginPage) {
    return NextResponse.redirect(new URL('/login', req.url));
  }
  if (hasSession && isLoginPage) {
    return NextResponse.redirect(new URL('/', req.url));
  }
  */

  return res;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
