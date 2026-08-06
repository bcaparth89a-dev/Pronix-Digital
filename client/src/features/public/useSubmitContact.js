import { useMutation } from "@tanstack/react-query";
import { contactsService } from "@/features/contacts/contactsService";

export function useSubmitContact() {
  return useMutation({
    mutationFn: (payload) => contactsService.create(payload),
  });
}
