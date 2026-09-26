// src/components/layout/navigation/ownerNavigation.js
import {
  LayoutDashboard,
  BarChart3,
  Bell,
  Star,
  Building2,
  DoorOpen,
  Send,
  Layers,
  Sparkles,
  KeyRound,
  Users,
  MailPlus,
  FileText,
  Wallet,
  Receipt,
  CreditCard,
  Zap,
  Tags,
  Gauge,
  ClipboardList,
  CircleDollarSign,
  Wrench,
  Folder,
} from 'lucide-react';
import { systemManagementGroup, helpGroup } from './sharedNavigation';

export const OWNER_BRAND_SUBTITLE = 'អ្នកជាម្ចាស់អចលនទ្រព្យ';
export const ownerNavigation = [
  {
    label: 'មេ',
    items: [
      { to: '/owner/dashboard', label: 'ផ្ទាំងគ្រប់គ្រង', icon: LayoutDashboard, end: true },
      { to: '/owner/owner-report', label: 'របាយការណ៍ប្រចាំខែ', icon: BarChart3 },
      { to: '/owner/notifications', label: 'ការជូនដំណឹង', icon: Bell },
      { to: '/owner/feedback', label: 'វាយតម្លៃ TeasJul', icon: Star },
    ],
  },
  {
    label: 'អចលនទ្រព្យ',
    items: [
      { to: '/owner/properties', label: 'អចលនទ្រព្យ', icon: Building2 },
      { to: '/owner/rooms', label: 'បន្ទប់', icon: DoorOpen },
      { to: '/owner/submissions', label: 'ការផ្សាយបន្ទប់', icon: Send, roles: ['OWNER'] },
      { to: '/owner/roomtype', label: 'ប្រភេទបន្ទប់', icon: Layers },
      { to: '/owner/amenities', label: 'សម្ភារ:ប្រើប្រាស់', icon: Sparkles },
      { to: '/owner/access', label: 'ការចូលដំណើរការផ្ទះ', icon: KeyRound },
    ],
  },
  {
    label: 'អ្នកជួល និងកិច្ចសន្យា',
    items: [
      { to: '/owner/tenants', label: 'អ្នកជួល', icon: Users },
      { to: '/owner/tenant-invitations', label: 'អញ្ជើញអ្នកជួល', icon: MailPlus },
      { to: '/owner/contracts', label: 'កិច្ចសន្យា', icon: FileText },
    ],
  },
  {
    label: 'ហិរញ្ញវត្ថុ',
    items: [
      {
        basePath: '/owner/finance',
        label: 'ហិរញ្ញវត្ថុ',
        icon: Wallet,
        children: [
          { to: '/owner/finance/payments', label: 'ការទូទាត់', icon: Wallet, end: true },
          { to: '/owner/invoices', label: 'វិក្កយបត្រ', icon: Receipt },
          {
            to: '/owner/finance/payment-methods',
            label: 'វិធីសាស្ត្រទូទាត់',
            icon: CreditCard,
          },
        ],
      },
    ],
  },
  {
    label: 'ប្រតិបត្តិការ',
    items: [
      {
        basePath: '/owner/utilities',
        label: 'ប្រើប្រាស់ទឹកភ្លើង',
        icon: Zap,
        children: [
          { to: '/owner/utilities', label: 'ប្រភេទប្រើប្រាស់', icon: Tags, end: true },
          { to: '/owner/utilities/meters', label: 'ម៉ែត្រប្រើប្រាស់', icon: Gauge },
          { to: '/owner/utilities/readings', label: 'ការអានម៉ែត្រ', icon: ClipboardList },
          { to: '/owner/utilities/rates', label: 'តម្លៃប្រើប្រាស់', icon: CircleDollarSign },
        ],
      },
      {
        basePath: '/owner/maintenance',
        label: 'ការជួសជុល',
        icon: Wrench,
        children: [
          { to: '/owner/maintenance', label: 'សំណើជួសជុល', icon: Wrench, end: true },
          {
            to: '/owner/maintenance/categories',
            label: 'ប្រភេទការជួសជុល',
            icon: Folder,
          },
        ],
      },
    ],
  },
  systemManagementGroup,
  helpGroup,
];

const TENANT_PAYMENTS_ITEM = {
  to: '/tenant/payments',
  label: 'ការទូទាត់របស់ខ្ញុំ',
  icon: Wallet,
};

const FINANCE_BASE_PATH = '/owner/finance';

export function withTenantPayments(groups) {
  return groups.map((group) => {
    if (group.label !== 'ហិរញ្ញវត្ថុ') return group;
    return {
      ...group,
      items: group.items.map((item) => {
        if (item.basePath !== FINANCE_BASE_PATH || !item.children) return item;
        if (item.children.some((child) => child.to === TENANT_PAYMENTS_ITEM.to)) {
          return item;
        }
        return { ...item, children: [...item.children, TENANT_PAYMENTS_ITEM] };
      }),
    };
  });
}
