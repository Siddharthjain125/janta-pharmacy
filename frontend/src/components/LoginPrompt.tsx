'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { ROUTES } from '@/lib/constants';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { X } from 'lucide-react';

const PROMPT_DISMISSED_KEY = 'janta_login_prompt_dismissed';

interface LoginPromptProps {
  /** If provided, component operates in controlled mode */
  onClose?: () => void;
}

/**
 * Non-blocking Login Prompt
 *
 * Two modes:
 * 1. Uncontrolled (no props): Shows automatically after delay for guests
 * 2. Controlled (with onClose): Shows when mounted, calls onClose when dismissed
 */
export function LoginPrompt({ onClose }: LoginPromptProps) {
  const { isAuthenticated, isLoading } = useAuth();
  const [isVisible, setIsVisible] = useState(!!onClose); // Controlled mode starts visible
  const [isDismissed, setIsDismissed] = useState(false);

  // Uncontrolled mode: auto-show after delay
  useEffect(() => {
    // Skip if controlled mode
    if (onClose) return;
    
    // Don't show if authenticated or still loading
    if (isAuthenticated || isLoading) {
      setIsVisible(false);
      return;
    }

    // Check if already dismissed this session
    if (typeof window !== 'undefined') {
      const dismissed = sessionStorage.getItem(PROMPT_DISMISSED_KEY);
      if (dismissed === 'true') {
        setIsDismissed(true);
        return;
      }
    }

    // Show after a delay to not interrupt initial page view
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 3000);

    return () => clearTimeout(timer);
  }, [isAuthenticated, isLoading, onClose]);

  const handleDismiss = () => {
    setIsVisible(false);
    setIsDismissed(true);
    
    // Only persist in uncontrolled mode
    if (!onClose && typeof window !== 'undefined') {
      sessionStorage.setItem(PROMPT_DISMISSED_KEY, 'true');
    }
    
    // Notify parent in controlled mode
    onClose?.();
  };

  // Hide conditions
  if (isAuthenticated) return null;
  if (!onClose && (isDismissed || !isVisible)) return null;
  if (onClose && !isVisible) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-4 duration-300">
      <Card className="w-[340px] relative shadow-lg">
        <button
          onClick={handleDismiss}
          className="absolute top-3 right-3 text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Dismiss"
        >
          <X className="h-4 w-4" />
        </button>
        
        <CardHeader className="text-center pb-2">
          <CardTitle className="text-lg">
            {onClose ? 'Login Required' : 'Welcome to Janta Pharmacy! 👋'}
          </CardTitle>
          <CardDescription>
            {onClose 
              ? 'Please sign in to add items to your cart and place orders.'
              : 'Sign in to add items to your cart, place orders, and enjoy a personalized experience.'}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="flex flex-col items-center gap-4">
          <div className="flex gap-3">
            <Button asChild>
              <Link href={ROUTES.LOGIN}>Sign In</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href={ROUTES.REGISTER}>Create Account</Link>
            </Button>
          </div>
          
          <Button variant="link" onClick={handleDismiss} className="text-muted-foreground">
            {onClose ? 'Cancel' : 'Continue browsing'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
