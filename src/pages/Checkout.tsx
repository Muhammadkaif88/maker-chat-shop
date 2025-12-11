import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "@/contexts/CartContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, MessageCircle, Truck } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { SavedAddresses } from "@/components/checkout/SavedAddresses";
import { SaveAddressCheckbox } from "@/components/checkout/SaveAddressCheckbox";

const KERALA_SHIPPING = 70;
const OTHER_STATE_SHIPPING = 100;

const COUNTRIES = [
  "India", "United States", "United Kingdom", "Canada", "Australia", "Germany",
  "France", "Japan", "China", "Brazil", "Russia", "South Africa", "United Arab Emirates",
  "Singapore", "Malaysia", "Nepal", "Bangladesh", "Sri Lanka", "Pakistan", "Afghanistan",
  "Argentina", "Austria", "Belgium", "Chile", "Colombia", "Denmark", "Egypt", "Finland",
  "Greece", "Hong Kong", "Indonesia", "Ireland", "Israel", "Italy", "Kenya", "Kuwait",
  "Mexico", "Netherlands", "New Zealand", "Nigeria", "Norway", "Oman", "Philippines",
  "Poland", "Portugal", "Qatar", "Saudi Arabia", "South Korea", "Spain", "Sweden",
  "Switzerland", "Taiwan", "Thailand", "Turkey", "Vietnam"
].sort();

const INDIAN_STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa",
  "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala",
  "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland",
  "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura",
  "Uttar Pradesh", "Uttarakhand", "West Bengal", "Andaman and Nicobar Islands",
  "Chandigarh", "Dadra and Nagar Haveli and Daman and Diu", "Delhi", "Jammu and Kashmir",
  "Ladakh", "Lakshadweep", "Puducherry"
].sort();

interface SavedAddress {
  id: string;
  label: string;
  address: string;
  phone: string;
  pincode: string;
  is_default: boolean;
}

