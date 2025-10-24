import Link from 'next/link';
import Image from 'next/image';

interface LogoProps {
  className?: string;
  showText?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
}

export function Logo({ className = '', showText = true, size = 'lg' }: LogoProps) {
  const sizeClasses = {
    sm: 'w-12 h-12',
    md: 'w-16 h-16',
    lg: 'w-20 h-20',
    xl: 'w-24 h-24',
    '2xl': 'w-32 h-32'
  };

  const textSizes = {
    sm: 'text-xl',
    md: 'text-2xl',
    lg: 'text-3xl',
    xl: 'text-4xl',
    '2xl': 'text-5xl'
  };

  return (
    <Link href="/" className={`flex items-center ${className}`} prefetch={false}>
      {/* Logo Icon */}
      <div className={`${sizeClasses[size]} mr-3 flex items-center justify-center`}>
        <Image
          src="/images/Logo.png"
          alt="Electrify Logo"
          width={size === 'sm' ? 48 : size === 'md' ? 64 : size === 'lg' ? 80 : size === 'xl' ? 96 : 128}
          height={size === 'sm' ? 48 : size === 'md' ? 64 : size === 'lg' ? 80 : size === 'xl' ? 96 : 128}
          className="object-contain"
          style={{ width: 'auto', height: 'auto' }}
          priority
        />
      </div>
      
      {/* Logo Text */}
      {/* Removed the logo text as per user request */}
    </Link>
  );
} 