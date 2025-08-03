// /middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import statsStore from './pages/api/lib/statsStore';

export function middleware(request: NextRequest) {
  // Увеличиваем счётчик для КАЖДОГО запроса
  statsStore.increment().catch(console.error);
  
  return NextResponse.next();
}

// Применяем middleware ко всем маршрутам
export const config = {
  matcher: '/:path*',
};