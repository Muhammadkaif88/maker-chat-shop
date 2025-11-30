import { Link } from "react-router-dom";
import { Mail, Phone, MapPin, Globe } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const Footer = () => {
  const { data: settings } = useQuery({
    queryKey: ["footer-settings"],
    queryFn: async () => {
      const { data, error } = await supabase.from("settings").select("*");
      if (error) throw error;
      return data.reduce((acc, s) => ({ ...acc, [s.key]: s.value }), {} as Record<string, string>);
    },
  });

  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-border bg-muted/30 mt-auto">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-primary shadow-glow">
                <span className="text-xl font-bold text-white">⚡</span>
              </div>
              <span className="text-xl font-bold text-foreground">
                {settings?.store_name || "Edukkit"}
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              Electronics & Robotics for Students & Makers
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground">Quick Links</h3>
            <nav className="flex flex-col space-y-2">
              <Link to="/products" className="text-sm text-muted-foreground hover:text-foreground transition-smooth">
                Products
              </Link>
              <Link to="/kits" className="text-sm text-muted-foreground hover:text-foreground transition-smooth">
                Kits
              </Link>
              <Link to="/courses" className="text-sm text-muted-foreground hover:text-foreground transition-smooth">
                Courses
              </Link>
              <Link to="/categories" className="text-sm text-muted-foreground hover:text-foreground transition-smooth">
                Categories
              </Link>
            </nav>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground">Contact</h3>
            <div className="flex flex-col space-y-3">
              {settings?.store_email && (
                <a
                  href={`mailto:${settings.store_email}`}
                  className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-smooth"
                >
                  <Mail className="h-4 w-4" />
                  {settings.store_email}
                </a>
              )}
              {settings?.whatsapp_number && (
                <a
                  href={`https://wa.me/${settings.whatsapp_number}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-smooth"
                >
                  <Phone className="h-4 w-4" />
                  +{settings.whatsapp_number}
                </a>
              )}
              {settings?.company_website && (
                <a
                  href={`https://${settings.company_website}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-smooth"
                >
                  <Globe className="h-4 w-4" />
                  {settings.company_website}
                </a>
              )}
            </div>
          </div>

          {/* Address */}
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground">Location</h3>
            {settings?.company_address && (
              <div className="flex items-start gap-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4 mt-1 flex-shrink-0" />
                <span>{settings.company_address}</span>
              </div>
            )}
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-8 pt-8 border-t border-border">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-muted-foreground">
              © {currentYear} {settings?.store_name || "Edukkit"}. All rights reserved.
            </p>
            <div className="flex gap-6">
              <Link to="/privacy" className="text-sm text-muted-foreground hover:text-foreground transition-smooth">
                Privacy Policy
              </Link>
              <Link to="/terms" className="text-sm text-muted-foreground hover:text-foreground transition-smooth">
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
