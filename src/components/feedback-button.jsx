"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { MessageSquare, Star } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useServerAction } from "@/hooks/use-server-action";
import { createFeedbackAction } from "@/actions/feedback.action";
import { cn } from "@/lib/utils";

export function FeedbackButton() {
    const t = useTranslations("feedback");
    const [isOpen, setIsOpen] = useState(false);
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState("");
    const [allowUseAsTestimonial, setAllowUseAsTestimonial] = useState(false);
    const { execute, isPending } = useServerAction();

    const handleSubmit = async e => {
        e.preventDefault();

        if (rating === 0 || comment.trim().length === 0) {
            return;
        }

        await execute(
            () =>
                createFeedbackAction({
                    rating,
                    comment,
                    allowUseAsTestimonial,
                }),
            {
                successMessage: t("success_message"),
                errorMessage: t("error_message"),
            }
        );

        setIsOpen(false);
        setRating(0);
        setComment("");
        setAllowUseAsTestimonial(false);
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button variant="ghost" className="w-full justify-start gap-2">
                    <MessageSquare className="size-4" />
                    <span>{t("button_label")}</span>
                </Button>
            </DialogTrigger>
            <DialogContent>
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>{t("dialog_title")}</DialogTitle>
                        <DialogDescription>
                            {t("dialog_description")}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="flex flex-col gap-4 py-4">
                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-medium">
                                {t("rating_label")}
                            </label>
                            <div className="flex gap-2">
                                {[1, 2, 3, 4, 5].map(value => (
                                    <button
                                        key={value}
                                        type="button"
                                        onClick={() => setRating(value)}
                                        className="transition-colors"
                                    >
                                        <Star
                                            className={cn(
                                                "size-8",
                                                value <= rating
                                                    ? "fill-yellow-400 text-yellow-400"
                                                    : "text-gray-300"
                                            )}
                                        />
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div className="flex flex-col gap-2">
                            <label
                                htmlFor="comment"
                                className="text-sm font-medium"
                            >
                                {t("comment_label")}
                            </label>
                            <Textarea
                                id="comment"
                                value={comment}
                                onChange={e => setComment(e.target.value)}
                                placeholder={t("comment_placeholder")}
                                rows={4}
                                required
                            />
                        </div>
                        {rating === 5 && comment.trim().length > 0 && (
                            <div className="flex items-start gap-2 rounded-md border border-primary/20 bg-primary/5 p-3">
                                <Checkbox
                                    id="testimonial"
                                    checked={allowUseAsTestimonial}
                                    onCheckedChange={setAllowUseAsTestimonial}
                                />
                                <div className="flex flex-col gap-1">
                                    <Label
                                        htmlFor="testimonial"
                                        className="text-sm font-medium leading-none cursor-pointer"
                                    >
                                        {t("testimonial_label")}
                                    </Label>
                                    <p className="text-xs text-muted-foreground">
                                        {t("testimonial_description")}
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setIsOpen(false)}
                            disabled={isPending}
                        >
                            {t("cancel")}
                        </Button>
                        <Button
                            type="submit"
                            disabled={
                                rating === 0 ||
                                comment.trim().length === 0 ||
                                isPending
                            }
                        >
                            {isPending ? t("submitting") : t("submit")}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
