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
  { header: 'ឈ្មោះ', accessor: 'name' },
  { header: 'តួនាទី', accessor: 'role' },
  {
    header: 'ស្ថានភាព',
    accessor: 'status',
    render: (row) => (
      <Badge variant={row.status === 'Active' ? 'success' : row.status === 'Pending' ? 'warning' : 'default'}>
        {row.status}
      </Badge>
    ),
  },
  {
    header: 'សកម្មភាព',
    render: () => (
      <div className="flex items-center gap-1">
        <IconButton icon={<Eye className="h-4 w-4" />} tooltip="មើល" size="sm" />
        <IconButton icon={<Edit className="h-4 w-4" />} tooltip="កែប្រែ" size="sm" />
      </div>
    ),
  },
];

const demoData = [
  { id: 1, name: 'អាលីស ចនសុន', role: 'អ្នកគ្រប់គ្រង', status: 'Active' },
  { id: 2, name: 'បប ស្មីត', role: 'អ្នកកែសម្រួល', status: 'Pending' },
  { id: 3, name: 'ខារ៉ុល វ៉ាយ', role: 'អ្នកមើល', status: 'Inactive' },
  { id: 4, name: 'ដេវ ប្រោន', role: 'អ្នកកែសម្រួល', status: 'Active' },
];

const selectOptions = [
  { value: 'opt1', label: 'ជម្រើសទីមួយ' },
  { value: 'opt2', label: 'ជម្រើសទីពីរ' },
  { value: 'opt3', label: 'ជម្រើសទីបី' },
];

