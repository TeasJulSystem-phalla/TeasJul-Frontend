import { useState } from 'react';
import {
  Search,
  Mail,
  Settings,
  Trash2,
  Edit,
  Eye,
  MoreHorizontal,
  FileText,
} from 'lucide-react';

import { ToastProvider, useToast } from './Toast';
import Button from './Button';
import Input from './Input';
import Textarea from './Textarea';
import Select from './Select';
import Checkbox from './Checkbox';
import Radio from './Radio';
import Switch from './Switch';
import Label from './Label';
import Card from './Card';
import Badge from './Badge';
import Avatar from './Avatar';
import IconButton from './IconButton';
import Spinner from './Spinner';
import Skeleton from './Skeleton';
import Alert from './Alert';
import Modal from './Modal';
import ConfirmDialog from './ConfirmDialog';
import Dropdown from './Dropdown';
import Tooltip from './Tooltip';
import Table from './Table';
import Pagination from './Pagination';
import Tabs from './Tabs';
import Separator from './Separator';
import EmptyState from './EmptyState';

const demoColumns = [
  { header: 'Name', accessor: 'name' },
  { header: 'Role', accessor: 'role' },
  {
    header: 'Status',
    accessor: 'status',
    render: (row) => (
      <Badge variant={row.status === 'Active' ? 'success' : row.status === 'Pending' ? 'warning' : 'default'}>
        {row.status}
      </Badge>
    ),
  },
  {
    header: 'Actions',
    render: () => (
      <div className="flex items-center gap-1">
        <IconButton icon={<Eye className="h-4 w-4" />} tooltip="View" size="sm" />
        <IconButton icon={<Edit className="h-4 w-4" />} tooltip="Edit" size="sm" />
      </div>
    ),
  },
];

const demoData = [
  { id: 1, name: 'Alice Johnson', role: 'Admin', status: 'Active' },
  { id: 2, name: 'Bob Smith', role: 'Editor', status: 'Pending' },
  { id: 3, name: 'Carol White', role: 'Viewer', status: 'Inactive' },
  { id: 4, name: 'Dave Brown', role: 'Editor', status: 'Active' },
];

const selectOptions = [
  { value: 'opt1', label: 'Option One' },
  { value: 'opt2', label: 'Option Two' },
  { value: 'opt3', label: 'Option Three' },
];

const dropdownItems = [
  { label: 'View Details', icon: <Eye className="h-4 w-4" />, onClick: () => {} },
  { label: 'Edit', icon: <Edit className="h-4 w-4" />, onClick: () => {} },
  { divider: true },
  { label: 'Delete', icon: <Trash2 className="h-4 w-4" />, danger: true, onClick: () => {} },
];

