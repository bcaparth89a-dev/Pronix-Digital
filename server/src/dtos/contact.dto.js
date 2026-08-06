export function contactDto(contact) {
  if (!contact) return null;

  return {
    id: contact._id?.toString(),
    name: contact.name,
    email: contact.email,
    phone: contact.phone,
    company: contact.company,
    serviceInterest: contact.serviceInterest,
    budgetRange: contact.budgetRange,
    message: contact.message,
    source: contact.source,
    status: contact.status,
    notes: contact.notes,
    metadata: contact.metadata,
    createdAt: contact.createdAt,
    updatedAt: contact.updatedAt,
  };
}

export function publicContactDto(contact) {
  if (!contact) return null;

  return {
    id: contact._id?.toString(),
    status: contact.status,
    createdAt: contact.createdAt,
  };
}

export function contactListDto(contacts) {
  return contacts.map(contactDto);
}

