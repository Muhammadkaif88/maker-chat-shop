import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ProductCard } from "@/components/ProductCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Package, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";

const Kits = () => {
  const [selectedDifficulty, setSelectedDifficulty] = useState<string | null>(null);

  const { data: products, isLoading } = useQuery({
    queryKey: ["kit-products"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .contains("tags", ["kit"])
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const difficulties = ["beginner", "intermediate", "advanced"];

  const filteredProducts = selectedDifficulty
    ? products?.filter((p) => p.difficulty === selectedDifficulty)
    : products;

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="border-b border-border bg-gradient-hero hero-pattern py-16">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-primary text-primary-foreground shadow-glow">
              <Package className="h-6 w-6" />
            </div>
            <h1 className="text-3xl font-bold text-foreground md:text-4xl">
              DIY Kits & Projects
            </h1>
          </div>
          <p className="text-lg text-muted-foreground max-w-2xl mb-6">
            Complete project kits with all components, instructions, and code. Perfect for students, makers, and hobbyists looking to build real-world projects.
          </p>
          
          {/* Difficulty Filter */}
          <div className="flex flex-wrap gap-2">
            <Badge
              variant={selectedDifficulty === null ? "default" : "outline"}
              className="cursor-pointer hover:bg-primary/90 transition-smooth capitalize"
              onClick={() => setSelectedDifficulty(null)}
            >
              <Sparkles className="h-3 w-3 mr-1" />
              All Kits
            </Badge>
            {difficulties.map((diff) => (
              <Badge
                key={diff}
                variant={selectedDifficulty === diff ? "default" : "outline"}
                className="cursor-pointer hover:bg-primary/90 transition-smooth capitalize"
                onClick={() => setSelectedDifficulty(diff)}
              >
                {diff}
              </Badge>
            ))}
          </div>
        </div>
      </section>

      {/* Kits Grid */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          {isLoading ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {[...Array(8)].map((_, i) => (
                <Skeleton key={i} className="h-96 rounded-lg" />
              ))}
            </div>
          ) : filteredProducts && filteredProducts.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <Package className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h2 className="text-xl font-semibold text-foreground mb-2">
                No kits found
              </h2>
              <p className="text-muted-foreground">
                {selectedDifficulty 
                  ? `No ${selectedDifficulty} kits available. Try a different difficulty level.`
                  : "Check back soon for new kits!"}
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Kits;