const Checkout = () => {
  const navigate = useNavigate();
  const { items, total, clearCart } = useCart();
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [saveAddress, setSaveAddress] = useState(false);
  const [addressLabel, setAddressLabel] = useState("");
  const [formData, setFormData] = useState({
    country: "India",
    name: "",
    address: "",
    apartment: "",
    city: "",
    state: "",
    pincode: "",
    phone: "",
    email: "",
    notes: "",
  });

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUserId(user?.id || null);
    };
    checkUser();
  }, []);

  const handleSelectSavedAddress = (address: SavedAddress | null) => {
    if (address) {
      setSelectedAddressId(address.id);
      // Parse the saved address and fill form
      const parts = address.address.split(", ");
      setFormData(prev => ({
        ...prev,
        address: parts[0] || "",
        city: parts.length > 2 ? parts[parts.length - 3] : "",
        state: parts.length > 1 ? parts[parts.length - 2] : "",
        pincode: address.pincode,
        phone: address.phone,
      }));
    } else {
      setSelectedAddressId(null);
    }
  };

  // Auto-calculate shipping based on state
  const shippingCharge = useMemo(() => {
    if (formData.country !== "India") return OTHER_STATE_SHIPPING;
    return formData.state === "Kerala" ? KERALA_SHIPPING : OTHER_STATE_SHIPPING;
  }, [formData.country, formData.state]);

  const grandTotal = useMemo(() => total + shippingCharge, [total, shippingCharge]);

  if (items.length === 0) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <div className="mb-4 text-6xl">🛒</div>
          <h2 className="mb-2 text-2xl font-bold">Your cart is empty</h2>
          <p className="mb-4 text-muted-foreground">Add some products to checkout</p>
          <Button onClick={() => navigate("/products")}>Browse Products</Button>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.state) {
      toast.error("Please select a state");
      return;
    }

    setLoading(true);

    try {
      // Save address if requested
      if (saveAddress && userId && addressLabel) {
        const fullAddressForSave = [
          formData.address,
          formData.apartment,
          formData.city,
          formData.state,
          formData.country
        ].filter(Boolean).join(", ");

        const { error: saveError } = await supabase
          .from("user_addresses")
          .insert({
            user_id: userId,
            label: addressLabel,
            address: fullAddressForSave,
            pincode: formData.pincode,
            phone: formData.phone,
            is_default: false,
          });

        if (saveError) {
          console.error("Error saving address:", saveError);
        } else {
          toast.success("Address saved for future orders");
        }
      }

      const orderNumber = `ORD${Date.now()}`;
      const fullAddress = [
        formData.address,
        formData.apartment,
        formData.city,
        formData.state,
        formData.pincode,
        formData.country
      ].filter(Boolean).join(", ");
      
      const { data: order, error } = await supabase
        .from("orders")
        .insert({
          order_number: orderNumber,
          customer_name: formData.name,
          customer_phone: formData.phone,
          customer_email: formData.email,
          shipping_address: fullAddress,
          user_id: userId,
          items: items.map((item) => ({
            productId: item.id,
            name: item.name,
            quantity: item.quantity,
            price: item.price,
          })),
          total: grandTotal,
          status: "pending",
        })
        .select()
        .single();

      if (error) throw error;

      const itemsList = items
        .map((item) => `${item.name} x${item.quantity} - ₹${(item.price * item.quantity).toFixed(2)}`)
        .join("\n");

      const shippingLabel = formData.state === "Kerala" ? "Kerala" : "Outside Kerala";

      const message = `🛒 *New Order*
Order ID: #${orderNumber}

*Items:*
${itemsList}

*Subtotal:* ₹${total.toFixed(2)}
*Shipping (${shippingLabel}):* ₹${shippingCharge}
*Total:* ₹${grandTotal.toFixed(2)}

*Customer Details:*
Name: ${formData.name}
Phone: ${formData.phone}
Email: ${formData.email || "Not provided"}

*Delivery Address:*
${formData.address}
${formData.apartment ? formData.apartment + "\n" : ""}${formData.city}, ${formData.state} ${formData.pincode}
${formData.country}

${formData.notes ? `*Notes:* ${formData.notes}` : ""}

Please confirm this order and provide payment instructions.`;

      const { data: settings } = await supabase
        .from("settings")
        .select("value")
        .eq("key", "whatsapp_number")
        .single();

      const whatsappNumber = settings?.value || "919876543210";
      const encodedMessage = encodeURIComponent(message);
      const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodedMessage}`;

      window.open(whatsappUrl, "_blank");

      clearCart();
      toast.success("Order created! Redirecting to WhatsApp...");
      setTimeout(() => navigate("/"), 2000);
    } catch (error) {
      console.error("Checkout error:", error);
      toast.error("Failed to create order. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto max-w-4xl px-4">
        <h1 className="mb-8 text-3xl font-bold text-foreground">Checkout via WhatsApp</h1>

        <div className="grid gap-8 lg:grid-cols-2">
          {/* Checkout Form */}
          <Card className="p-6 order-2 lg:order-1">
            <h2 className="mb-4 text-xl font-semibold">Delivery Details</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Saved Addresses */}
              <SavedAddresses
                onSelectAddress={handleSelectSavedAddress}
                selectedAddressId={selectedAddressId}
              />

              {!selectedAddressId && (
                <>
                  {/* Country */}
                  <div className="space-y-2">
                    <Label htmlFor="country">Country/Region *</Label>
                    <Select
                      value={formData.country}
                      onValueChange={(value) => setFormData({ ...formData, country: value, state: "" })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select country" />
                      </SelectTrigger>
                      <SelectContent className="max-h-60 bg-background">
                        {COUNTRIES.map((country) => (
                          <SelectItem key={country} value={country}>
                            {country}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Address */}
                  <div className="space-y-2">
                    <Label htmlFor="address">Address *</Label>
                    <Input
                      id="address"
                      required
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      placeholder="House No., Street, Area"
                    />
                  </div>

                  {/* Apartment/Suite */}
                  <div className="space-y-2">
                    <Label htmlFor="apartment">Apartment, Suite, etc. (Optional)</Label>
                    <Input
                      id="apartment"
                      value={formData.apartment}
                      onChange={(e) => setFormData({ ...formData, apartment: e.target.value })}
                      placeholder="Apartment, floor, building name"
                    />
                  </div>

                  {/* City */}
                  <div className="space-y-2">
                    <Label htmlFor="city">City *</Label>
                    <Input
                      id="city"
                      required
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      placeholder="Kochi"
                    />
                  </div>

                  {/* State */}
                  <div className="space-y-2">
                    <Label htmlFor="state">State *</Label>
                    {formData.country === "India" ? (
                      <Select
                        value={formData.state}
                        onValueChange={(value) => setFormData({ ...formData, state: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select state" />
                        </SelectTrigger>
                        <SelectContent className="max-h-60 bg-background">
                          {INDIAN_STATES.map((state) => (
                            <SelectItem key={state} value={state}>
                              {state}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <Input
                        id="state"
                        required
                        value={formData.state}
                        onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                        placeholder="State/Province"
                      />
                    )}
                    {formData.country === "India" && formData.state && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Shipping: ₹{formData.state === "Kerala" ? KERALA_SHIPPING : OTHER_STATE_SHIPPING}
                        {formData.state === "Kerala" && " (Local delivery)"}
                      </p>
                    )}
                  </div>

                  {/* Pincode */}
                  <div className="space-y-2">
                    <Label htmlFor="pincode">Pincode/ZIP Code *</Label>
                    <Input
                      id="pincode"
                      required
                      value={formData.pincode}
                      onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                      placeholder="682001"
                    />
                  </div>

                  {/* Save Address Checkbox */}
                  <SaveAddressCheckbox
                    saveAddress={saveAddress}
                    onSaveAddressChange={setSaveAddress}
                    addressLabel={addressLabel}
                    onAddressLabelChange={setAddressLabel}
                    isLoggedIn={!!userId}
                  />
                </>
              )}

              {/* Name */}
              <div className="space-y-2">
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ajay Kumar"
                />
              </div>

              {/* Phone */}
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number *</Label>
                <Input
                  id="phone"
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+91 98XXXXXXXX"
                />
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email">Email (Optional)</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="you@example.com"
                />
              </div>

              {/* Notes */}
              <div className="space-y-2">
                <Label htmlFor="notes">Special Instructions (Optional)</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Any special delivery instructions?"
                  rows={2}
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-secondary text-secondary-foreground hover:bg-secondary/90"
                size="lg"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Creating Order...
                  </>
                ) : (
                  <>
                    <MessageCircle className="mr-2 h-5 w-5" />
                    Buy via WhatsApp (₹{grandTotal.toFixed(2)})
                  </>
                )}
              </Button>

              <p className="text-center text-xs text-muted-foreground">
                Your order will be saved and a WhatsApp chat will open with the store. The admin will confirm
                your order and provide payment instructions.
              </p>
            </form>
          </Card>

          {/* Order Summary */}
          <Card className="h-fit p-6 order-1 lg:order-2">
            <h2 className="mb-4 text-xl font-semibold">Order Summary</h2>
            <div className="space-y-3">
              {items.map((item) => (
                <div key={item.id} className="flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    {item.name} x{item.quantity}
                  </span>
                  <span className="font-medium">₹{(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
              <div className="border-t border-border pt-3 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>₹{total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground flex items-center gap-1">
                    <Truck className="h-4 w-4" />
                    Shipping ({formData.state === "Kerala" ? "Kerala" : "Outside Kerala"})
                  </span>
                  <span>₹{shippingCharge}</span>
                </div>
                <div className="flex justify-between text-lg font-bold border-t border-border pt-2">
                  <span>Total:</span>
                  <span className="text-primary">₹{grandTotal.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
