'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import NavLink from './NavLink';
import { useAuth } from '@/hooks/useAuth';

export default function NavBar() {
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { href: '/dashboard', label: 'Dashboard', exact: true },
    { href: '/dashboard/attendance', label: 'Attendance' },
    { href: '/dashboard/analytics', label: 'Analytics' },
    { href: '/dashboard/alerts', label: 'Alerts' },
  ];

  if (user?.role === 'admin') {
    navItems.push({ href: '/dashboard/cards', label: 'Cards' });
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-40 bg-bg-secondary border-b border-border-subtle backdrop-blur-xl bg-opacity-80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo with gradient */}
          <div className="flex-shrink-0">
            <Link href="/dashboard" className="flex items-center gap-2">
              <span className="heading-gradient text-2xl font-bold tracking-tight">ICS</span>
            </Link>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex gap-1 items-center min-w-0 flex-1 ml-12">
            {navItems.map(item => (
              <NavLink key={item.href} {...item} />
            ))}
          </div>

          {/* User & Logout */}
          <div className="hidden md:flex items-center gap-4 shrink-0 ml-auto">
            {user && (
              <div className="flex items-center gap-3 pl-4 border-l border-border-subtle">
                <div className="text-right">
                  <p className="text-xs font-mono text-text-secondary truncate max-w-[120px]" title={user.sub}>
                    {user.sub}
                  </p>
                  <p className="text-xs text-text-muted uppercase tracking-wider font-semibold">
                    {user.role}
                  </p>
                </div>
              </div>
            )}
            <button 
              onClick={logout}
              className="btn btn-secondary px-3 py-2 text-sm"
            >
              Exit
            </button>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-text-muted hover:text-text-primary p-2 transition-colors"
            >
              <div className="w-5 h-0.5 bg-current mb-1.5" />
              <div className="w-5 h-0.5 bg-current mb-1.5" />
              <div className="w-5 h-0.5 bg-current" />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Nav */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-bg-tertiary border-t border-border-subtle p-4 flex flex-col gap-2">
          {navItems.map(item => (
            <Link 
              key={item.href} 
              href={item.href}
              className="block px-3 py-2.5 text-sm font-medium text-text-primary hover:bg-bg-hover rounded-lg transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              {item.label}
            </Link>
          ))}
          <div className="border-t border-border my-2" />
          <button 
            onClick={logout}
            className="block w-full text-left px-3 py-2 text-base font-medium text-danger hover:bg-surface2 rounded"
          >
            Logout
          </button>
        </div>
      )}
    </nav>
  );
}
