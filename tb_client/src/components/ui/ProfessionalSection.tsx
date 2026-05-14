import React from 'react';
import { cn } from '@/lib/utils';

interface ProfessionalSectionProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'gradient' | 'minimal';
}

export function ProfessionalSection({ 
  children, 
  className, 
  variant = 'default' 
}: ProfessionalSectionProps) {
  return (
    <section className={cn(
      "relative py-20 lg:py-32 overflow-hidden",
      variant === 'default' && "bg-white",
      variant === 'gradient' && "bg-gradient-to-br from-gray-50 via-white to-blue-50/30",
      variant === 'minimal' && "bg-gray-50",
      className
    )}>
      {/* Background Pattern */}
      {variant !== 'minimal' && (
        <>
          <div className="absolute inset-0 bg-gradient-to-br from-gray-50 via-white to-blue-50/30"></div>
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-100/20 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-100/20 rounded-full blur-3xl transform -translate-x-1/2 translate-y-1/2"></div>
        </>
      )}
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {children}
      </div>
    </section>
  );
}

interface SectionHeaderProps {
  badge?: string;
  title: string;
  subtitle?: string;
  description?: string;
  className?: string;
}

export function SectionHeader({ 
  badge, 
  title, 
  subtitle, 
  description, 
  className 
}: SectionHeaderProps) {
  return (
    <div className={cn("text-center mb-20", className)}>
      {badge && (
        <div className="inline-flex items-center px-4 py-2 bg-blue-50 text-blue-700 text-sm font-medium rounded-full mb-6">
          <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
          {badge}
        </div>
      )}
      <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
        {title}
        {subtitle && (
          <span className="block text-blue-600">{subtitle}</span>
        )}
      </h1>
      {description && (
        <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
          {description}
        </p>
      )}
      <div className="flex justify-center mt-8">
        <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full"></div>
      </div>
    </div>
  );
}
