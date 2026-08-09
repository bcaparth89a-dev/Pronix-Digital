import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ChevronLeft, ExternalLink, Github, Pencil } from "lucide-react";
import { PageHeader } from "@/components/admin/PageHeader";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useProject } from "@/features/projects/useProjects";
import { privateRoutes } from "@/config/navigation";
import { ImageLightbox } from "@/components/common/ImageLightbox";

function formatDate(dateStr) {
  if (!dateStr) return "-";
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function ContentSection({ title, children }) {
  return (
    <div className="rounded-lg border bg-card p-5">
      <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
        {title}
      </h3>
      {children}
    </div>
  );
}

function SidebarRow({ label, children }) {
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground mb-1">
        {label}
      </p>
      <div className="text-sm text-foreground">{children}</div>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="space-y-4">
      <div className="animate-pulse bg-muted rounded h-8 w-40" />
      <div className="animate-pulse bg-muted rounded h-10 w-80" />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="animate-pulse bg-muted rounded h-48 w-full" />
          <div className="animate-pulse bg-muted rounded h-32 w-full" />
          <div className="animate-pulse bg-muted rounded h-32 w-full" />
        </div>
        <div className="space-y-4">
          <div className="animate-pulse bg-muted rounded h-64 w-full" />
        </div>
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

export function AdminProjectViewPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: project, isLoading, isError } = useProject(id);
  const [selectedImage, setSelectedImage] = useState(null);

  if (isLoading) return <LoadingSkeleton />;
  if (isError || !project) {
    return <ErrorState onBack={() => navigate(privateRoutes.adminProjects)} />;
  }

  return (
    <div>
      {/* -- Top navigation bar ---------------------------------------- */}
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

        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-semibold tracking-normal text-foreground">
              {project.title}
            </h1>
            <StatusBadge status={project.status} />
          </div>
          <Button
            size="sm"
            onClick={() => navigate(privateRoutes.adminProjectEdit(project.id))}
          >
            <Pencil className="mr-1.5 h-3.5 w-3.5" />
            Edit
          </Button>
        </div>
      </div>

      {/* -- Two-column layout ----------------------------------------- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-4">
          {/* Cover image */}
          {project.coverImage?.url && (
            <div className="overflow-hidden rounded-lg border cursor-pointer hover:opacity-90 transition-opacity">
              <img
                src={project.coverImage.url}
                alt={project.coverImage.alt || project.title}
                className="w-full h-64 object-cover"
                onClick={() => setSelectedImage({ url: project.coverImage.url, alt: project.title })}
              />
            </div>
          )}

          {/* Summary */}
          <ContentSection title="Summary">
            <p className="text-sm text-muted-foreground italic leading-relaxed">
              {project.summary}
            </p>
          </ContentSection>

          {/* Description */}
          <ContentSection title="Description">
            <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
              {project.description}
            </p>
          </ContentSection>

          {/* Problem */}
          {project.problem && (
            <ContentSection title="Problem Statement">
              <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
                {project.problem}
              </p>
            </ContentSection>
          )}

          {/* Solution */}
          {project.solution && (
            <ContentSection title="Solution">
              <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
                {project.solution}
              </p>
            </ContentSection>
          )}

          {/* Results */}
          {project.results && (
            <ContentSection title="Results">
              <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
                {project.results}
              </p>
            </ContentSection>
          )}

          {/* Gallery */}
          {project.gallery?.length > 0 && (
            <ContentSection title="Gallery">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {project.gallery.map((img, i) => (
                  <div
                    key={img.publicId ?? i}
                    className="aspect-video overflow-hidden rounded-md border"
                  >
                    <img
                      src={img.url}
                      alt={img.alt || `Gallery image ${i + 1}`}
                      className="h-full w-full object-cover"
                    />
                  </div>
                ))}
              </div>
            </ContentSection>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-1">
          <div className="rounded-lg border bg-card p-5 space-y-4">
            <SidebarRow label="Status">
              <StatusBadge status={project.status} />
            </SidebarRow>

            <SidebarRow label="Featured">
              {project.isFeatured ? (
                <Badge variant="default">Yes</Badge>
              ) : (
                <span className="text-muted-foreground">No</span>
              )}
            </SidebarRow>

            {project.industry && (
              <SidebarRow label="Industry">
                <span>{project.industry}</span>
              </SidebarRow>
            )}

            {project.clientName && (
              <SidebarRow label="Client">
                <span>{project.clientName}</span>
              </SidebarRow>
            )}

            {project.technologies?.length > 0 && (
              <SidebarRow label="Technologies">
                <div className="flex flex-wrap gap-1 mt-1">
                  {project.technologies.map((tech) => (
                    <Badge key={tech} variant="secondary" className="text-xs">
                      {tech}
                    </Badge>
                  ))}
                </div>
              </SidebarRow>
            )}

            {project.services?.length > 0 && (
              <SidebarRow label="Services">
                <div className="flex flex-wrap gap-1 mt-1">
                  {project.services.map((svc) => (
                    <Badge key={svc} variant="outline" className="text-xs">
                      {svc}
                    </Badge>
                  ))}
                </div>
              </SidebarRow>
            )}

            {project.projectUrl && (
              <SidebarRow label="Live URL">
                <a
                  href={project.projectUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  Visit site
                </a>
              </SidebarRow>
            )}

            {project.githubUrl && (
              <SidebarRow label="GitHub">
                <a
                  href={project.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
                >
                  <Github className="h-3.5 w-3.5" />
                  View repo
                </a>
              </SidebarRow>
            )}

            {project.publishedAt && (
              <SidebarRow label="Completion Date">
                <span>{formatDate(project.publishedAt)}</span>
              </SidebarRow>
            )}

            <SidebarRow label="Created">
              <span className="text-muted-foreground">{formatDate(project.createdAt)}</span>
            </SidebarRow>

            {project.updatedAt && (
              <SidebarRow label="Last Updated">
                <span className="text-muted-foreground">{formatDate(project.updatedAt)}</span>
              </SidebarRow>
            )}
          </div>
        </div>
      </div>
      <ImageLightbox
        src={selectedImage?.url}
        alt={selectedImage?.alt}
        isOpen={!!selectedImage}
        onClose={() => setSelectedImage(null)}
      />
    </div>
  );
}
