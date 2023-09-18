"use client";

import clsx from "clsx";

import useConversation from "../hooks/useConversation";
import EmptyState from "../components/EmptyState";

const Home = () => {
    const { isOpen } = useConversation();

    return(
        <div>
            <div className={clsx(
                "lg:pl-80 h-screen lg:block",
                isOpen ? "block" : "hidden"
            )}>
                <EmptyState />
            </div>
        </div>
    )
}

export default Home;