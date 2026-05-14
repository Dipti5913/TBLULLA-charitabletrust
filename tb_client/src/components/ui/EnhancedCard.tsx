import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface EnhancedCardProps {
  children?: React.ReactNode;
  title?: string;
  subtitle?: string;
  badge?: string;
  variant?: 'default' | 'firebase' | 'featured';
  className?: string;
  showNumber?: boolean;
  number?: number;
  onClick?: () => void;
}

export function EnhancedCard({
  children,
  title,
  subtitle,
  badge,
  variant = 'default',
  className,
  showNumber = false,
  number,
  onClick
}: EnhancedCardProps) {
  const isFirebase = variant === 'firebase';
  const isFeatured = variant === 'featured';
  
  return (
    <Card
      className={cn(
        "group relative overflow-hidden bg-white border-0 shadow-xl hover:shadow-2xl transition-all duration-700 rounded-2xl transform hover:-translate-y-2",
        isFirebase && "ring-2 ring-emerald-200",
        isFeatured && "ring-2 ring-blue-200",
        onClick && "cursor-pointer",
        className
      )}
      onClick={onClick}
    >
      {/* Card Border Glow */}
      <div className={cn(
        "absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700",
        isFirebase 
          ? "bg-gradient-to-r from-emerald-500/10 via-transparent to-emerald-500/10"
          : "bg-gradient-to-r from-blue-500/10 via-transparent to-indigo-500/10"
      )}></div>
      
      {/* Top accent border */}
      <div className={cn(
        "absolute top-0 left-0 right-0 h-1",
        isFirebase 
          ? "bg-gradient-to-r from-emerald-500 to-emerald-600"
          : "bg-gradient-to-r from-blue-500 to-indigo-600"
      )} />

      {/* Card number badge */}
      {showNumber && number && (
        <div className={cn(
          "absolute top-4 right-4 w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white shadow-lg",
          isFirebase 
            ? "bg-gradient-to-br from-emerald-500 to-emerald-600"
            : "bg-gradient-to-br from-blue-500 to-blue-600"
        )}>
          {String(number).padStart(2, '0')}
        </div>
      )}

      {title && (
        <CardHeader className="pb-4 pt-6">
          <div className="flex items-start justify-between mb-3">
            {subtitle && (
              <div className={cn(
                "inline-flex items-center px-3 py-1 rounded-full text-xs font-medium",
                isFirebase 
                  ? "bg-emerald-100 text-emerald-700"
                  : "bg-blue-100 text-blue-700"
              )}>
                {subtitle}
              </div>
            )}
            {badge && (
              <span className={cn(
                "inline-flex items-center px-2 py-1 text-xs font-medium rounded-full",
                isFirebase 
                  ? "bg-emerald-500 text-white"
                  : "bg-blue-500 text-white"
              )}>
                {badge}
              </span>
            )}
          </div>
          <CardTitle className="text-xl font-bold text-gray-900 leading-tight">
            {title}
          </CardTitle>
        </CardHeader>
      )}

      {children && (
        <CardContent className="pb-6">
          {children}
        </CardContent>
      )}
    </Card>
  );
}

interface LoadingStateProps {
  message?: string;
  className?: string;
}

export function LoadingState({ message = "Loading...", className }: LoadingStateProps) {
  return (
    <div className={cn("flex justify-center items-center py-12", className)}>
      <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
      <span className="ml-4 text-lg text-gray-600">{message}</span>
    </div>
  );
}

interface ErrorStateProps {
  title?: string;
  message: string;
  className?: string;
}

export function ErrorState({ 
  title = "Connection Issue", 
  message, 
  className 
}: ErrorStateProps) {
  return (
    <div className={cn("text-center py-8 mb-12", className)}>
      <div className="inline-flex items-center justify-center w-16 h-16 bg-yellow-100 rounded-full mb-4">
        <span className="text-2xl">⚠️</span>
      </div>
      <h3 className="text-lg font-semibold text-yellow-800 mb-2">{title}</h3>
      <p className="text-yellow-600">{message}</p>
    </div>
  );
}

interface EmptyStateProps {
  icon?: string;
  title: string;
  message: string;
  className?: string;
}

export function EmptyState({ 
  icon = "📋", 
  title, 
  message, 
  className 
}: EmptyStateProps) {
  return (
    <div className={cn("text-center py-12 mt-16", className)}>
      <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
        <span className="text-2xl">{icon}</span>
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600">{message}</p>
    </div>
  );
}
