import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { MapPin, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

interface Address {
  id: string;
  label: string;
  address: string;
  phone: string;
  pincode: string;
  is_default: boolean;
}

interface SavedAddressesProps {
  onSelectAddress: (address: Address | null) => void;
  selectedAddressId: string | null;
}

export function SavedAddresses({ onSelectAddress, selectedAddressId }: SavedAddressesProps) {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUserId(user?.id || null);
      if (user) {
        fetchAddresses();
      } else {
        setLoading(false);
      }
    };
    checkUser();
  }, []);

  const fetchAddresses = async () => {
    try {
      const { data, error } = await supabase
        .from("user_addresses")
        .select("*")
        .order("is_default", { ascending: false });

      if (error) throw error;
      setAddresses(data || []);
    } catch (error) {
      console.error("Error fetching addresses:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this address?")) return;
    
    try {
      const { error } = await supabase
        .from("user_addresses")
        .delete()
        .eq("id", id);

      if (error) throw error;
      setAddresses(addresses.filter(a => a.id !== id));
      if (selectedAddressId === id) {
        onSelectAddress(null);
      }
      toast.success("Address deleted");
    } catch (error) {
      toast.error("Failed to delete address");
    }
  };

  if (!userId) {
    return null;
  }

  if (loading) {
    return <div className="text-sm text-muted-foreground">Loading saved addresses...</div>;
  }

  if (addresses.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3">
      <Label className="text-base font-medium flex items-center gap-2">
        <MapPin className="h-4 w-4" />
        Saved Addresses
      </Label>
      <RadioGroup
        value={selectedAddressId || ""}
        onValueChange={(id) => {
          const address = addresses.find(a => a.id === id);
          onSelectAddress(address || null);
        }}
      >
        {addresses.map((address) => (
          <Card key={address.id} className="p-3">
            <div className="flex items-start gap-3">
              <RadioGroupItem value={address.id} id={address.id} className="mt-1" />
              <div className="flex-1">
                <Label htmlFor={address.id} className="cursor-pointer">
                  <div className="font-medium">{address.label}</div>
                  <div className="text-sm text-muted-foreground mt-1">
                    {address.address}, {address.pincode}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Phone: {address.phone}
                  </div>
                </Label>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => handleDelete(address.id)}
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          </Card>
        ))}
      </RadioGroup>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => onSelectAddress(null)}
        className="w-full"
      >
        <Plus className="h-4 w-4 mr-2" />
        Use New Address
      </Button>
    </div>
  );
}
