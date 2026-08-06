import { useNavigate, useParams } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import { PageHeader } from "@/components/admin/PageHeader";
import { Button } from "@/components/ui/button";
import { ProjectForm } from "@/features/projects/ProjectForm";
import { useProject, useUpdateProject } from "@/features/projects/useProjects";
import { useToast } from "@/providers/ToastProvider";
import { privateRoutes } from "@/config/navigation";

function LoadingSkeleton() {
  return (
    <div className="max-w-4xl space-y-4">
      <div className="animate-pulse bg-muted rounded h-8 w-40" />
      <div className="animate-pulse bg-muted rounded h-10 w-64" />
      <div className="animate-pulse bg-muted rounded h-4 w-48" />
      <div className="space-y-3 mt-6">
        <div className="animate-pulse bg-muted rounded h-10 w-full" />
        <div className="animate-pulse bg-muted rounded h-24 w-full" />
        <div className="animate-pulse bg-muted rounded h-10 w-48" />
        <div className="animate-pulse bg-muted rounded h-32 w-full" />
        <div className="animate-pulse bg-muted rounded h-24 w-full" />
        <div className="animate-pulse bg-muted rounded h-24 w-full" />
      </div>
    </div>
  );
}

function ErrorState({ onBack }) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-20 text-center">
      <p className="text-lg font-semibold text-foreground">Project not found</p>
      <p className="text-sm text-muted-foreground">
        The project you are looking for does not exist or could not be loaded.
      </p>
      <Button variant="outline" onClick={onBack}>
        <ChevronLeft className="mr-1 h-4 w-4" />
        Back to Projects
      </Button>
    </div>
  );
}

export function AdminProjectEditPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { success } = useToast();
  const { data: project, isLoading, isError } = useProject(id);
  const updateProject = useUpdateProject();

  async function handleSubmit(payload) {
    await updateProject.mutateAsync({ id, payload });
    success("Project updated successfully");
    navigate(privateRoutes.adminProjects);
  }

  if (isLoading) return <LoadingSkeleton />;
  if (isError || !project) {
    return <ErrorState onBack={() => navigate(privateRoutes.adminProjects)} />;
  }

  const defaultValues = {
    title: project.title ?? "",
    summary: project.summary ?? "",
    description: project.description ?? "",
    problem: project.problem ?? "",
    solution: project.solution ?? "",
    results: project.results ?? "",
    clientName: project.clientName ?? "",
    industry: project.industry ?? "",
    technologies: project.technologies ?? [],
    services: project.services ?? [],
    projectUrl: project.projectUrl ?? "",
    githubUrl: project.githubUrl ?? "",
    seoTitle: project.seoTitle ?? "",
    seoDescription: project.seoDescription ?? "",
    status: project.status ?? "draft",
    isFeatured: project.isFeatured ?? false,
    publishedAt: project.publishedAt
      ? new Date(project.publishedAt).toISOString().split("T")[0]
      : "",
    coverImage: project.coverImage ?? null,
    gallery: project.gallery ?? [],
  };

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
        <PageHeader title="Edit Project" description={`Editing: ${project.title}`} />
      </div>

      <ProjectForm
        defaultValues={defaultValues}
        onSubmit={handleSubmit}
        isPending={updateProject.isPending}
        isEditing={true}
        onCancel={() => navigate(privateRoutes.adminProjects)}
      />
    </div>
  );
}
