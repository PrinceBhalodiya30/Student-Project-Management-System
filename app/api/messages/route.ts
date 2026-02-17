import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyJWT } from "@/lib/auth";
import { cookies } from "next/headers";

export async function GET(request: Request) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get("token")?.value;

        if (!token) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const payload = await verifyJWT(token);
        if (!payload || !payload.id) {
            return NextResponse.json({ error: "Invalid token" }, { status: 401 });
        }

        const userId = payload.id as string;

        // Fetch last 50 messages where user is sender or receiver (if we had receiver)
        // But schema only has senderId. So it's a broadcast chat? 
        // Or is it group chat? Schema has no groupId in Message.
        // Schema: Message { id, senderId, content, createdAt, User }
        // It seems to be a global chat or we need to infer context.
        // Let's assume it's a global chat for now or project based?
        // Wait, schema check:
        // model Message { id, senderId, content, createdAt, User }
        // It doesn't link to Project or Group.
        // This might be a "General" chat.
        // Or maybe we should link it to ProjectGroup if possible?
        // But for now, let's implement as is: All messages visible to everyone? 
        // No, that's bad.
        // Let's filter? Or just fetch all?
        // Given the schema, it's just a pool of messages. 
        // Let's return all messages for now, but maybe limit to 50.

        const messages = await prisma.message.findMany({
            take: 50,
            orderBy: {
                createdAt: 'desc'
            },
            include: {
                User: {
                    select: {
                        id: true,
                        fullName: true,
                        role: true
                    }
                }
            }
        });

        return NextResponse.json(messages.reverse());

    } catch (error) {
        console.error("Error fetching messages:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get("token")?.value;

        if (!token) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const payload = await verifyJWT(token);
        if (!payload || !payload.id) {
            return NextResponse.json({ error: "Invalid token" }, { status: 401 });
        }

        const userId = payload.id as string;
        const { content } = await request.json();

        if (!content || !content.trim()) {
            return NextResponse.json({ error: "Content is required" }, { status: 400 });
        }

        const message = await prisma.message.create({
            data: {
                id: crypto.randomUUID(),
                senderId: userId,
                content: content.trim()
            },
            include: {
                User: {
                    select: {
                        id: true,
                        fullName: true,
                        role: true
                    }
                }
            }
        });

        return NextResponse.json(message);

    } catch (error) {
        console.error("Error sending message:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
