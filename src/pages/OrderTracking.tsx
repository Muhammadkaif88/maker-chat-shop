import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, Package, Truck, CheckCircle, Clock, XCircle } from "lucide-react";

const statusConfig: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
  pending: { label: "Pending", icon: <Clock className="h-5 w-5" />, color: "bg-yellow-500" },
  confirmed: { label: "Confirmed", icon: <Package className="h-5 w-5" />, color: "bg-blue-500" },
  shipped: { label: "Shipped", icon: <Truck className="h-5 w-5" />, color: "bg-purple-500" },
  delivered: { label: "Delivered", icon: <CheckCircle className="h-5 w-5" />, color: "bg-green-500" },
  cancelled: { label: "Cancelled", icon: <XCircle className="h-5 w-5" />, color: "bg-red-500" },
};

export default function OrderTracking() {
  const [orderNumber, setOrderNumber] = useState("");
  const [searchedOrder, setSearchedOrder] = useState("");

  const { data: order, isLoading, error } = useQuery({
    queryKey: ["order-tracking", searchedOrder],
    queryFn: async () => {
      if (!searchedOrder) return null;
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .eq("order_number", searchedOrder)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!searchedOrder,
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchedOrder(orderNumber.trim());
  };

  const status = order?.status || "pending";
  const config = statusConfig[status] || statusConfig.pending;

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">Track Your Order</h1>
            <p className="text-muted-foreground">
              Enter your order number to check the current status
            </p>
          </div>

          <form onSubmit={handleSearch} className="flex gap-2 mb-8">
            <Input
              placeholder="Enter order number (e.g., ORD-ABC123)"
              value={orderNumber}
              onChange={(e) => setOrderNumber(e.target.value)}
              className="flex-1"
            />
            <Button type="submit" disabled={!orderNumber.trim()}>
              <Search className="h-4 w-4 mr-2" />
              Track
            </Button>
          </form>

          {isLoading && (
            <Card>
              <CardContent className="py-8 text-center">
                <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
                <p className="text-muted-foreground">Searching for your order...</p>
              </CardContent>
            </Card>
          )}

          {searchedOrder && !isLoading && !order && (
            <Card>
              <CardContent className="py-8 text-center">
                <XCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Order Not Found</h3>
                <p className="text-muted-foreground">
                  We couldn't find an order with number "{searchedOrder}". Please check the order number and try again.
                </p>
              </CardContent>
            </Card>
          )}

          {order && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Order #{order.order_number}</CardTitle>
                  <Badge className={`${config.color} text-white`}>
                    {config.icon}
                    <span className="ml-1">{config.label}</span>
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Status Timeline */}
                <div className="flex justify-between items-center">
                  {["pending", "confirmed", "shipped", "delivered"].map((step, index) => {
                    const stepConfig = statusConfig[step];
                    const isActive = ["pending", "confirmed", "shipped", "delivered"].indexOf(status) >= index;
                    const isCancelled = status === "cancelled";
                    
                    return (
                      <div key={step} className="flex flex-col items-center flex-1">
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            isCancelled
                              ? "bg-muted text-muted-foreground"
                              : isActive
                              ? stepConfig.color + " text-white"
                              : "bg-muted text-muted-foreground"
                          }`}
                        >
                          {stepConfig.icon}
                        </div>
                        <span className="text-xs mt-2 text-center">{stepConfig.label}</span>
                        {index < 3 && (
                          <div
                            className={`hidden sm:block absolute h-1 w-full ${
                              isActive && !isCancelled ? "bg-primary" : "bg-muted"
                            }`}
                            style={{ top: "50%", left: "50%", transform: "translateY(-50%)" }}
                          />
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Order Details */}
                <div className="border-t pt-4 space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Customer Name</span>
                    <span className="font-medium">{order.customer_name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Order Date</span>
                    <span className="font-medium">
                      {new Date(order.created_at!).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total Amount</span>
                    <span className="font-medium">₹{order.total.toLocaleString()}</span>
                  </div>
                </div>

                {/* Items */}
                <div className="border-t pt-4">
                  <h4 className="font-semibold mb-3">Order Items</h4>
                  <div className="space-y-2">
                    {(order.items as any[]).map((item: any, index: number) => (
                      <div key={index} className="flex justify-between text-sm">
                        <span>
                          {item.name} × {item.quantity}
                        </span>
                        <span>₹{(item.price * item.quantity).toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
