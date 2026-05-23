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
    <nav className="bg-surface border-b border-border sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link href="/dashboard" className="flex items-center gap-2">
              <span className="text-xl font-bold text-accent tracking-wider">ICS</span>
            </Link>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex gap-1 overflow-x-auto min-w-0">
            {navItems.map(item => (
              <NavLink key={item.href} {...item} />
            ))}
          </div>

          {/* User & Logout */}
          <div className="hidden md:flex items-center gap-4 shrink-0">
            {user && (
              <div className="text-sm flex items-center gap-2 min-w-0">
                <span className="text-textBase truncate max-w-[150px]" title={user.sub}>{user.sub}</span>
                <span className="px-2 py-0.5 rounded text-xs bg-surface2 text-textMuted uppercase tracking-wider shrink-0">{user.role}</span>
              </div>
            )}
            <button 
              onClick={logout}
              className="text-sm text-danger hover:text-danger/80 transition-colors"
            >
              Logout
            </button>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-textMuted hover:text-textBase p-2"
            >
              <div className="w-6 h-0.5 bg-current mb-1.5" />
              <div className="w-6 h-0.5 bg-current mb-1.5" />
              <div className="w-6 h-0.5 bg-current" />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Nav */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-surface border-t border-border p-4 flex flex-col gap-2">
          {navItems.map(item => (
            <Link 
              key={item.href} 
              href={item.href}
              className="block px-3 py-2 text-base font-medium text-textBase hover:bg-surface2 rounded"
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
