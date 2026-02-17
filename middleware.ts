import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyJWT } from '@/lib/auth';

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Define protected routes and their required roles
    const protectedRoutes = [
        { path: '/dashboard/admin', role: 'ADMIN' },
        { path: '/dashboard/faculty', role: 'FACULTY' },
        { path: '/dashboard/student', role: 'STUDENT' },
    ];

    const matchedRoute = protectedRoutes.find(r => pathname.startsWith(r.path));

    if (matchedRoute) {
        const token = request.cookies.get('token')?.value;

        if (!token) {
            return NextResponse.redirect(new URL('/login', request.url));
        }

        const payload = await verifyJWT(token);

        if (!payload || payload.role !== matchedRoute.role) {
            // Strict role check: User's role must match the route's required role.
            return NextResponse.redirect(new URL('/login', request.url));
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/dashboard/:path*'],
};
