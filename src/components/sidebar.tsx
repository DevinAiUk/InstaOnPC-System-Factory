'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, FolderOpen, Settings, ChevronRight,
  Building2, FileSearch, TrendingUp, Package,
  Cpu, BookOpen, Workflow, Mail, MapPin, Calendar, BarChart3, Download
} from 'lucide-react';

const topNav = [
  { href: '/',           label: 'Dashboard',  icon: LayoutDashboard },
  { href: '/projects',   label: 'Projects',   icon: FolderOpen },
  { href: '/settings',   label: 'Settings',   icon: Settings },
];

const projectNav = (id: string) => [
  { href: `/projects/${id}`,              label: 'Overview',        icon: Building2 },
  { href: `/projects/${id}/intelligence`, label: 'Intelligence',    icon: FileSearch },
  { href: `/projects/${id}/audit`,        label: 'Revenue Audit',   icon: TrendingUp },
  { href: `/projects/${id}/opportunities`,label: 'Opportunities',   icon: Package },
  { href: `/projects/${id}/offer`,        label: 'Offer Builder',   icon: ChevronRight },
  { href: `/projects/${id}/system`,       label: 'System Builder',  icon: Cpu },
  { href: `/projects/${id}/skills`,       label: 'Skill Studio',    icon: BookOpen },
  { href: `/projects/${id}/workflows`,    label: 'Workflow Studio', icon: Workflow },
  { href: `/projects/${id}/outreach`,     label: 'Outreach Studio', icon: Mail },
  { href: `/projects/${id}/visibility`,   label: 'Local Visibility',icon: MapPin },
  { href: `/projects/${id}/roadmap`,      label: 'Roadmap',         icon: Calendar },
  { href: `/projects/${id}/reporting`,    label: 'Reporting',       icon: BarChart3 },
  { href: `/projects/${id}/export`,       label: 'Export Center',   icon: Download },
];

interface Props {
  projectId?: string;
  projectName?: string;
}

export function Sidebar({ projectId, projectName }: Props) {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 h-full w-56 bg-white border-r border-surface-200 flex flex-col z-20">
      {/* Logo */}
      <div className="px-4 py-5 border-b border-surface-200">
        <Link href="/" className="block">
          <span className="text-xs font-mono font-semibold text-accent-600 uppercase tracking-widest">InstaOnPC</span>
          <h1 className="text-sm font-bold text-surface-900 mt-0.5 leading-tight">System Factory</h1>
        </Link>
      </div>

      <nav className="flex-1 overflow-y-auto p-3 space-y-1">
        {/* Top-level nav */}
        {topNav.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || (href !== '/' && pathname.startsWith(href) && !projectId);
          return (
            <Link
              key={href}
              href={href}
              className={`nav-link ${active ? 'nav-link-active' : ''}`}
              aria-current={active ? 'page' : undefined}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {label}
            </Link>
          );
        })}

        {/* Project-specific nav */}
        {projectId && (
          <>
            <div className="pt-3 pb-1">
              <p className="px-3 text-[10px] font-semibold text-surface-400 uppercase tracking-widest truncate">
                {projectName ?? 'Project'}
              </p>
            </div>
            {projectNav(projectId).map(({ href, label, icon: Icon }) => {
              const active = pathname === href;
              return (
                <Link
                  key={href}
                  href={href}
                  className={`nav-link text-xs ${active ? 'nav-link-active' : ''}`}
                  aria-current={active ? 'page' : undefined}
                >
                  <Icon className="h-3.5 w-3.5 shrink-0" />
                  {label}
                </Link>
              );
            })}
          </>
        )}
      </nav>

      <div className="p-3 border-t border-surface-200">
        <p className="text-[10px] text-surface-400 leading-relaxed">
          Demo mode · No live integrations active
        </p>
      </div>
    </aside>
  );
}

