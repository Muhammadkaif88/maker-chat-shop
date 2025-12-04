import { useQuery } from "@tanstack/react-query";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { ArrowLeft, Clock, BookOpen, MessageCircle, CheckCircle, GraduationCap } from "lucide-react";

interface SyllabusModule {
  title: string;
  topics: string[];
}

const CourseDetail = () => {
  const { slug } = useParams<{ slug: string }>();

  const { data: course, isLoading } = useQuery({
    queryKey: ["course", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("courses")
        .select("*")
        .eq("slug", slug)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!slug,
  });

  const handleEnroll = () => {
    if (!course) return;
    const message = encodeURIComponent(
      `Hi! I want to enroll in:\n\n*${course.name}*\nPrice: ₹${course.price}\nDuration: ${course.duration}\n\nPlease help me with the enrollment process.`
    );
    window.open(`https://wa.me/919876543210?text=${message}`, "_blank");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <Skeleton className="h-8 w-48 mb-4" />
          <Skeleton className="h-64 w-full mb-8" />
          <Skeleton className="h-96 w-full" />
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">Course Not Found</h1>
          <Button asChild>
            <Link to="/courses">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Courses
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  const discountPercent = course.mrp
    ? Math.round(((course.mrp - course.price) / course.mrp) * 100)
    : 0;

  const syllabus = (course.syllabus as unknown as SyllabusModule[]) || [];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="border-b border-border bg-gradient-hero hero-pattern py-12">
        <div className="container mx-auto px-4">
          <Button variant="ghost" size="sm" className="mb-4" asChild>
            <Link to="/courses">
              <ArrowLeft className="mr-2 h-4 w-4" />
              All Courses
            </Link>
          </Button>
          
          <div className="grid gap-8 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <div className="flex items-center gap-2 mb-3">
                <Badge variant="outline">{course.category}</Badge>
                {course.is_featured && (
                  <Badge className="bg-primary text-primary-foreground">Featured</Badge>
                )}
              </div>
              <h1 className="text-3xl font-bold text-foreground md:text-4xl mb-4">
                {course.name}
              </h1>
              <p className="text-lg text-muted-foreground mb-6">
                {course.description}
              </p>
              <div className="flex flex-wrap items-center gap-4 text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  <span>{course.duration}</span>
                </div>
                <div className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  <span>{syllabus.length} modules</span>
                </div>
              </div>
            </div>
            
            {/* Enrollment Card */}
            <div className="lg:col-span-1">
              <Card className="p-6 bg-card border-border shadow-card sticky top-4">
                {course.image_url ? (
                  <img
                    src={course.image_url}
                    alt={course.name}
                    className="w-full aspect-video object-cover rounded-lg mb-4"
                  />
                ) : (
                  <div className="w-full aspect-video bg-gradient-to-br from-primary/10 to-secondary/10 rounded-lg mb-4 flex items-center justify-center">
                    <GraduationCap className="h-12 w-12 text-primary/50" />
                  </div>
                )}
                <div className="flex items-baseline gap-2 mb-2">
                  <span className="text-3xl font-bold text-primary">₹{course.price}</span>
                  {course.mrp && course.mrp > course.price && (
                    <>
                      <span className="text-lg text-muted-foreground line-through">₹{course.mrp}</span>
                      <Badge className="bg-secondary text-secondary-foreground">
                        {discountPercent}% OFF
                      </Badge>
                    </>
                  )}
                </div>
                <Button
                  onClick={handleEnroll}
                  className="w-full bg-secondary text-secondary-foreground hover:bg-secondary/90 transition-smooth mb-4"
                  size="lg"
                >
                  <MessageCircle className="mr-2 h-5 w-5" />
                  Enroll via WhatsApp
                </Button>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-primary" />
                    Lifetime access
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-primary" />
                    Certificate of completion
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-primary" />
                    WhatsApp support
                  </li>
                </ul>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Syllabus Section */}
      {syllabus.length > 0 && (
        <section className="py-12">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl font-bold text-foreground mb-6">Course Syllabus</h2>
            <Accordion type="single" collapsible className="w-full max-w-3xl">
              {syllabus.map((module, index) => (
                <AccordionItem key={index} value={`module-${index}`}>
                  <AccordionTrigger className="text-left">
                    <div className="flex items-center gap-3">
                      <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary text-sm font-semibold">
                        {index + 1}
                      </span>
                      <span className="font-medium">{module.title}</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <ul className="space-y-2 pl-11">
                      {module.topics.map((topic, topicIndex) => (
                        <li key={topicIndex} className="flex items-start gap-2 text-muted-foreground">
                          <CheckCircle className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                          <span>{topic}</span>
                        </li>
                      ))}
                    </ul>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </section>
      )}
    </div>
  );
};

export default CourseDetail;
