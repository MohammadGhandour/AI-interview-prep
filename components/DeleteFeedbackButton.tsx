"use client";

import { deleteFeedback } from "@/lib/actions/general.action";
import { Button } from "./ui/button";
import { toast } from "sonner";
import { redirect } from "next/navigation";

const DeleteFeedbackButton = ({ feedbackId, userId }: { feedbackId: string; userId: string; }) => {

  const handleDelete = async () => {
    const { success, message } = await deleteFeedback({ feedbackId, userId });
    if (success) {
      toast.success(message);
      redirect("/");
    } else {
      toast.error(message);
    }
  };

  return <Button variant="destructive" onClick={handleDelete} className="rounded-full cursor-pointer">Delete</Button>
};

export default DeleteFeedbackButton;
