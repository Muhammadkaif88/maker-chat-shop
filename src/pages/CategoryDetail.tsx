import { useQuery } from "@tanstack/react-query";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { ProductCard } from "@/components/ProductCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Package } from "lucide-react";

const CategoryDetail = () => {
  const { slug } = useParams<{ slug: string }>();

  const { data: category, isLoading: categoryLoading } = useQuery({
    queryKey: ["category", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .eq("slug", slug)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!slug,
  });

  const { data: products, isLoading: productsLoading } = useQuery({
    queryKey: ["category-products", category?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("category_id", category!.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!category?.id,
  });

  const isLoading = categoryLoading || productsLoading;

  if (categoryLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <Skeleton className="h-8 w-48 mb-4" />
          <Skeleton className="h-24 w-full mb-8" />
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {[...Array(8)].map((_, i) => (
              <Skeleton key={i} className="h-96 rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!category) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">Category Not Found</h1>
          <Button asChild>
            <Link to="/categories">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Categories
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <section className="border-b border-border bg-gradient-hero hero-pattern py-12">
        <div className="container mx-auto px-4">
          <Button variant="ghost" size="sm" className="mb-4" asChild>
            <Link to="/categories">
              <ArrowLeft className="mr-2 h-4 w-4" />
              All Categories
            </Link>
          </Button>
          <div className="flex items-center gap-4 mb-4">
            <div className="inline-flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-primary text-primary-foreground text-2xl shadow-glow">
              <Package className="h-7 w-7" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground md:text-4xl">
                {category.name}
              </h1>
              <p className="text-muted-foreground">
                {products?.length || 0} products available
              </p>
            </div>
          </div>
          {category.description && (
            <p className="text-lg text-muted-foreground max-w-3xl">
              {category.description}
            </p>
          )}
        </div>
      </section>

      {/* Products Grid */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          {productsLoading ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {[...Array(8)].map((_, i) => (
                <Skeleton key={i} className="h-96 rounded-lg" />
              ))}
            </div>
          ) : products && products.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <Package className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h2 className="text-xl font-semibold text-foreground mb-2">
                No products yet
              </h2>
              <p className="text-muted-foreground mb-4">
                Products in this category will appear here soon.
              </p>
              <Button asChild>
                <Link to="/products">Browse All Products</Link>
              </Button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default CategoryDetail;
