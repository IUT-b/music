'use client';

interface Props {
  id: string;
  options: { value: any; label: string }[];
  value: any;
  onChange: (value: any) => void;
}

export default function Select({ id, options, value, onChange }: Props) {
  return (
    <div className="w-64">
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="block appearance-none w-full bg-white text-gray-700 border border-gray-700 px-4 py-2 pr-8 leading-tight focus:outline-none focus:shadow-outline"
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
