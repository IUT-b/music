'use client';

interface ButtonProps {
  label: string;
}

export default function Button({ label }: ButtonProps) {

  return (
    <button className="bg-green-500 text-white py-1 px-2 border border-green-500 rounded-sm">
      {label}
    </button>
  );
};
