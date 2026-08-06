import { useNavigate } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import { PageHeader } from "@/components/admin/PageHeader";
import { Button } from "@/components/ui/button";
import { ProjectForm } from "@/features/projects/ProjectForm";
import { useCreateProject } from "@/features/projects/useProjects";
import { useToast } from "@/providers/ToastProvider";
import { privateRoutes } from "@/config/navigation";

export function AdminProjectCreatePage() {
  const navigate = useNavigate();
  const { success } = useToast();
  const createProject = useCreateProject();

  async function handleSubmit(payload) {
    await createProject.mutateAsync(payload);
    success("Project created successfully");
    navigate(privateRoutes.adminProjects);
  }

  return (
    <div className="max-w-4xl">
      <div className="mb-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate(privateRoutes.adminProjects)}
          className="mb-2 -ml-2 text-muted-foreground"
        >
          <ChevronLeft className="mr-1 h-4 w-4" />
          Back to Projects
        </Button>
        <PageHeader title="Create Project" description="Add a new portfolio project" />
      </div>

      <ProjectForm
        defaultValues={undefined}
        onSubmit={handleSubmit}
        isPending={createProject.isPending}
        isEditing={false}
        onCancel={() => navigate(privateRoutes.adminProjects)}
      />
    </div>
  );
}
