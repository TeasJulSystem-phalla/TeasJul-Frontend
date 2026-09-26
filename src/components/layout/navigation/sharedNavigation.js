// src/components/layout/navigation/sharedNavigation.js
import { UserCircle, Shield, Users, HelpCircle } from 'lucide-react';

export const systemManagementGroup = {
  label: 'ការគ្រប់គ្រងប្រព័ន្ធ',
  items: [
    // SUPER_ADMIN only: filtered out of the owner sidebar by SidebarShell.
    {
      to: '/admin/owners',
      label: 'ម្ចាស់អចលនទ្រព្យ',
      icon: Users,
      roles: ['SUPER_ADMIN'],
    },
    { to: '/owner/users', label: 'អ្នកប្រើប្រាស់', icon: UserCircle },
    { to: '/owner/roles', label: 'តួនាទី និងសិទ្ធិ', icon: Shield },
    { to: '/owner/profile', label: 'ប្រវត្តិរូប', icon: UserCircle },
  ],
};

// Admin settings live under their own SUPER_ADMIN entry in adminNavigation.js
// (ការកំណត់ប្រព័ន្ធ → /admin/settings); owners use /owner/settings instead.
export const helpGroup = {
  label: 'ជំនួយ',
  items: [{ to: '/owner/help', label: 'ជំនួយ និងការគាំទ្រ', icon: HelpCircle }],
};
