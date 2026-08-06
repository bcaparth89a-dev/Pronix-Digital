import { useEffect } from "react";
import { LayoutDashboard, FolderKanban, Newspaper, CircleHelp, Mail, Users, Settings, X } from "lucide-react";
import { NavLink } from "react-router-dom";
import { privateRoutes } from "@/config/navigation";
import { cn } from "@/lib/utils";

const navItems = [
  { label: "Dashboard", href: privateRoutes.adminDashboard, icon: LayoutDashboard, end: true },
  { label: "Projects", href: privateRoutes.adminProjects, icon: FolderKanban },
  { label: "Blogs", href: privateRoutes.adminBlogs, icon: Newspaper },
  { label: "FAQs", href: privateRoutes.adminFaqs, icon: CircleHelp },
  { label: "Contacts", href: privateRoutes.adminContacts, icon: Mail },
  { label: "Users", href: privateRoutes.adminUsers, icon: Users },
  { label: "Settings", href: privateRoutes.adminSettings, icon: Settings },
];

export function AdminSidebar({ isOpen, onClose }) {
  // Lock body scrolling when sidebar is open on mobile
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm transition-opacity md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar aside panel */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r bg-card transition-transform duration-300 ease-in-out md:static md:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Sidebar Header */}
        <div className="flex h-16 items-center justify-between border-b px-5 shrink-0">
          <div>
            <p className="text-sm font-semibold">Pronix Digital</p>
            <p className="text-xs text-muted-foreground">Admin Console</p>
          </div>
          {/* Close button on mobile */}
          <button
            type="button"
            className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-muted-foreground hover:text-foreground md:hidden border"
            onClick={onClose}
            aria-label="Close menu"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Navigation list items */}
        <nav className="flex-1 space-y-1 p-3 overflow-y-auto scrollbar-none touch-pan-y">
          {navItems.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.href}
                to={item.href}
                end={item.end}
                onClick={onClose} // Auto close mobile sidebar post-navigation
                className={({ isActive }) =>
                  cn(
                    "flex h-10 items-center gap-3 rounded-md px-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground",
                    isActive && "bg-accent text-accent-foreground",
                  )
                }
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </NavLink>
            );
          })}
        </nav>
      </aside>
    </>
  );
}

