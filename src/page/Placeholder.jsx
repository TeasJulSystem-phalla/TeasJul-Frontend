// src/page/Placeholder.jsx
import { Construction } from 'lucide-react';

const Placeholder = ({ title }) => (
  <div className="flex min-h-[60vh] flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-white text-center dark:border-gray-700 dark:bg-gray-900">
    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 dark:bg-gray-800 dark:text-slate-500">
      <Construction className="h-7 w-7" />
    </div>
    <h1 className="mt-4 text-xl font-semibold text-slate-800 dark:text-white">{title}</h1>
    <p className="mt-1 max-w-sm text-sm text-slate-500 dark:text-slate-400">
      ទំព័រនេះកំពុងស្ថិតក្រោមការសាងសង់។ ប្លង់ ការរុករក និងរបារចំហៀងដែលឆ្លើយតបនឹងទំហំអេក្រង់ បានត្រៀមរួចរាល់សម្រាប់ប្រើប្រាស់។
    </p>
  </div>
);

export default Placeholder;
