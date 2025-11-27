import { Link } from "react-router-dom";
import { ShoppingCart, Search, Menu, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCart } from "@/contexts/CartContext";
import { CartSheet } from "@/components/CartSheet";
import { useState } from "react";

export const Header = () => {
  const { itemCount } = useCart();
  const [cartOpen, setCartOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-primary shadow-glow transition-smooth group-hover:scale-105">
              <span className="text-xl font-bold text-white">⚡</span>
            </div>
            <span className="hidden text-xl font-bold text-foreground sm:block">
              TechMakers
            </span>
          </Link>

          <nav className="hidden items-center gap-6 md:flex">
            <Link
              to="/products"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-smooth"
            >
              Products
            </Link>
            <Link
              to="/categories"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-smooth"
            >
              Categories
            </Link>
            <Link
              to="/kits"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-smooth"
            >
              Kits
            </Link>
            <Link
              to="/courses"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-smooth"
            >
              Courses
            </Link>
          </nav>

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="hidden sm:flex">
              <Search className="h-5 w-5" />
            </Button>
            <Link to="/auth">
              <Button variant="ghost" size="icon">
                <User className="h-5 w-5" />
              </Button>
            </Link>
            <Button
              variant="ghost"
              size="icon"
              className="relative"
              onClick={() => setCartOpen(true)}
            >
              <ShoppingCart className="h-5 w-5" />
              {itemCount > 0 && (
                <Badge className="absolute -right-1 -top-1 h-5 w-5 rounded-full bg-secondary p-0 text-xs">
                  {itemCount}
                </Badge>
              )}
            </Button>
            <Button variant="ghost" size="icon" className="md:hidden">
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
      <CartSheet open={cartOpen} onOpenChange={setCartOpen} />
    </header>
  );
};
