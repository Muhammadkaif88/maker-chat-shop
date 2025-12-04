import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";
import { Grid3X3, ArrowRight } from "lucide-react";

const categoryIcons: Record<string, string> = {
  "sensors-modules": "📡",
  "development-boards": "🔲",
  "robotics-kits": "🤖",
  "iot-kits": "🌐",
  "automation-kits": "⚙️",
  "tools-accessories": "🛠️",
  "power-battery": "🔋",
  "electronic-components": "💡",
};

const Categories = () => {
  const { data: categories, isLoading } = useQuery({
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

  const { data: productCounts } = useQuery({
    queryKey: ["category-product-counts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("category_id");
      if (error) throw error;
      const counts: Record<string, number> = {};
      data.forEach((p) => {
        if (p.category_id) {
          counts[p.category_id] = (counts[p.category_id] || 0) + 1;
        }
      });
      return counts;
    },
  });

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="border-b border-border bg-gradient-hero hero-pattern py-16">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-primary text-primary-foreground shadow-glow">
              <Grid3X3 className="h-6 w-6" />
            </div>
            <h1 className="text-3xl font-bold text-foreground md:text-4xl">
              All Categories
            </h1>
          </div>
          <p className="text-lg text-muted-foreground max-w-2xl">
            Explore our complete range of electronics, robotics kits, IoT modules, and maker tools.
          </p>
        </div>
      </section>

      {/* Categories Grid */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          {isLoading ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {[...Array(8)].map((_, i) => (
                <Skeleton key={i} className="h-48 rounded-lg" />
              ))}
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {categories?.map((category) => (
                <Link
                  key={category.id}
                  to={`/categories/${category.slug}`}
                  className="group relative overflow-hidden rounded-xl border border-border bg-card p-6 shadow-card transition-smooth hover:shadow-hover hover:border-primary/30"
                >
                  <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-primary text-3xl shadow-glow">
                    {categoryIcons[category.slug] || "🔌"}
                  </div>
                  <h3 className="mb-2 text-xl font-semibold text-foreground group-hover:text-primary transition-smooth">
                    {category.name}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                    {category.description || "Explore products in this category"}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-primary">
                      {productCounts?.[category.id] || 0} products
                    </span>
                    <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-smooth" />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Categories;
