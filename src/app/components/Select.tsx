'use client';

interface SelectProps {
  id: string;
  options: { value: string; label: string }[];
  value: string;
  onChange: (value: string) => void;
}

export default function Select({ id, options, value, onChange }: SelectProps) {
  return (
    <div className="w-64">
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="block appearance-none w-full bg-white text-green-400 border border-green-400 px-4 py-2 pr-8 leading-tight focus:outline-none focus:shadow-outline"
      >
        {options.map((option, index) => (
          <option key={index} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}
