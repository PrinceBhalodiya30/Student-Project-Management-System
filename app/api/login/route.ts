import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { comparePassword, signJWT } from '@/lib/auth';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { email, password, role } = body;

        if (!email || !password) {
            return NextResponse.json({ error: "Missing fields" }, { status: 400 });
        }

        const user = await prisma.user.findUnique({
            where: { email },
            include: { FacultyProfile: true, StudentProfile: true }
        });

        if (!user) {
            return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
        }

        const isValid = await comparePassword(password, user.password);
        if (!isValid) {
            return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
        }

        if (role && user.role.toLowerCase() !== role.toLowerCase()) {
            return NextResponse.json({ error: "Invalid email, password, or role." }, { status: 401 });
        }

        const token = await signJWT({
            sub: user.id,
            email: user.email,
            role: user.role,
        });

        const response = NextResponse.json({
            success: true,
            role: user.role.toLowerCase()
        });

        response.cookies.set('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 60 * 60 * 24 // 24 hours
        });

        return response;

    } catch (error) {
        console.error("Login error", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
