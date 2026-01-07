'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { ROUTES } from '@/lib/constants';
import { getCart } from '@/lib/cart-service';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ShoppingCart } from 'lucide-react';

/**
 * Header Component
 *
 * Navigation header with auth-aware links.
 * Shows phone number for authenticated users (primary identifier).
 * Catalog is always visible (public). Cart/Orders require auth.
 */
export function Header() {
  const { isAuthenticated, user, logout, isLoading } = useAuth();
  const [cartItemCount, setCartItemCount] = useState(0);

  // Fetch cart count when authenticated
  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      getCart()
        .then((cart) => {
          setCartItemCount(cart?.itemCount || 0);
        })
        .catch(() => {
          setCartItemCount(0);
        });
    } else {
      setCartItemCount(0);
    }
  }, [isAuthenticated, isLoading]);

  // Listen for cart updates (custom event)
  useEffect(() => {
    const handleCartUpdate = (event: CustomEvent<{ itemCount: number }>) => {
      setCartItemCount(event.detail.itemCount);
    };

    window.addEventListener('cart-updated' as never, handleCartUpdate);
    return () => window.removeEventListener('cart-updated' as never, handleCartUpdate);
  }, []);

  /**
   * Format phone number for display
   * Shows last 4 digits with mask for privacy
   */
  const formatPhoneDisplay = (phone: string | undefined | null): string => {
    if (!phone) return '...';
    if (phone.length <= 4) return phone;
    return `***${phone.slice(-4)}`;
  };

  return (
    <header className="sticky top-0 z-50 border-b bg-background">
      <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
        <Link href={ROUTES.HOME} className="font-bold text-xl text-primary no-underline">
          Janta Pharmacy
        </Link>

        <nav className="flex items-center gap-6">
          <Link href={ROUTES.HOME} className="text-muted-foreground hover:text-foreground text-sm font-medium no-underline transition-colors">
            Home
          </Link>
          <Link href={ROUTES.CATALOG} className="text-muted-foreground hover:text-foreground text-sm font-medium no-underline transition-colors">
            Catalog
          </Link>
          {isAuthenticated && (
            <>
              <Link href={ROUTES.CART} className="relative text-muted-foreground hover:text-foreground no-underline transition-colors">
                <ShoppingCart className="h-5 w-5" />
                {cartItemCount > 0 && (
                  <Badge className="absolute -top-2 -right-2.5 h-5 min-w-5 flex items-center justify-center p-0 text-[10px]">
                    {cartItemCount}
                  </Badge>
                )}
              </Link>
              <Link href={ROUTES.ORDERS} className="text-muted-foreground hover:text-foreground text-sm font-medium no-underline transition-colors">
                Orders
              </Link>
            </>
          )}
        </nav>

        <div className="flex items-center gap-4">
          {isLoading ? (
            <span className="text-muted-foreground text-sm">Loading...</span>
          ) : isAuthenticated && user ? (
            <>
              <span className="text-sm font-medium" title={user.phoneNumber}>
                {formatPhoneDisplay(user.phoneNumber)}
              </span>
              <Button variant="outline" size="sm" onClick={logout}>
                Logout
              </Button>
            </>
          ) : (
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="sm" asChild>
                <Link href={ROUTES.LOGIN}>Login</Link>
              </Button>
              <Button size="sm" asChild>
                <Link href={ROUTES.REGISTER}>Register</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
