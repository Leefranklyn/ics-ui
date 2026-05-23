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
      className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
        isActive 
          ? 'bg-accent/10 text-accent' 
          : 'text-textMuted hover:text-textBase hover:bg-surface2'
      }`}
    >
      {label}
    </Link>
  );
}
