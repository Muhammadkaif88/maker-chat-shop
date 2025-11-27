import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useCart } from "@/contexts/CartContext";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ShoppingCart, ArrowLeft, Package, Zap } from "lucide-react";
import { toast } from "sonner";

interface Product {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  mrp: number | null;
  sku: string;
  stock: number | null;
  images: string[] | null;
  bom: any;
  difficulty: string | null;
  tags: string[] | null;
  category_id: string | null;
}

export default function ProductDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { addItem } = useCart();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    fetchProduct();
  }, [slug]);

  const fetchProduct = async () => {
    try {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("slug", slug)
        .maybeSingle();

      if (error) throw error;
      if (data) {
        setProduct(data);
      }
    } catch (error) {
      console.error("Error fetching product:", error);
      toast.error("Failed to load product");
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = () => {
    if (!product) return;
    
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      quantity: quantity,
      image: product.images?.[0],
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading product...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Package className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Product Not Found</h2>
          <p className="text-muted-foreground mb-6">The product you're looking for doesn't exist.</p>
          <Button onClick={() => navigate("/products")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Products
          </Button>
        </div>
      </div>
    );
  }

  const images = product.images || ["/placeholder.svg"];
  const bomItems = Array.isArray(product.bom) ? product.bom : [];
  const inStock = (product.stock ?? 0) > 0;

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>

        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {/* Image Gallery */}
          <div className="space-y-4">
            <div className="aspect-square rounded-lg overflow-hidden bg-card border border-border">
              <img
                src={images[selectedImage]}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>
            {images.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(idx)}
                    className={`aspect-square rounded-md overflow-hidden border-2 transition-all ${
                      selectedImage === idx
                        ? "border-primary"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <img
                      src={img}
                      alt={`${product.name} ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <div className="flex items-start justify-between mb-2">
                <h1 className="text-3xl font-bold">{product.name}</h1>
                {product.difficulty && (
                  <Badge variant="secondary" className="ml-2">
                    {product.difficulty}
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground mb-4">SKU: {product.sku}</p>
              
              <div className="flex items-baseline gap-3 mb-4">
                <span className="text-4xl font-bold text-primary">
                  ₹{product.price.toLocaleString()}
                </span>
                {product.mrp && product.mrp > product.price && (
                  <>
                    <span className="text-xl text-muted-foreground line-through">
                      ₹{product.mrp.toLocaleString()}
                    </span>
                    <Badge variant="destructive">
                      {Math.round(((product.mrp - product.price) / product.mrp) * 100)}% OFF
                    </Badge>
                  </>
                )}
              </div>

              <div className="flex items-center gap-2 mb-6">
                {inStock ? (
                  <Badge variant="outline" className="border-green-500 text-green-500">
                    <Zap className="w-3 h-3 mr-1" />
                    In Stock ({product.stock} available)
                  </Badge>
                ) : (
                  <Badge variant="outline" className="border-destructive text-destructive">
                    Out of Stock
                  </Badge>
                )}
              </div>

              {product.tags && product.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-6">
                  {product.tags.map((tag) => (
                    <Badge key={tag} variant="secondary">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            <Card className="p-6 bg-card/50 backdrop-blur-sm border-primary/20">
              <div className="flex items-center gap-4 mb-4">
                <label className="font-medium">Quantity:</label>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={!inStock}
                  >
                    -
                  </Button>
                  <span className="w-12 text-center font-bold">{quantity}</span>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setQuantity(Math.min(product.stock || 1, quantity + 1))}
                    disabled={!inStock}
                  >
                    +
                  </Button>
                </div>
              </div>

              <Button
                onClick={handleAddToCart}
                disabled={!inStock}
                className="w-full"
                size="lg"
              >
                <ShoppingCart className="mr-2 h-5 w-5" />
                Add to Cart
              </Button>
            </Card>

            {product.description && (
              <div className="prose prose-sm max-w-none">
                <h3 className="text-lg font-semibold mb-2">Description</h3>
                <p className="text-muted-foreground">{product.description}</p>
              </div>
            )}
          </div>
        </div>

        {/* Additional Details */}
        <div className="space-y-6">
          <Accordion type="single" collapsible className="w-full">
            {bomItems.length > 0 && (
              <AccordionItem value="bom">
                <AccordionTrigger className="text-xl font-semibold">
                  Bill of Materials (BOM)
                </AccordionTrigger>
                <AccordionContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Component</TableHead>
                        <TableHead>Quantity</TableHead>
                        <TableHead>SKU</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {bomItems.map((item: any, idx: number) => (
                        <TableRow key={idx}>
                          <TableCell className="font-medium">
                            {item.partName || item.name}
                          </TableCell>
                          <TableCell>{item.qty || item.quantity || 1}</TableCell>
                          <TableCell className="text-muted-foreground">
                            {item.sku || "-"}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </AccordionContent>
              </AccordionItem>
            )}

            <AccordionItem value="specs">
              <AccordionTrigger className="text-xl font-semibold">
                Specifications
              </AccordionTrigger>
              <AccordionContent>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="font-medium">SKU:</span>
                    <span className="ml-2 text-muted-foreground">{product.sku}</span>
                  </div>
                  {product.difficulty && (
                    <div>
                      <span className="font-medium">Difficulty:</span>
                      <span className="ml-2 text-muted-foreground capitalize">
                        {product.difficulty}
                      </span>
                    </div>
                  )}
                  <div>
                    <span className="font-medium">Stock:</span>
                    <span className="ml-2 text-muted-foreground">
                      {product.stock ?? 0} units
                    </span>
                  </div>
                  <div>
                    <span className="font-medium">Price:</span>
                    <span className="ml-2 text-muted-foreground">
                      ₹{product.price.toLocaleString()}
                    </span>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </div>
    </div>
  );
}
