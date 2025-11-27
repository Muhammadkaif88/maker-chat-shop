import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "@/contexts/CartContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Loader2, MessageCircle } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const Checkout = () => {
  const navigate = useNavigate();
  const { items, total, clearCart } = useCart();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
    pincode: "",
    notes: "",
  });

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
    setLoading(true);

    try {
      // Create order in database
      const orderNumber = `ORD${Date.now()}`;
      const { data: order, error } = await supabase
        .from("orders")
        .insert({
          order_number: orderNumber,
          customer_name: formData.name,
          customer_phone: formData.phone,
          customer_email: formData.email,
          shipping_address: `${formData.address}, ${formData.pincode}`,
          items: items.map((item) => ({
            productId: item.id,
            name: item.name,
            quantity: item.quantity,
            price: item.price,
          })),
          total,
          status: "pending",
        })
        .select()
        .single();

      if (error) throw error;

      // Generate WhatsApp message
      const itemsList = items
        .map((item) => `${item.name} x${item.quantity} - ₹${(item.price * item.quantity).toFixed(2)}`)
        .join("\n");

      const message = `🛒 *New Order*
Order ID: #${orderNumber}

*Items:*
${itemsList}

*Total:* ₹${total.toFixed(2)}

*Customer Details:*
Name: ${formData.name}
Phone: ${formData.phone}
Email: ${formData.email}

*Delivery Address:*
${formData.address}
${formData.pincode}

${formData.notes ? `*Notes:* ${formData.notes}` : ""}

Please confirm this order and provide payment instructions.`;

      // Get WhatsApp number from settings
      const { data: settings } = await supabase
        .from("settings")
        .select("value")
        .eq("key", "whatsapp_number")
        .single();

      const whatsappNumber = settings?.value || "919876543210";
      const encodedMessage = encodeURIComponent(message);
      const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodedMessage}`;

      // Open WhatsApp
      window.open(whatsappUrl, "_blank");

      // Clear cart and redirect
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
          {/* Order Summary */}
          <Card className="h-fit p-6">
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
              <div className="border-t border-border pt-3">
                <div className="flex justify-between text-lg font-bold">
                  <span>Total:</span>
                  <span className="text-primary">₹{total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </Card>

          {/* Checkout Form */}
          <Card className="p-6">
            <h2 className="mb-4 text-xl font-semibold">Delivery Details</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
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

              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number *</Label>
                <Input
                  id="phone"
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="98XXXXXXXX"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="you@example.com"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Delivery Address *</Label>
                <Textarea
                  id="address"
                  required
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="House No., Street, Area, City"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="pincode">Pincode *</Label>
                <Input
                  id="pincode"
                  required
                  value={formData.pincode}
                  onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                  placeholder="560001"
                />
              </div>

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
                    Buy via WhatsApp
                  </>
                )}
              </Button>

              <p className="text-center text-xs text-muted-foreground">
                Your order will be saved and a WhatsApp chat will open with the store. The admin will confirm
                your order and provide payment instructions.
              </p>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
