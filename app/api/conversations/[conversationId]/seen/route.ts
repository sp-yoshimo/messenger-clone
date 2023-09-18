import getCurrentUser from "@/app/actions/getCurrentUser";
import { NextResponse } from "next/server";

import prisma from "@/app/libs/prismadb"
import { pushServer } from "@/app/libs/pusher";
import { indexOf } from "lodash";

interface IParams{
    conversationId?: string
};

export async function POST(
    request: Request,
    { params } : { params: IParams }
){
    try{

        const currentUser = await getCurrentUser();
        const { conversationId } = params;

        if(!currentUser?.id || !currentUser?.email){
            return new NextResponse("Unautorized", { status: 401 })
        }


        //Find hte existing conversation
        const conversation = await prisma.conversation.findUnique({
            where:{
                id: conversationId
            },
            include:{
                messages:{
                    include:{
                        seen: true
                    }
                }
            }
        });

        if(!conversation){
            return new NextResponse("Invalid ID", { status: 400 });
        }

        //Find the lastmessage
        const lastMessage = conversation.messages[conversation.messages.length - 1 ];

        if(!lastMessage){
            return NextResponse.json(conversation);
        }

        //Update seen of last message
        const updatedMessage = await prisma.message.update({
            where:{
                id: lastMessage.id
            },
            include:{
                sender: true,
                seen: true
            },
            data:{
                seen:{
                    connect:{
                        id: currentUser.id
                    }
                }
            }
        });

        await pushServer.trigger(currentUser.email, "conversation:update",{
            id: conversationId,
            messages: [updatedMessage]
        });

        if(lastMessage.seenIds.indexOf(currentUser.id) !== -1 ){
            return NextResponse.json(updatedMessage)
        }

        await pushServer.trigger(conversationId!, "message:update", updatedMessage)

        return NextResponse.json(updatedMessage);

    }catch(error: any){
        console.log(error, "ERROR_MESSAGES_SEEN");
        return new NextResponse("Internal Error", { status: 500 })
    }
}