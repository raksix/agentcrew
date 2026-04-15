/**
 * Next.js Edge Middleware - Route Protection
 *
 * Bu dosya Next.js middleware'idir ve /register rotasını korur.
 * /register sayfasına erişmek için "sooliva_payment_token" cookie'si gereklidir.
 * Cookie yoksa kullanıcı ana sayfaya (/) yönlendirilir.
 *
 * Middleware Edge Runtime'da çalışır (server-side, localStorage'a erişemez).
 * Bu nedenle ödeme token'ı cookie üzerinden kontrol edilmektedir.
 */

import { NextResponse, type NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // /register sayfasını koru
    if (pathname === '/register') {
        const paymentToken = request.cookies.get('sooliva_payment_token');

        if (!paymentToken?.value) {
            // Token yok → Ana sayfaya yönlendir
            const url = request.nextUrl.clone();
            url.pathname = '/';
            return NextResponse.redirect(url);
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/register'],
};
