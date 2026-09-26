// src/components/layout/navigation/adminNavigation.js
import {
  Gauge,
  Settings,
  Building2,
  Plus,
  FileText,
  Send,
  History,
  List,
  MessageSquare,
  SlidersHorizontal,
} from 'lucide-react';
import { systemManagementGroup, helpGroup } from './sharedNavigation';

export const ADMIN_BRAND_SUBTITLE = 'អ្នកគ្រប់គ្រងប្រព័ន្ធ';
export const adminNavigation = [
  {
    label: 'ទូទៅ',
    roles: ['SUPER_ADMIN'],
    items: [
      { to: '/admin/dashboard', label: 'ផ្ទាំងគ្រប់គ្រង', icon: Gauge, end: true },
      { to: '/admin/feedback', label: 'គ្រប់គ្រងមតិម្ចាស់', icon: MessageSquare },
    ],
  },
  {
    label: 'អចលនទ្រព្យ',
    roles: ['SUPER_ADMIN'],
    items: [
      {
        basePath: '/admin/properties',
        label: 'អចលនទ្រព្យ',
        icon: Building2,
        children: [
          { to: '/admin/properties', label: 'បញ្ជីអចលនទ្រព្យ', icon: List, end: true },
          { to: '/admin/properties/new', label: 'ផ្សាយអចលនទ្រព្យថ្មី', icon: Plus },
          { to: '/admin/properties/drafts', label: 'ព្រាងអចលនទ្រព្យ', icon: FileText },
        ],
      },
      { to: '/admin/submissions', label: 'ការពិនិត្យផ្សាយ', icon: Send },
    ],
  },
  systemManagementGroup,
  {
    label: 'ប្រព័ន្ធ និងការកំណត់',
    roles: ['SUPER_ADMIN'],
    items: [
      { to: '/admin/system-defaults', label: 'ប្រព័ន្ធលំនាទ្រព្យដើម', icon: Settings },
      { to: '/admin/settings', label: 'ការកំណត់ប្រព័ន្ធ', icon: SlidersHorizontal, end: true },
      { to: '/admin/settings/security/login-history', label: 'ប្រវត្តិចូលប្រព័ន្ធ', icon: History },
    ],
  },
];
