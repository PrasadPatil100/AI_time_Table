export interface ColorPalette {
  color: string;
  bgLight: string;
  borderClass: string;
  textClass: string;
  badgeClass: string;
  hex: string;
}

export const COLOR_PALETTES: ColorPalette[] = [
  {
    color: 'indigo',
    bgLight: 'bg-indigo-50 hover:bg-indigo-100/70',
    borderClass: 'border-indigo-200 border-l-4 border-l-indigo-500',
    textClass: 'text-indigo-900',
    badgeClass: 'bg-indigo-100 text-indigo-700',
    hex: '#6366f1',
  },
  {
    color: 'emerald',
    bgLight: 'bg-emerald-50 hover:bg-emerald-100/70',
    borderClass: 'border-emerald-200 border-l-4 border-l-emerald-500',
    textClass: 'text-emerald-900',
    badgeClass: 'bg-emerald-100 text-emerald-700',
    hex: '#10b981',
  },
  {
    color: 'amber',
    bgLight: 'bg-amber-50 hover:bg-amber-100/70',
    borderClass: 'border-amber-200 border-l-4 border-l-amber-500',
    textClass: 'text-amber-900',
    badgeClass: 'bg-amber-100 text-amber-700',
    hex: '#f59e0b',
  },
  {
    color: 'rose',
    bgLight: 'bg-rose-50 hover:bg-rose-100/70',
    borderClass: 'border-rose-200 border-l-4 border-l-rose-500',
    textClass: 'text-rose-900',
    badgeClass: 'bg-rose-100 text-rose-700',
    hex: '#f43f5e',
  },
  {
    color: 'sky',
    bgLight: 'bg-sky-50 hover:bg-sky-100/70',
    borderClass: 'border-sky-200 border-l-4 border-l-sky-500',
    textClass: 'text-sky-900',
    badgeClass: 'bg-sky-100 text-sky-700',
    hex: '#0ea5e9',
  },
  {
    color: 'purple',
    bgLight: 'bg-purple-50 hover:bg-purple-100/70',
    borderClass: 'border-purple-200 border-l-4 border-l-purple-500',
    textClass: 'text-purple-900',
    badgeClass: 'bg-purple-100 text-purple-700',
    hex: '#a855f7',
  },
  {
    color: 'teal',
    bgLight: 'bg-teal-50 hover:bg-teal-100/70',
    borderClass: 'border-teal-200 border-l-4 border-l-teal-500',
    textClass: 'text-teal-900',
    badgeClass: 'bg-teal-100 text-teal-700',
    hex: '#14b8a6',
  },
  {
    color: 'orange',
    bgLight: 'bg-orange-50 hover:bg-orange-100/70',
    borderClass: 'border-orange-200 border-l-4 border-l-orange-500',
    textClass: 'text-orange-900',
    badgeClass: 'bg-orange-100 text-orange-700',
    hex: '#f97316',
  },
];
