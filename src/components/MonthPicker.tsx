import { monthLabel, shiftMonth } from '../lib/dates';

interface MonthPickerProps {
  month: string;
  onChange: (month: string) => void;
}

export function MonthPicker({ month, onChange }: MonthPickerProps) {
  return (
    <div className="month-picker">
      <button type="button" className="icon-button" aria-label="Previous month" onClick={() => onChange(shiftMonth(month, -1))}>
        &lsaquo;
      </button>
      <span className="month-picker-label">{monthLabel(month)}</span>
      <button type="button" className="icon-button" aria-label="Next month" onClick={() => onChange(shiftMonth(month, 1))}>
        &rsaquo;
      </button>
    </div>
  );
}
