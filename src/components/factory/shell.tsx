"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  LayoutDashboard,
  FolderOpen,
  ScanLine,
  ChartNoAxesCombined,
  Boxes,
  BookOpen,
  Workflow,
  Mail,
  FileText,
  Flag,
  ChartColumn,
  Download,
  Settings,
  PanelLeftClose,
  Menu,
  ArrowUpRight,
  Factory,
  ShieldCheck,
  ChevronRight,
  Target,
  ClipboardCheck,
} from "lucide-react";
import type { FactoryProject } from "@/lib/factory/model";
const routes = [
  ["", "Overview", LayoutDashboard],
  ["intelligence", "Business intelligence", ScanLine],
  ["audit", "Revenue-leak audit", ClipboardCheck],
  ["opportunities", "Opportunity board", Target],
  ["offer", "Offer builder", FileText],
  ["system", "System builder", Boxes],
  ["skills", "Skill studio", BookOpen],
  ["workflows", "Workflow studio", Workflow],
  ["outreach", "Outreach studio", Mail],
  ["content", "Content studio", FileText],
  ["visibility", "Local visibility", ChartNoAxesCombined],
  ["roadmap", "Launch hub", Flag],
  ["reporting", "Reporting hub", ChartColumn],
  ["export", "Export center", Download],
] as const;
export function Shell({
  children,
  projects,
}: {
  children: React.ReactNode;
  projects: FactoryProject[];
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const id = pathname.split("/")[2];
  const project = projects.find((p) => p.id === id);
  return (
    <div className="factory-shell">
      <a href="#main" className="skip-link">
        Skip to content
      </a>
      <button
        aria-label={open ? "Close navigation" : "Open navigation"}
        className="mobile-menu"
        onClick={() => setOpen(!open)}
      >
        <Menu size={21} />
      </button>
      {open && (
        <button
          className="nav-scrim"
          aria-label="Close navigation"
          onClick={() => setOpen(false)}
        />
      )}
      <aside className={`factory-sidebar ${open ? "is-open" : ""}`}>
        <Link href="/" className="factory-brand">
          <span className="brand-symbol">
            <Factory size={23} />
          </span>
          <span>
            <b>InstaOnPC</b>
            <small>SYSTEM FACTORY</small>
          </span>
        </Link>
        <div className="workspace-label">OPERATOR WORKSPACE</div>
        <nav aria-label="Main navigation">
          <Link
            onClick={() => setOpen(false)}
            className={`side-link ${pathname === "/" ? "active" : ""}`}
            href="/"
          >
            <LayoutDashboard size={17} />
            Dashboard
          </Link>
          <Link
            onClick={() => setOpen(false)}
            className={`side-link ${pathname === "/projects" ? "active" : ""}`}
            href="/projects"
          >
            <FolderOpen size={17} />
            Projects<span className="nav-count">{projects.length}</span>
          </Link>
        </nav>
        <div className="sidebar-divider" />
        <div className="workspace-label">
          {project ? "CURRENT PROJECT" : "RECENT PROJECTS"}
        </div>
        {project ? (
          <>
            <Link className="project-chip" href={`/projects/${id}`}>
              <span className="initials">
                {project.name.slice(0, 2).toUpperCase()}
              </span>
              <span>
                {project.name}
                <small>{project.businessProfile?.city}</small>
              </span>
            </Link>
            <nav aria-label="Project navigation">
              {routes.map(([key, label, Icon]) => (
                <Link
                  onClick={() => setOpen(false)}
                  key={key}
                  href={`/projects/${id}${key ? "/" + key : ""}`}
                  className={`side-link ${pathname === `/projects/${id}${key ? "/" + key : ""}` ? "active" : ""}`}
                  aria-current={
                    pathname === `/projects/${id}${key ? "/" + key : ""}`
                      ? "page"
                      : undefined
                  }
                >
                  <Icon size={16} />
                  {label}
                </Link>
              ))}
            </nav>
          </>
        ) : (
          projects.slice(0, 5).map((p) => (
            <Link
              onClick={() => setOpen(false)}
              key={p.id}
              className="side-link recent-project"
              href={`/projects/${p.id}`}
            >
              <span className="small-square" />
              {p.name}
            </Link>
          ))
        )}
        <div className="sidebar-bottom">
          <Link className="side-link" href="/settings">
            <Settings size={17} />
            Workspace settings
          </Link>
          <div className="operator">
            <span className="avatar">DB</span>
            <div>
              <b>Devon Bowen</b>
              <small>InstaOnPC operator</small>
            </div>
            <ShieldCheck size={17} />
          </div>
        </div>
      </aside>
      <div className="factory-main">
        <header className="topbar">
          <div className="breadcrumb">
            Workspace <ChevronRight size={14} />
            <span>{project?.name || "System Factory"}</span>
          </div>
          <div className="topbar-right">
            <span className="mode-pill">
              <ShieldCheck size={14} />
              Draft workspace
            </span>
            <span className="avatar small">DB</span>
          </div>
        </header>
        <main id="main" className="factory-content">
          {children}
        </main>
        <footer className="factory-footer">
          <span>InstaOnPC System Factory</span>
          <span>Review-led delivery · Mock integrations</span>
        </footer>
      </div>
    </div>
  );
}
