'use client';

interface ButtonProps {
  label: string;
}

export default function Button({ label }: ButtonProps) {

  return (
    <button className="bg-green-400 text-white py-1 px-2 border border-green-400">
      {label}
    </button>
  );
};
