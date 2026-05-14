import React from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ProfessionalButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  onClick?: () => void;
  disabled?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  gradient?: boolean;
}

export function ProfessionalButton({
  children,
  variant = 'primary',
  size = 'md',
  className,
  onClick,
  disabled = false,
  icon,
  iconPosition = 'left',
  gradient = false
}: ProfessionalButtonProps) {
  const baseClasses = "relative group font-medium transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl";
  
  const variantClasses = {
    primary: gradient 
      ? "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
      : "bg-blue-600 hover:bg-blue-700 text-white",
    secondary: "bg-white text-gray-700 border-2 border-gray-200 hover:border-blue-300 hover:text-blue-700 shadow-sm hover:shadow-md",
    outline: "border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white",
    ghost: "text-gray-700 hover:bg-blue-50 hover:text-blue-700 shadow-sm hover:shadow-md"
  };

  const sizeClasses = {
    sm: "px-4 py-2 text-sm rounded-lg",
    md: "px-6 py-3 text-base rounded-xl",
    lg: "px-8 py-4 text-lg rounded-xl"
  };

  return (
    <Button
      className={cn(
        baseClasses,
        variantClasses[variant],
        sizeClasses[size],
        disabled && "opacity-50 cursor-not-allowed transform-none",
        className
      )}
      onClick={onClick}
      disabled={disabled}
    >
      <div className="flex items-center justify-center gap-2">
        {icon && iconPosition === 'left' && (
          <span className="transition-transform group-hover:scale-110">
            {icon}
          </span>
        )}
        <span>{children}</span>
        {icon && iconPosition === 'right' && (
          <span className="transition-transform group-hover:translate-x-1">
            {icon}
          </span>
        )}
      </div>
      
      {/* Gradient overlay for enhanced effect */}
      {variant === 'primary' && (
        <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-white/20 to-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      )}
    </Button>
  );
}

interface CTAButtonProps {
  primary: {
    text: string;
    onClick?: () => void;
    icon?: React.ReactNode;
  };
  secondary?: {
    text: string;
    onClick?: () => void;
    icon?: React.ReactNode;
  };
  className?: string;
}

export function CTAButtons({ primary, secondary, className }: CTAButtonProps) {
  return (
    <div className={cn("flex flex-col sm:flex-row gap-4 justify-center", className)}>
      <ProfessionalButton
        variant="primary"
        size="lg"
        gradient
        onClick={primary.onClick}
        icon={primary.icon}
        iconPosition="right"
      >
        {primary.text}
      </ProfessionalButton>
      
      {secondary && (
        <ProfessionalButton
          variant="secondary"
          size="lg"
          onClick={secondary.onClick}
          icon={secondary.icon}
          iconPosition="right"
        >
          {secondary.text}
        </ProfessionalButton>
      )}
    </div>
  );
}
