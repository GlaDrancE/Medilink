'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { 
  LayoutDashboard, 
  CreditCard, 
  Settings, 
  Users, 
  FileText, 
  Bell,
  LogOut,
  User
} from 'lucide-react';
import { useAuth } from '@clerk/nextjs';

interface SidebarItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
}

const sidebarItems: SidebarItem[] = [
  {
    name: 'Dashboard',
    href: '/dashboard/doctor',
    icon: LayoutDashboard,
  },
  {
    name: 'Patients',
    href: '/dashboard/doctor/patients',
    icon: Users,
  },
  {
    name: 'Prescriptions',
    href: '/dashboard/doctor/prescriptions',
    icon: FileText,
  },
  {
    name: 'Notifications',
    href: '/dashboard/doctor/notifications',
    icon: Bell,
  },
  {
    name: 'Subscription',
    href: '/subscription',
    icon: CreditCard,
  },
  {
    name: 'Settings',
    href: '/dashboard/doctor/settings',
    icon: Settings,
  },
];

export const DoctorSidebar: React.FC = () => {
  const pathname = usePathname();
  const { signOut } = useAuth();

  return (
    <div className="flex flex-col h-full bg-white border-r border-gray-200">
      {/* Logo/Brand */}
      <div className="flex items-center px-6 py-4 border-b border-gray-200">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <User className="h-5 w-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">MediLink</h2>
            <p className="text-xs text-gray-500">Doctor Portal</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-2">
        {sidebarItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors',
                isActive
                  ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              )}
            >
              <Icon className={cn(
                'mr-3 h-5 w-5',
                isActive ? 'text-blue-700' : 'text-gray-400'
              )} />
              {item.name}
              {item.badge && (
                <span className="ml-auto bg-red-100 text-red-600 text-xs px-2 py-1 rounded-full">
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* User Actions */}
      <div className="px-4 py-4 border-t border-gray-200">
        <button
          onClick={() => signOut()}
          className="flex items-center w-full px-3 py-2 text-sm font-medium text-gray-600 rounded-lg hover:bg-gray-50 hover:text-gray-900 transition-colors"
        >
          <LogOut className="mr-3 h-5 w-5 text-gray-400" />
          Sign Out
        </button>
      </div>
    </div>
  );
};