const UiShowcaseContent = () => {
  const toast = useToast();
  const [inputVal, setInputVal] = useState('');
  const [selectVal, setSelectVal] = useState('');
  const [checkbox, setCheckbox] = useState(false);
  const [radio, setRadio] = useState('opt1');
  const [switchVal, setSwitchVal] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [tab, setTab] = useState('overview');
  const [page, setPage] = useState(1);

  return (
    <div className="mx-auto max-w-5xl space-y-12 p-8">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">UI Component Showcase</h1>
      <p className="text-gray-500 dark:text-gray-400">
        A demo of all reusable UI components.
      </p>

      {/* Buttons */}
      <section>
        <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">Buttons</h2>
        <div className="flex flex-wrap items-center gap-3">
          <Button variant="primary">Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="danger">Danger</Button>
          <Button variant="link">Link</Button>
          <Button loading>Loading</Button>
          <Button disabled>Disabled</Button>
          <Button leftIcon={<Mail className="h-4 w-4" />}>With Icon</Button>
          <Button fullWidth>Full Width</Button>
        </div>
        <div className="mt-3 flex items-center gap-3">
          <Button size="sm">Small</Button>
          <Button size="md">Medium</Button>
          <Button size="lg">Large</Button>
        </div>
      </section>

      <Separator />

      {/* Inputs */}
      <section>
        <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">Inputs</h2>
        <div className="grid max-w-lg gap-4">
          <Input label="Name" placeholder="Enter name" value={inputVal} onChange={(e) => setInputVal(e.target.value)} />
          <Input label="Email" placeholder="you@example.com" leftIcon={<Mail className="h-4 w-4" />} />
          <Input label="Search" placeholder="Search..." leftIcon={<Search className="h-4 w-4" />} error="This field is required" />
          <Input label="Disabled" placeholder="Disabled" disabled />
        </div>
      </section>

      <Separator />

      {/* Textarea */}
      <section>
        <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">Textarea</h2>
        <div className="max-w-lg">
          <Textarea label="Description" placeholder="Enter description..." rows={4} />
        </div>
      </section>

      <Separator />

      {/* Select */}
      <section>
        <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">Select</h2>
        <div className="max-w-lg">
          <Select label="Choose Option" options={selectOptions} value={selectVal} onChange={(e) => setSelectVal(e.target.value)} />
        </div>
      </section>

      <Separator />

      {/* Checkbox, Radio, Switch */}
      <section>
        <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">Checkbox / Radio / Switch</h2>
        <div className="flex flex-wrap items-center gap-8">
          <Checkbox label="Accept terms" checked={checkbox} onChange={(e) => setCheckbox(e.target.checked)} />
          <Radio label="Option A" checked={radio === 'opt1'} onChange={() => setRadio('opt1')} />
          <Radio label="Option B" checked={radio === 'opt2'} onChange={() => setRadio('opt2')} />
          <Switch label="Notifications" checked={switchVal} onChange={setSwitchVal} />
        </div>
        <div className="mt-3 flex items-center gap-8">
          <Checkbox label="Disabled" disabled />
          <Radio label="Disabled" disabled />
          <Switch label="Disabled" disabled />
        </div>
      </section>

      <Separator />

      {/* Label */}
      <section>
        <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">Label</h2>
        <div className="flex items-center gap-4">
          <Label>Default Label</Label>
          <Label required>Required Label</Label>
        </div>
      </section>

      <Separator />

      {/* Badges */}
      <section>
        <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">Badges</h2>
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="default">Default</Badge>
          <Badge variant="success">Success</Badge>
          <Badge variant="warning">Warning</Badge>
          <Badge variant="danger">Danger</Badge>
          <Badge variant="info">Info</Badge>
          <Badge variant="neutral">Neutral</Badge>
        </div>
      </section>

      <Separator />

      {/* Avatar */}
      <section>
        <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">Avatar</h2>
        <div className="flex items-center gap-4">
          <Avatar fallback="Alice Johnson" size="sm" />
          <Avatar fallback="Bob Smith" size="md" />
          <Avatar fallback="Carol White" size="lg" />
          <Avatar size="md" />
        </div>
      </section>

      <Separator />

      {/* IconButton */}
      <section>
        <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">Icon Button</h2>
        <div className="flex items-center gap-2">
          <IconButton icon={<Settings className="h-4 w-4" />} tooltip="Settings" />
          <IconButton icon={<Edit className="h-4 w-4" />} tooltip="Edit" variant="outline" />
          <IconButton icon={<Trash2 className="h-4 w-4" />} tooltip="Delete" variant="danger" />
          <IconButton icon={<Eye className="h-4 w-4" />} tooltip="View" size="sm" />
          <IconButton icon={<MoreHorizontal className="h-4 w-4" />} tooltip="More" disabled />
        </div>
      </section>

      <Separator />

      {/* Spinner & Skeleton */}
      <section>
        <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">Spinner & Skeleton</h2>
        <div className="flex items-center gap-6">
          <Spinner size="sm" />
          <Spinner size="md" />
          <Spinner size="lg" />
        </div>
        <div className="mt-4 space-y-3 max-w-md">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-20 w-full" />
        </div>
      </section>

      <Separator />

      {/* Alerts */}
      <section>
        <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">Alerts</h2>
        <div className="space-y-3 max-w-lg">
          <Alert variant="info" title="Information" description="This is an informational message." dismissible />
          <Alert variant="success" title="Success" description="Operation completed successfully." />
          <Alert variant="warning" title="Warning" description="Please review before proceeding." />
          <Alert variant="danger" title="Error" description="Something went wrong." />
        </div>
      </section>

      <Separator />

      {/* Cards */}
      <section>
        <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">Cards</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Card title="Sample Card" description="This is a card description.">
            <p className="text-sm text-gray-600 dark:text-gray-400">Card body content goes here.</p>
          </Card>
          <Card
            header={
              <div className="flex items-center justify-between">
                <h3 className="text-base font-semibold text-gray-900 dark:text-white">Custom Header</h3>
                <IconButton icon={<Settings className="h-4 w-4" />} size="sm" />
              </div>
            }
            footer={<Button size="sm">Save Changes</Button>}
          >
            <p className="text-sm text-gray-600 dark:text-gray-400">Card with custom header and footer.</p>
          </Card>
        </div>
      </section>

      <Separator />

      {/* Table */}
      <section>
        <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">Table</h2>
        <Table columns={demoColumns} data={demoData} />
      </section>

      <Separator />

      {/* Pagination */}
      <section>
        <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">Pagination</h2>
        <Pagination currentPage={page} totalPages={10} onPageChange={setPage} />
      </section>

      <Separator />

      {/* Tabs */}
      <section>
        <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">Tabs</h2>
        <Tabs
          tabs={[
            { label: 'Overview', value: 'overview' },
            { label: 'Details', value: 'details' },
            { label: 'Settings', value: 'settings' },
          ]}
          activeTab={tab}
          onChange={setTab}
        />
        <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
          Active tab: <span className="font-medium text-gray-900 dark:text-white">{tab}</span>
        </div>
      </section>

      <Separator />

      {/* Dropdown & Tooltip */}
      <section>
        <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">Dropdown & Tooltip</h2>
        <div className="flex items-center gap-4">
          <Dropdown items={dropdownItems} />
          <Tooltip content="This is a tooltip">
            <Button variant="outline" size="sm">Hover me</Button>
          </Tooltip>
        </div>
      </section>

      <Separator />

      {/* Modal */}
      <section>
        <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">Modal</h2>
        <Button onClick={() => setModalOpen(true)}>Open Modal</Button>
        <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Sample Modal" description="This is a demo modal." size="md">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Modal content goes here. Click outside or press Escape to close.
          </p>
          <div className="mt-4 flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button onClick={() => setModalOpen(false)}>Confirm</Button>
          </div>
        </Modal>
      </section>

      <Separator />

      {/* Confirm Dialog */}
      <section>
        <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">Confirm Dialog</h2>
        <Button variant="danger" onClick={() => setConfirmOpen(true)}>Delete Item</Button>
        <ConfirmDialog
          open={confirmOpen}
          title="Delete Item"
          description="Are you sure you want to delete this item? This action cannot be undone."
          confirmText="Delete"
          cancelText="Cancel"
          onConfirm={() => { setConfirmOpen(false); toast.success('Deleted', 'Item deleted successfully.'); }}
          onCancel={() => setConfirmOpen(false)}
          danger
        />
      </section>

      <Separator />

      {/* Toast */}
      <section>
        <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">Toast</h2>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={() => toast.success('Success', 'Operation completed.')}>Success</Button>
          <Button variant="outline" size="sm" onClick={() => toast.error('Error', 'Something went wrong.')}>Error</Button>
          <Button variant="outline" size="sm" onClick={() => toast.warning('Warning', 'Please check.')}>Warning</Button>
          <Button variant="outline" size="sm" onClick={() => toast.info('Info', 'Here is some info.')}>Info</Button>
        </div>
      </section>

      <Separator />

      {/* Empty State */}
      <section>
        <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">Empty State</h2>
        <EmptyState
          icon={FileText}
          title="No records found"
          description="There are no records to display yet."
          action={<Button size="sm">Create New</Button>}
        />
      </section>
    </div>
  );
};

const UiShowcase = () => {
  return (
    <ToastProvider>
      <UiShowcaseContent />
    </ToastProvider>
  );
};

export default UiShowcase;
