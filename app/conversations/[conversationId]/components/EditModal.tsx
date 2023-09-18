"use client";

import Button from "@/app/components/Button";
import Modal from "@/app/components/Modal";
import Input from "@/app/components/inputs/Input";
import { Conversation } from "@prisma/client";
import axios from "axios";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { FieldValues, SubmitHandler, useForm } from "react-hook-form";
import toast from "react-hot-toast";

interface EditModalProps {
    isOpen?: boolean;
    onClose: () => void;
    conversation: Conversation
}

const EditModal: React.FC<EditModalProps> = ({
    isOpen,
    onClose,
    conversation
}) => {


    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    const {
        register,
        handleSubmit,
        formState: {
            errors
        }
    } = useForm<FieldValues>({
        defaultValues: {
            name: conversation.name
        }
    });


    const onSubmit: SubmitHandler<FieldValues> = (data) => {

        setIsLoading(true)

        axios.put(`/api/conversations/${conversation.id}`, data)
        .then(()=>{
            onClose();
            router.refresh()
        })
        .catch(()=>{
            toast.error("Something went wrong")
        })
        .finally(()=>{
            setIsLoading(false)
        })
    }

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
        >
            <form onSubmit={handleSubmit(onSubmit)}>
                <div className="spacep-y-12">
                    <div className="border-b border-gray-900/10 pb-12">
                        <h2 className="text-base font-semibold leading-7 text-gray-900">
                            Edit Group Chat
                        </h2>
                        <p className="mt-1 text-sm leading-6 text-gray-600">
                            Edit your group's public information.
                        </p>
                        <div className="mt-10 flex flex-col gap-y-8">
                            <Input
                                register={register}
                                disabled={isLoading}
                                label="Group Name"
                                id="name"
                                required
                                errors={errors}
                                type="text"
                            />
                        </div>
                    </div>

                    <div className="mt-6 flex items-center justify-end gap-x-6">
                        <Button
                            disabled={isLoading}
                            secondary
                            onClick={onClose}
                        >
                            Cancel
                        </Button>
                        <Button
                            disabled={isLoading}
                            type="submit"
                        >
                            Save
                        </Button>
                    </div>

                </div>
            </form>
        </Modal>
    )
};

export default EditModal;
