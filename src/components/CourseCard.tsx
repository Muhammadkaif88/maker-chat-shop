import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Clock, BookOpen, MessageCircle } from "lucide-react";

interface Course {
  id: string;
  name: string;
  slug: string;
  description?: string;
  price: number;
  mrp?: number;
  duration: string;
  category: string;
  image_url?: string;
  is_featured?: boolean;
}

interface CourseCardProps {
  course: Course;
}

export const CourseCard = ({ course }: CourseCardProps) => {
  const discountPercent = course.mrp
    ? Math.round(((course.mrp - course.price) / course.mrp) * 100)
    : 0;

  const handleEnroll = (e: React.MouseEvent) => {
    e.preventDefault();
    const message = encodeURIComponent(
      `Hi! I'm interested in enrolling for the course:\n\n*${course.name}*\nPrice: ₹${course.price}\nDuration: ${course.duration}\n\nPlease share more details.`
    );
    window.open(`https://wa.me/919876543210?text=${message}`, "_blank");
  };

  return (
    <Link to={`/courses/${course.slug}`}>
      <Card className="group overflow-hidden border-border bg-card transition-smooth hover:shadow-hover h-full flex flex-col">
        <div className="relative aspect-video overflow-hidden bg-muted">
          {course.image_url ? (
            <img
              src={course.image_url}
              alt={course.name}
              className="h-full w-full object-cover transition-smooth group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/10 to-secondary/10">
              <BookOpen className="h-12 w-12 text-primary/50" />
            </div>
          )}
          {discountPercent > 0 && (
            <Badge className="absolute right-2 top-2 bg-secondary text-secondary-foreground">
              {discountPercent}% OFF
            </Badge>
          )}
          {course.is_featured && (
            <Badge className="absolute left-2 top-2 bg-primary text-primary-foreground">
              Featured
            </Badge>
          )}
        </div>
        <div className="p-4 flex-1 flex flex-col">
          <Badge variant="outline" className="w-fit mb-2 text-xs">
            {course.category}
          </Badge>
          <h3 className="mb-2 font-semibold text-foreground group-hover:text-primary transition-smooth line-clamp-2">
            {course.name}
          </h3>
          {course.description && (
            <p className="text-sm text-muted-foreground mb-3 line-clamp-2 flex-1">
              {course.description}
            </p>
          )}
          <div className="flex items-center gap-3 mb-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>{course.duration}</span>
            </div>
          </div>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-bold text-primary">₹{course.price}</span>
              {course.mrp && course.mrp > course.price && (
                <span className="text-sm text-muted-foreground line-through">₹{course.mrp}</span>
              )}
            </div>
          </div>
          <Button
            onClick={handleEnroll}
            className="w-full bg-secondary text-secondary-foreground hover:bg-secondary/90 transition-smooth"
            size="sm"
          >
            <MessageCircle className="mr-2 h-4 w-4" />
            Enroll via WhatsApp
          </Button>
        </div>
      </Card>
    </Link>
  );
};
