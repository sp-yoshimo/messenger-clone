"use client";

import { User } from "@prisma/client";
import Image from "next/image";
import React from "react";
import useActiveList from "../hooks/useActiveList";

interface AvatarProps {
    user: User,
    hasBorder?: boolean
}

const Avatar: React.FC<AvatarProps> = ({
    user,
    hasBorder
}) => {

    const { members } = useActiveList();
    
    const isActive = members.indexOf(user?.email!) !== -1

    return (
        <div className="relative flex justify-center items-center">
            <div className={`
            relative inline-block rounded-full overflow-hidden h-9 w-9 md:h-11 md:w-11
            ${hasBorder && "border-[1px] border-gray-200"}
            `}>
                <Image
                    alt="Avatar"
                    src={user?.image || "/images/placeholder.jpg"}
                    fill
                />
            </div>
            {isActive && (
                <span className="absolute block rounded-full bg-green-500 ring-2 ring-white
                top-0 right-0 h-2 w-2 md:h-3 md:w-3
                ">
                </span>
            )}

        </div>
    );
};

export default Avatar;
