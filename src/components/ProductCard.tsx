import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ShoppingCart } from "lucide-react";
import { useCart } from "@/contexts/CartContext";

interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  mrp?: number;
  images?: string[];
  difficulty?: string;
  tags?: string[];
  stock: number;
}

interface ProductCardProps {
  product: Product;
}

export const ProductCard = ({ product }: ProductCardProps) => {
  const { addItem } = useCart();
  
  const discountPercent = product.mrp
    ? Math.round(((product.mrp - product.price) / product.mrp) * 100)
    : 0;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      quantity: 1,
    });
  };

  return (
    <Link to={`/products/${product.slug}`}>
      <Card className="group overflow-hidden border-border bg-card transition-smooth hover:shadow-hover">
        <div className="relative aspect-square overflow-hidden bg-muted">
          {product.images && product.images.length > 0 ? (
            <img
              src={product.images[0]}
              alt={product.name}
              className="h-full w-full object-cover transition-smooth group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/5 to-primary/10">
              <span className="text-4xl">🔧</span>
            </div>
          )}
          {discountPercent > 0 && (
            <Badge className="absolute right-2 top-2 bg-secondary text-secondary-foreground">
              {discountPercent}% OFF
            </Badge>
          )}
          {product.stock === 0 && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/80">
              <Badge variant="destructive">Out of Stock</Badge>
            </div>
          )}
        </div>
        <div className="p-4">
          <div className="mb-2 flex items-start justify-between gap-2">
            <h3 className="line-clamp-2 font-semibold text-foreground group-hover:text-primary transition-smooth">
              {product.name}
            </h3>
          </div>
          <div className="mb-3 flex items-baseline gap-2">
            <span className="text-xl font-bold text-primary">₹{product.price}</span>
            {product.mrp && product.mrp > product.price && (
              <span className="text-sm text-muted-foreground line-through">₹{product.mrp}</span>
            )}
          </div>
          <div className="mb-3 flex flex-wrap gap-1">
            {product.difficulty && (
              <Badge variant="outline" className="text-xs">
                {product.difficulty}
              </Badge>
            )}
            {product.tags?.slice(0, 2).map((tag) => (
              <Badge key={tag} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
          <Button
            onClick={handleAddToCart}
            disabled={product.stock === 0}
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90 transition-smooth"
            size="sm"
          >
            <ShoppingCart className="mr-2 h-4 w-4" />
            Add to Cart
          </Button>
        </div>
      </Card>
    </Link>
  );
};
