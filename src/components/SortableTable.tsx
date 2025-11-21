import { useState, useMemo, ReactNode } from "react";
import { ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";

// Hook para gerenciar ordenação de tabelas
export function useSortableData<T>(items: T[], initialKey?: keyof T, initialDirection?: 'asc' | 'desc') {
  const [sortKey, setSortKey] = useState<keyof T | null>(initialKey || null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>(initialDirection || 'desc');

  const sortedItems = useMemo(() => {
    if (!sortKey) return items;

    const sorted = [...items].sort((a, b) => {
      const aValue = a[sortKey];
      const bValue = b[sortKey];

      if (aValue === null || aValue === undefined) return 1;
      if (bValue === null || bValue === undefined) return -1;

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortDirection === 'asc'
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return sorted;
  }, [items, sortKey, sortDirection]);

  const requestSort = (key: keyof T) => {
    if (sortKey === key) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDirection('desc'); // Por padrão começar com desc para números (maior primeiro)
    }
  };

  return { sortedItems, requestSort, sortKey, sortDirection };
}

// Componente para cabeçalho de coluna ordenável
interface SortableHeaderProps<T> {
  column: keyof T;
  label: string;
  sortKey: keyof T | null;
  sortDirection: 'asc' | 'desc';
  requestSort: (key: keyof T) => void;
  align?: 'left' | 'right' | 'center';
}

export function SortableHeader<T>({
  column,
  label,
  sortKey,
  sortDirection,
  requestSort,
  align = 'left'
}: SortableHeaderProps<T>) {
  const isSorted = sortKey === column;

  const alignClass = align === 'right' ? 'text-right' : align === 'center' ? 'text-center' : 'text-left';
  const justifyClass = align === 'right' ? 'justify-end' : align === 'center' ? 'justify-center' : '';

  return (
    <th
      className={`${alignClass} p-3 font-medium cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 select-none transition-colors`}
      onClick={() => requestSort(column)}
    >
      <div className={`flex items-center gap-1 ${justifyClass}`}>
        <span>{label}</span>
        {isSorted ? (
          sortDirection === 'asc' ?
            <ArrowUp className="w-4 h-4 flex-shrink-0" /> :
            <ArrowDown className="w-4 h-4 flex-shrink-0" />
        ) : (
          <ArrowUpDown className="w-4 h-4 opacity-30 flex-shrink-0" />
        )}
      </div>
    </th>
  );
}
