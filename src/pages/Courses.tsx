import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { CourseCard } from "@/components/CourseCard";
import { Skeleton } from "@/components/ui/skeleton";
import { GraduationCap } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";

const Courses = () => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const { data: courses, isLoading } = useQuery({
    queryKey: ["courses"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("courses")
        .select("*")
        .order("order_index");
      if (error) throw error;
      return data;
    },
  });

  const categories = courses
    ? [...new Set(courses.map((c) => c.category))]
    : [];

  const filteredCourses = selectedCategory
    ? courses?.filter((c) => c.category === selectedCategory)
    : courses;

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="border-b border-border bg-gradient-hero hero-pattern py-16">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-primary text-primary-foreground shadow-glow">
              <GraduationCap className="h-6 w-6" />
            </div>
            <h1 className="text-3xl font-bold text-foreground md:text-4xl">
              Online Courses
            </h1>
          </div>
          <p className="text-lg text-muted-foreground max-w-2xl mb-6">
            Learn robotics, IoT, electronics, and more with our hands-on courses designed for beginners and makers.
          </p>
          
          {/* Category Filter */}
          <div className="flex flex-wrap gap-2">
            <Badge
              variant={selectedCategory === null ? "default" : "outline"}
              className="cursor-pointer hover:bg-primary/90 transition-smooth"
              onClick={() => setSelectedCategory(null)}
            >
              All Courses
            </Badge>
            {categories.map((cat) => (
              <Badge
                key={cat}
                variant={selectedCategory === cat ? "default" : "outline"}
                className="cursor-pointer hover:bg-primary/90 transition-smooth"
                onClick={() => setSelectedCategory(cat)}
              >
                {cat}
              </Badge>
            ))}
          </div>
        </div>
      </section>

      {/* Courses Grid */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          {isLoading ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {[...Array(6)].map((_, i) => (
                <Skeleton key={i} className="h-96 rounded-lg" />
              ))}
            </div>
          ) : filteredCourses && filteredCourses.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filteredCourses.map((course) => (
                <CourseCard key={course.id} course={course} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <GraduationCap className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h2 className="text-xl font-semibold text-foreground mb-2">
                No courses available
              </h2>
              <p className="text-muted-foreground">
                Check back soon for new courses!
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Courses;
