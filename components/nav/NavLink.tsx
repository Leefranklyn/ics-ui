'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface NavLinkProps {
  href: string;
  label: string;
  exact?: boolean;
}

export default function NavLink({ href, label, exact = false }: NavLinkProps) {
  const pathname = usePathname();
  const isActive = exact ? pathname === href : pathname.startsWith(href);

  return (
    <Link 
      href={href}
      className={`px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 border ${
        isActive 
          ? 'bg-accent-indigo/10 text-accent-cyan-bright border-accent-indigo/30' 
          : 'text-text-muted hover:text-text-primary border-transparent hover:bg-bg-hover hover:border-border-subtle'
      }`}
    >
      {label}
    </Link>
  );
}
