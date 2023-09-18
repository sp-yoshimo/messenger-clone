import getCurrentUser from "@/app/actions/getCurrentUser";
import { NextResponse } from "next/server";

import prisma from "@/app/libs/prismadb"
import { pushServer } from "@/app/libs/pusher";

interface IParams {
    conversationId?: string;
}

export async function PUT(
    request: Request,
    { params }: { params: IParams }
) {
    try {

        const body = await request.json()
        const { name } = body

        const { conversationId } = params

        const currentUser = await getCurrentUser();

        

        if (!currentUser?.id) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const updatedConversation = await prisma.conversation.update({
            where: {
                id: conversationId
            },
            data: {
                name: name
            },
            include: {
                users: true
            }
        })


        updatedConversation.users.forEach((user) => {
            if (user.email) {
                pushServer.trigger(user.email, "conversation:update", updatedConversation)
            }
        })

        return NextResponse.json(updatedConversation);

    } catch (error) {
        console.log(error);
        return new NextResponse("Internal Error", { status: 500 })
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: IParams }
) {
    try {

        const { conversationId } = params;
        const currentUser = await getCurrentUser();

        if (!currentUser?.id) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const existingConversation = await prisma.conversation.findUnique({
            where: {
                id: conversationId
            },
            include: {
                users: true
            }
        });

        if (!existingConversation) {
            return new NextResponse("Invalid ID", { status: 400 });
        }

        const deleteConversation = await prisma.conversation.deleteMany({
            where: {
                id: conversationId,
                userIds: {
                    hasSome: [currentUser.id]
                }
            }
        });

        existingConversation.users.forEach((user) => {
            if (user.email) {
                pushServer.trigger(user.email, "conversation:remove", existingConversation);
            }
        })

        return NextResponse.json(deleteConversation);

    } catch (error: any) {
        console.log(error, "ERROR_CONVERSATION_DELETE");
        return new NextResponse("Internal Error", { status: 500 });
    }
}