import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Dialog } from "@/components/admin/Dialog";
import { Button } from "@/components/ui/button";
import { useCreateFaq, useUpdateFaq } from "@/features/faqs/useFaqs";

const INPUT_CLS =
  "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none ring-offset-background transition-colors placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring";

const TEXTAREA_CLS =
  "flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none ring-offset-background transition-colors placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring resize-none";

const schema = z.object({
  question: z.string().trim().min(5, "Min 5 characters").max(240),
  answer: z.string().trim().min(5, "Min 5 characters"),
  category: z.string().trim().max(120).optional(),
  order: z.coerce.number().int().min(0).optional(),
  isActive: z.boolean(),
});

const DEFAULT_VALUES = {
  question: "",
  answer: "",
  category: "",
  order: "",
  isActive: true,
};

export function FaqFormDialog({ open, onClose, faq }) {
  const isEditing = Boolean(faq);
  const createFaq = useCreateFaq();
  const updateFaq = useUpdateFaq();
  const mutation = isEditing ? updateFaq : createFaq;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: DEFAULT_VALUES,
  });

  useEffect(() => {
    if (faq) {
      reset({
        question: faq.question ?? "",
        answer: faq.answer ?? "",
        category: faq.category ?? "",
        isActive: faq.isActive ?? true,
      });
    } else {
      reset(DEFAULT_VALUES);
    }
  }, [faq, reset]);

  async function onSubmit(values) {
    const payload = {
      question: values.question,
      answer: values.answer,
      isActive: values.isActive,
    };
    if (values.category) payload.category = values.category;

    try {
      if (isEditing) {
        await updateFaq.mutateAsync({ id: faq.id, payload });
      } else {
        await createFaq.mutateAsync(payload);
      }
      onClose();
    } catch {
      // error surfaced from mutation.error below
    }
  }

  const serverError = mutation.error?.message;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={isEditing ? "Edit FAQ" : "New FAQ"}
      description={
        isEditing ? "Update the FAQ entry." : "Add a new frequently asked question."
      }
      className="max-w-lg"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Question */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium">Question</label>
          <textarea
            rows={3}
            className={TEXTAREA_CLS}
            placeholder="What is your question?"
            {...register("question")}
          />
          {errors.question && (
            <p className="text-xs text-destructive">{errors.question.message}</p>
          )}
        </div>

        {/* Answer */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium">Answer</label>
          <textarea
            rows={5}
            className={TEXTAREA_CLS}
            placeholder="Write the answer here..."
            {...register("answer")}
          />
          {errors.answer && (
            <p className="text-xs text-destructive">{errors.answer.message}</p>
          )}
        </div>

        {/* Category */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium">Category</label>
          <input
            type="text"
            className={INPUT_CLS}
            placeholder="e.g. General"
            {...register("category")}
          />
          {errors.category && (
            <p className="text-xs text-destructive">{errors.category.message}</p>
          )}
        </div>

        {/* isActive */}
        <div className="flex items-center gap-2">
          <input
            id="faq-isActive"
            type="checkbox"
            className="h-4 w-4 rounded border-input accent-primary"
            {...register("isActive")}
          />
          <label htmlFor="faq-isActive" className="text-sm font-medium">
            Active
          </label>
        </div>

        {serverError && (
          <p className="text-xs text-destructive">{serverError}</p>
        )}

        {/* Footer */}
        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" size="sm" disabled={mutation.isPending}>
            {mutation.isPending
              ? isEditing
                ? "Saving..."
                : "Creating..."
              : isEditing
              ? "Save changes"
              : "Create FAQ"}
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
