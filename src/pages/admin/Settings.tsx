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
    admin_phone: "",
    admin_email: "",
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
          <CardDescription>WhatsApp number for customer checkout</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="admin_phone">WhatsApp Number (with country code)</Label>
            <Input
              id="admin_phone"
              defaultValue={settings?.admin_phone}
              placeholder="+919876543210"
              onBlur={(e) => handleSave("admin_phone", e.target.value)}
            />
            <p className="text-sm text-muted-foreground">
              Include country code (e.g., +91 for India)
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="admin_email">Contact Email</Label>
            <Input
              id="admin_email"
              type="email"
              defaultValue={settings?.admin_email}
              placeholder="admin@yourstore.com"
              onBlur={(e) => handleSave("admin_email", e.target.value)}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
