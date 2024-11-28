'use client';

interface DateTimeSelectProps {
  type: string;
  id: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
}

export default function Input({ type, id, value, onChange, required }: DateTimeSelectProps) {
  return (
    <div className="w-64">
      <input
        type={type}
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        className="block appearance-none w-full bg-white text-green-400 border border-green-400 px-4 py-2 pr-8 leading-tight focus:outline-none focus:shadow-outline"
      />
    </div>
  );
}
