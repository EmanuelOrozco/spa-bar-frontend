'use client';

import { cn } from '@/lib/utils';
import { ChevronDown, Check } from 'lucide-react';
import {
  forwardRef,
  useEffect,
  useId,
  useImperativeHandle,
  useRef,
  useState,
  SelectHTMLAttributes,
} from 'react';

interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'size'> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
  size?: 'sm' | 'md';
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      className,
      label,
      error,
      id: idProp,
      options,
      value,
      defaultValue,
      onChange,
      onBlur,
      name,
      disabled,
      size = 'md',
      ...props
    },
    ref
  ) => {
    const generatedId = useId();
    const id = idProp ?? generatedId;
    const containerRef = useRef<HTMLDivElement>(null);
    const hiddenSelectRef = useRef<HTMLSelectElement>(null);
    const [open, setOpen] = useState(false);

    const isControlled = value !== undefined;
    const [internalValue, setInternalValue] = useState<string>(
      () => (value ?? defaultValue ?? options[0]?.value ?? '') as string
    );

    const currentValue = isControlled ? String(value) : internalValue;
    const selectedOption = options.find((opt) => opt.value === currentValue);
    const displayLabel = selectedOption?.label ?? 'Seleccionar...';

    useImperativeHandle(ref, () => hiddenSelectRef.current as HTMLSelectElement);

    useEffect(() => {
      if (isControlled) return;
      if (defaultValue !== undefined) setInternalValue(String(defaultValue));
    }, [defaultValue, isControlled]);

    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
          setOpen(false);
        }
      };
      const handleEscape = (event: KeyboardEvent) => {
        if (event.key === 'Escape') setOpen(false);
      };
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
        document.removeEventListener('keydown', handleEscape);
      };
    }, []);

    const emitChange = (nextValue: string) => {
      if (!isControlled) setInternalValue(nextValue);
      if (hiddenSelectRef.current) hiddenSelectRef.current.value = nextValue;
      onChange?.({
        target: { value: nextValue, name: name ?? '' },
        currentTarget: { value: nextValue, name: name ?? '' },
      } as React.ChangeEvent<HTMLSelectElement>);
      setOpen(false);
    };

    const handleBlur = () => {
      onBlur?.({
        target: { value: currentValue, name: name ?? '' },
        currentTarget: { value: currentValue, name: name ?? '' },
      } as React.FocusEvent<HTMLSelectElement>);
    };

    const triggerClasses = cn(
      'flex w-full items-center justify-between gap-2 rounded-lg border border-border bg-black/20 text-left text-foreground outline-none transition-colors',
      'hover:border-white/15 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20',
      size === 'sm' ? 'px-2.5 py-1.5 text-xs' : 'px-4 py-2.5 text-sm',
      error && 'border-danger focus:border-danger focus:ring-danger/20',
      disabled && 'cursor-not-allowed opacity-50',
      open && 'border-brand-500 ring-2 ring-brand-500/20',
      size === 'sm' ? 'min-w-[140px]' : ''
    );

    return (
      <div ref={containerRef} className={cn('relative space-y-1.5', className)}>
        {label && (
          <label htmlFor={id} className="block text-sm text-muted">
            {label}
          </label>
        )}

        <button
          type="button"
          id={id}
          disabled={disabled}
          aria-haspopup="listbox"
          aria-expanded={open}
          className={triggerClasses}
          onClick={() => !disabled && setOpen((prev) => !prev)}
          onBlur={handleBlur}
        >
          <span className="truncate">{displayLabel}</span>
          <ChevronDown
            className={cn(
              'shrink-0 text-muted transition-transform',
              size === 'sm' ? 'h-3.5 w-3.5' : 'h-4 w-4',
              open && 'rotate-180'
            )}
          />
        </button>

        {open && (
          <ul
            role="listbox"
            className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-xl border border-border bg-surface-elevated p-1 shadow-2xl shadow-black/40"
          >
            {options.map((opt) => {
              const isSelected = opt.value === currentValue;
              return (
                <li key={opt.value || '__empty'} role="option" aria-selected={isSelected}>
                  <button
                    type="button"
                    className={cn(
                      'flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2.5 text-left text-sm transition-colors',
                      isSelected
                        ? 'bg-brand-500/15 text-brand-500'
                        : 'text-foreground hover:bg-white/5'
                    )}
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => emitChange(opt.value)}
                  >
                    <span className="truncate">{opt.label}</span>
                    {isSelected && <Check className="h-4 w-4 shrink-0" />}
                  </button>
                </li>
              );
            })}
          </ul>
        )}

        <select
          ref={hiddenSelectRef}
          name={name}
          value={currentValue}
          defaultValue={defaultValue}
          onChange={onChange}
          onBlur={onBlur}
          disabled={disabled}
          tabIndex={-1}
          aria-hidden
          className="sr-only"
          {...props}
        >
          {options.map((opt) => (
            <option key={opt.value || '__empty'} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        {error && <p className="text-xs text-danger">{error}</p>}
      </div>
    );
  }
);

Select.displayName = 'Select';