const dropdownItems = [
  { label: 'មើលព័ត៌មានលម្អិត', icon: <Eye className="h-4 w-4" />, onClick: () => {} },
  { label: 'កែប្រែ', icon: <Edit className="h-4 w-4" />, onClick: () => {} },
  { divider: true },
  { label: 'លុប', icon: <Trash2 className="h-4 w-4" />, danger: true, onClick: () => {} },
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
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">ការបង្ហាញសមាសធាតុ UI</h1>
      <p className="text-gray-500 dark:text-gray-400">
        ការបង្ហាញសមាសធាតុ UI ដែលអាចប្រើឡើងវិញបានទាំងអស់។
      </p>

      {/* Buttons */}
      <section>
        <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">ប៊ូតុង</h2>
        <div className="flex flex-wrap items-center gap-3">
          <Button variant="primary">ចម្បង</Button>
          <Button variant="secondary">អនុវិទ្យាល័យ</Button>
          <Button variant="outline">គ្រោង</Button>
          <Button variant="ghost">ល្អក់</Button>
          <Button variant="danger">គ្រោះថ្នាក់</Button>
          <Button variant="link">តំណ</Button>
          <Button loading>កំពុងផ្ទុក</Button>
          <Button disabled>បិទ</Button>
          <Button leftIcon={<Mail className="h-4 w-4" />}>ជាមួយរូបតំណាង</Button>
          <Button fullWidth>ទទឹងពេញ</Button>
        </div>
        <div className="mt-3 flex items-center gap-3">
          <Button size="sm">តូច</Button>
          <Button size="md">មធ្យម</Button>
          <Button size="lg">ធំ</Button>
        </div>
      </section>

      <Separator />

      {/* Inputs */}
      <section>
        <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">ប្រអប់បញ្ចូល</h2>
        <div className="grid max-w-lg gap-4">
          <Input label="ឈ្មោះ" placeholder="បញ្ចូលឈ្មោះ" value={inputVal} onChange={(e) => setInputVal(e.target.value)} />
          <Input label="អ៊ីមែល" placeholder="you@example.com" leftIcon={<Mail className="h-4 w-4" />} />
          <Input label="ស្វែងរក" placeholder="ស្វែងរក..." leftIcon={<Search className="h-4 w-4" />} error="វាលនេះត្រូវបានទាមទារ" />
          <Input label="បិទ" placeholder="បិទ" disabled />
        </div>
      </section>

      <Separator />

      {/* Textarea */}
      <section>
        <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">ប្រអប់អត្ថបទ</h2>
        <div className="max-w-lg">
          <Textarea label="ការពិពណ៌នា" placeholder="បញ្ចូលការពិពណ៌នា..." rows={4} />
        </div>
      </section>

      <Separator />

      {/* Select */}
      <section>
        <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">បញ្ជីជ្រើសរើស</h2>
        <div className="max-w-lg">
          <Select label="ជ្រើសរើសជម្រើស" options={selectOptions} value={selectVal} onChange={(e) => setSelectVal(e.target.value)} />
        </div>
      </section>

      <Separator />

      {/* Checkbox, Radio, Switch */}
      <section>
        <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">ប្រអប់ធីក / ជម្រើស / កុងតាក់</h2>
        <div className="flex flex-wrap items-center gap-8">
          <Checkbox label="ទទួលយកលក្ខខណ្ឌ" checked={checkbox} onChange={(e) => setCheckbox(e.target.checked)} />
          <Radio label="ជម្រើស A" checked={radio === 'opt1'} onChange={() => setRadio('opt1')} />
          <Radio label="ជម្រើស B" checked={radio === 'opt2'} onChange={() => setRadio('opt2')} />
          <Switch label="ការជូនដំណឹង" checked={switchVal} onChange={setSwitchVal} />
        </div>
        <div className="mt-3 flex items-center gap-8">
          <Checkbox label="បិទ" disabled />
          <Radio label="បិទ" disabled />
          <Switch label="បិទ" disabled />
        </div>
      </section>

      <Separator />

      {/* Label */}
      <section>
        <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">ស្លាក</h2>
        <div className="flex items-center gap-4">
          <Label>ស្លាកលំនាំដើម</Label>
          <Label required>ស្លាកចាំបាច់</Label>
        </div>
      </section>

      <Separator />

      {/* Badges */}
      <section>
        <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">ផ្លាកសញ្ញា</h2>
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="default">លំនាំដើម</Badge>
          <Badge variant="success">ជោគជ័យ</Badge>
          <Badge variant="warning">ការព្រមាន</Badge>
          <Badge variant="danger">គ្រោះថ្នាក់</Badge>
          <Badge variant="info">ព័ត៌មាន</Badge>
          <Badge variant="neutral">អព្យាក្រឹត</Badge>
        </div>
      </section>

      <Separator />

      {/* Avatar */}
      <section>
        <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">រូបតំណាង</h2>
        <div className="flex items-center gap-4">
          <Avatar fallback="អាលីស ចនសុន" size="sm" />
          <Avatar fallback="បប ស្មីត" size="md" />
          <Avatar fallback="ខារ៉ុល វ៉ាយ" size="lg" />
          <Avatar size="md" />
        </div>
      </section>

      <Separator />

      {/* IconButton */}
      <section>
        <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">ប៊ូតុងរូបតំណាង</h2>
        <div className="flex items-center gap-2">
          <IconButton icon={<Settings className="h-4 w-4" />} tooltip="ការកំណត់" />
          <IconButton icon={<Edit className="h-4 w-4" />} tooltip="កែប្រែ" variant="outline" />
          <IconButton icon={<Trash2 className="h-4 w-4" />} tooltip="លុប" variant="danger" />
          <IconButton icon={<Eye className="h-4 w-4" />} tooltip="មើល" size="sm" />
          <IconButton icon={<MoreHorizontal className="h-4 w-4" />} tooltip="ច្រើនទៀត" disabled />
        </div>
      </section>

      <Separator />

      {/* Spinner & Skeleton */}
      <section>
        <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">Spinner និង Skeleton</h2>
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
        <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">ការជូនដំណឹង</h2>
        <div className="space-y-3 max-w-lg">
          <Alert variant="info" title="ព័ត៌មាន" description="នេះជាសារព័ត៌មាន។" dismissible />
          <Alert variant="success" title="ជោគជ័យ" description="ប្រតិបត្តិការបានបញ្ចប់ដោយជោគជ័យ។" />
          <Alert variant="warning" title="ការព្រមាន" description="សូមពិនិត្យឡើងវិញមុនពេលបន្ត។" />
          <Alert variant="danger" title="កំហុស" description="មានអ្វីមួយខុសប្រក្រតី។" />
        </div>
      </section>

      <Separator />

      {/* Cards */}
      <section>
        <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">កាត</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Card title="កាតគំរូ" description="នេះជាការពិពណ៌នាកាត។">
            <p className="text-sm text-gray-600 dark:text-gray-400">ខ្លឹមសារតួកាតលេចឡើងនៅទីនេះ។</p>
          </Card>
          <Card
            header={
              <div className="flex items-center justify-between">
                <h3 className="text-base font-semibold text-gray-900 dark:text-white">បឋមកថាផ្ទាល់ខ្លួន</h3>
                <IconButton icon={<Settings className="h-4 w-4" />} size="sm" />
              </div>
            }
            footer={<Button size="sm">រក្សាទុកការផ្លាស់ប្តូរ</Button>}
          >
            <p className="text-sm text-gray-600 dark:text-gray-400">កាតដែលមានបឋមកថា និងបាតកថាផ្ទាល់ខ្លួន។</p>
          </Card>
        </div>
      </section>

      <Separator />

      {/* Table */}
      <section>
        <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">តារាង</h2>
        <Table columns={demoColumns} data={demoData} />
      </section>

      <Separator />

      {/* Pagination */}
      <section>
        <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">ការបែងចែកទំព័រ</h2>
        <Pagination currentPage={page} totalPages={10} onPageChange={setPage} />
      </section>

      <Separator />

      {/* Tabs */}
      <section>
        <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">ផ្ទាំង</h2>
        <Tabs
          tabs={[
            { label: 'ទិដ្ឋភាពទូទៅ', value: 'overview' },
            { label: 'ព័ត៌មានលម្អិត', value: 'details' },
            { label: 'ការកំណត់', value: 'settings' },
          ]}
          activeTab={tab}
          onChange={setTab}
        />
        <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
          ផ្ទាំងសកម្ម៖ <span className="font-medium text-gray-900 dark:text-white">{tab}</span>
        </div>
      </section>

      <Separator />

      {/* Dropdown & Tooltip */}
      <section>
        <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">បញ្ជីទម្លាក់ចុះ និងព័ត៌មានជំនួយ</h2>
        <div className="flex items-center gap-4">
          <Dropdown items={dropdownItems} />
          <Tooltip content="នេះជាព័ត៌មានជំនួយ">
            <Button variant="outline" size="sm">ដាក់កណ្តុរលើខ្ញុំ</Button>
          </Tooltip>
        </div>
      </section>

      <Separator />

      {/* Modal */}
      <section>
        <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">បង្អួចលេចឡើង</h2>
        <Button onClick={() => setModalOpen(true)}>បើកបង្អួចលេចឡើង</Button>
        <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="បង្អួចគំរូ" description="នេះជាបង្អួចសាកល្បង។" size="md">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            ខ្លឹមសារបង្អួចលេចឡើងនៅទីនេះ។ ចុចខាងក្រៅ ឬចុច Escape ដើម្បីបិទ។
          </p>
          <div className="mt-4 flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setModalOpen(false)}>បោះបង់</Button>
            <Button onClick={() => setModalOpen(false)}>បញ្ជាក់</Button>
          </div>
        </Modal>
      </section>

      <Separator />

      {/* Confirm Dialog */}
      <section>
        <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">ប្រអប់បញ្ជាក់</h2>
        <Button variant="danger" onClick={() => setConfirmOpen(true)}>លុបធាតុ</Button>
        <ConfirmDialog
          open={confirmOpen}
          title="លុបធាតុ"
          description="តើអ្នកប្រាកដថាចង់លុបធាតុនេះឬ? សកម្មភាពនេះមិនអាចត្រឡប់វិញបានទេ។"
          confirmText="លុប"
          cancelText="បោះបង់"
          onConfirm={() => { setConfirmOpen(false); toast.success('បានលុប', 'លុបធាតុដោយជោគជ័យ។'); }}
          onCancel={() => setConfirmOpen(false)}
          danger
        />
      </section>

      <Separator />

      {/* Toast */}
      <section>
        <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">សារជូនដំណឹង Toast</h2>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={() => toast.success('ជោគជ័យ', 'ប្រតិបត្តិការបានបញ្ចប់។')}>ជោគជ័យ</Button>
          <Button variant="outline" size="sm" onClick={() => toast.error('កំហុស', 'មានអ្វីមួយខុសប្រក្រតី។')}>កំហុស</Button>
          <Button variant="outline" size="sm" onClick={() => toast.warning('ការព្រមាន', 'សូមពិនិត្យ។')}>ការព្រមាន</Button>
          <Button variant="outline" size="sm" onClick={() => toast.info('ព័ត៌មាន', 'នេះជាព័ត៌មានមួយចំនួន។')}>ព័ត៌មាន</Button>
        </div>
      </section>

      <Separator />

      {/* Empty State */}
      <section>
        <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">ស្ថានភាពទទេ</h2>
        <EmptyState
          icon={FileText}
          title="រកមិនឃើញកំណត់ត្រា"
          description="មិនទាន់មានកំណត់ត្រាណាមួយត្រូវបង្ហាញទេ។"
          action={<Button size="sm">បង្កើតថ្មី</Button>}
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
