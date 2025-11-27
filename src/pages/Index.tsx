import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ProductCard } from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight, Sparkles, ShoppingBag, GraduationCap } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

const Index = () => {
  const { data: featuredProducts, isLoading: productsLoading } = useQuery({
    queryKey: ["featured-products"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("is_featured", true)
        .limit(6);
      if (error) throw error;
      return data;
    },
  });

  const { data: categories, isLoading: categoriesLoading } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .order("order_index");
      if (error) throw error;
      return data;
    },
  });

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden border-b border-border bg-gradient-hero hero-pattern">
        <div className="container mx-auto px-4 py-20 md:py-32">
          <div className="mx-auto max-w-4xl text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-2 text-sm text-primary">
              <Sparkles className="h-4 w-4" />
              <span className="font-medium">For Students, Makers & Hobbyists</span>
            </div>
            <h1 className="mb-6 text-4xl font-bold tracking-tight text-foreground md:text-6xl">
              Build Amazing Projects with
              <span className="bg-gradient-primary bg-clip-text text-transparent"> Electronics & Robotics</span>
            </h1>
            <p className="mb-8 text-lg text-muted-foreground md:text-xl">
              From Arduino to ESP32, sensors to robot kits — everything you need to bring your ideas to life.
              Fast delivery across India. Order via WhatsApp.
            </p>
            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Button
                size="lg"
                className="bg-secondary text-secondary-foreground hover:bg-secondary/90 shadow-hover"
                asChild
              >
                <Link to="/products">
                  Shop Now <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link to="/categories">Browse Categories</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Grid */}
      <section className="border-b border-border bg-background py-16">
        <div className="container mx-auto px-4">
          <div className="mb-12 text-center">
            <h2 className="mb-3 text-3xl font-bold text-foreground">Shop by Category</h2>
            <p className="text-muted-foreground">Explore our curated collection of electronics and robotics</p>
          </div>
          {categoriesLoading ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {[...Array(6)].map((_, i) => (
                <Skeleton key={i} className="h-32 rounded-lg" />
              ))}
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {categories?.map((category) => (
                <Link
                  key={category.id}
                  to={`/categories/${category.slug}`}
                  className="group relative overflow-hidden rounded-lg border border-border bg-card p-6 shadow-card transition-smooth hover:shadow-hover"
                >
                  <div className="mb-3 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-primary text-2xl shadow-glow">
                    🔌
                  </div>
                  <h3 className="mb-2 text-xl font-semibold text-foreground group-hover:text-primary transition-smooth">
                    {category.name}
                  </h3>
                  <p className="text-sm text-muted-foreground">{category.description}</p>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Featured Products */}
      <section className="bg-background py-16">
        <div className="container mx-auto px-4">
          <div className="mb-12 flex items-center justify-between">
            <div>
              <h2 className="mb-3 text-3xl font-bold text-foreground">Featured Products</h2>
              <p className="text-muted-foreground">Handpicked essentials for your next project</p>
            </div>
            <Button variant="outline" asChild>
              <Link to="/products">View All</Link>
            </Button>
          </div>
          {productsLoading ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {[...Array(6)].map((_, i) => (
                <Skeleton key={i} className="h-96 rounded-lg" />
              ))}
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {featuredProducts?.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section className="border-t border-border bg-muted py-16">
        <div className="container mx-auto px-4">
          <div className="grid gap-8 md:grid-cols-3">
            <div className="text-center">
              <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
                <ShoppingBag className="h-8 w-8" />
              </div>
              <h3 className="mb-2 text-lg font-semibold text-foreground">Easy WhatsApp Checkout</h3>
              <p className="text-sm text-muted-foreground">
                No complicated forms. Just add to cart and checkout via WhatsApp. We'll handle the rest!
              </p>
            </div>
            <div className="text-center">
              <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-secondary/10 text-secondary">
                <Sparkles className="h-8 w-8" />
              </div>
              <h3 className="mb-2 text-lg font-semibold text-foreground">Maker-Friendly Pricing</h3>
              <p className="text-sm text-muted-foreground">
                Student discounts, bulk deals, and transparent pricing. Build more for less.
              </p>
            </div>
            <div className="text-center">
              <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
                <GraduationCap className="h-8 w-8" />
              </div>
              <h3 className="mb-2 text-lg font-semibold text-foreground">Learn as You Build</h3>
              <p className="text-sm text-muted-foreground">
                Free tutorials, BOMs, and community support for every product. We help you succeed.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;
