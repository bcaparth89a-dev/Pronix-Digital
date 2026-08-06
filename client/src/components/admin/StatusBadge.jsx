import { Badge } from "@/components/ui/badge";

const statusMap = {
  published: { variant: "success" },
  draft: { variant: "secondary" },
  archived: { variant: "outline" },
  active: { variant: "success" },
  inactive: { variant: "secondary" },
  new: { variant: "default" },
  "in-review": { variant: "warning" },
  contacted: { variant: "success" },
  qualified: { variant: "default" },
  closed: { variant: "outline" },
  spam: { variant: "destructive" },
};

function getConfig(status) {
  if (status === true) return { variant: "success", label: "Active" };
  if (status === false) return { variant: "secondary", label: "Inactive" };

  const key = String(status).toLowerCase();
  const config = statusMap[key];

  const label = key.charAt(0).toUpperCase() + key.slice(1).replace(/-/g, " ");
  return config ? { variant: config.variant, label } : { variant: "secondary", label };
}

export function StatusBadge({ status }) {
  const { variant, label } = getConfig(status);
  return <Badge variant={variant}>{label}</Badge>;
}
