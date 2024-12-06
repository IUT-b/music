'use client';

interface Props {
  type: 'button' | 'submit' | 'reset';
  label: string;
}

export default function Button({ type, label }: Props) {

  return (
    <button type={type} className="bg-green-500 text-white py-1 px-2 border border-green-500 rounded-sm">
      {label}
    </button>
  );
};
