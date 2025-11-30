import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "sonner";

export default function AdminSettings() {
  const { data: settings, refetch } = useQuery({
    queryKey: ["admin-settings"],
    queryFn: async () => {
      const { data, error } = await supabase.from("settings").select("*");
      if (error) throw error;
      return data.reduce((acc, s) => ({ ...acc, [s.key]: s.value }), {} as Record<string, string>);
    },
  });

  const [formData, setFormData] = useState({
    store_name: "",
    whatsapp_number: "",
    store_email: "",
    company_website: "",
    company_address: "",
  });

  const handleSave = async (key: string, value: string) => {
    try {
      const { error } = await supabase
        .from("settings")
        .upsert({ key, value }, { onConflict: "key" });

      if (error) throw error;
      toast.success("Settings updated");
      refetch();
    } catch (error) {
      console.error("Error updating settings:", error);
      toast.error("Failed to update settings");
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-2xl">
      <div>
        <h2 className="text-3xl font-bold text-foreground mb-2">Settings</h2>
        <p className="text-muted-foreground">Configure your store settings</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Store Information</CardTitle>
          <CardDescription>Basic information about your store</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="store_name">Store Name</Label>
            <Input
              id="store_name"
              defaultValue={settings?.store_name}
              placeholder="Your Store Name"
              onBlur={(e) => handleSave("store_name", e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Contact Information</CardTitle>
          <CardDescription>WhatsApp number and email for customer communication</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="whatsapp_number">WhatsApp Number (with country code)</Label>
            <Input
              id="whatsapp_number"
              defaultValue={settings?.whatsapp_number}
              placeholder="918075100930"
              onBlur={(e) => handleSave("whatsapp_number", e.target.value)}
            />
            <p className="text-sm text-muted-foreground">
              Include country code without + or spaces (e.g., 918075100930)
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="store_email">Contact Email</Label>
            <Input
              id="store_email"
              type="email"
              defaultValue={settings?.store_email}
              placeholder="contact@yourstore.com"
              onBlur={(e) => handleSave("store_email", e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Company Details</CardTitle>
          <CardDescription>Website and physical address</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="company_website">Website</Label>
            <Input
              id="company_website"
              defaultValue={settings?.company_website}
              placeholder="yourwebsite.com"
              onBlur={(e) => handleSave("company_website", e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="company_address">Address</Label>
            <Input
              id="company_address"
              defaultValue={settings?.company_address}
              placeholder="Company address"
              onBlur={(e) => handleSave("company_address", e.target.value)}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
