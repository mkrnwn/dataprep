import { Layers } from 'lucide-react';

interface LogoProps {
  className?: string;
  iconClassName?: string;
  textClassName?: string;
}

export default function Logo({ className = '', iconClassName = '', textClassName = '' }: LogoProps) {
  return (
    <div className={`flex items-center space-x-2.5 ${className}`}>
      {/* Icon Wrapper */}
      <div className={`bg-gradient-to-br from-blue-600 to-violet-600 text-white p-1.5 rounded-lg shadow-sm ${iconClassName}`}>
        <Layers className="w-5 h-5 shrink-0" />
      </div>
      
      {/* Gradient Text */}
      <span className={`text-lg font-extrabold tracking-tight bg-gradient-to-r from-blue-600 to-violet-600 text-transparent bg-clip-text ${textClassName}`}>
        DataPrep
      </span>
    </div>
  );
}
