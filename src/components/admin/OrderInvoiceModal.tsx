import { useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Printer, X } from "lucide-react";

interface OrderItem {
  name: string;
  price: number;
  quantity: number;
}

interface Order {
  id: string;
  order_number: string;
  customer_name: string;
  customer_email: string | null;
  customer_phone: string;
  shipping_address: string;
  items: OrderItem[];
  total: number;
  status: string | null;
  created_at: string | null;
}

interface OrderInvoiceModalProps {
  order: Order | null;
  open: boolean;
  onClose: () => void;
}

export function OrderInvoiceModal({ order, open, onClose }: OrderInvoiceModalProps) {
  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    const printContents = printRef.current?.innerHTML;
    if (!printContents) return;

    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Invoice ${order?.order_number}</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: 'Segoe UI', sans-serif; padding: 40px; color: #333; }
            .invoice-container { max-width: 800px; margin: 0 auto; }
            .header { display: flex; justify-content: space-between; margin-bottom: 30px; }
            .company-name { font-size: 28px; font-weight: bold; color: #0891b2; }
            .company-address { font-size: 12px; color: #666; margin-top: 5px; }
            .invoice-title { font-size: 32px; font-weight: bold; color: #333; text-align: right; }
            .invoice-meta { text-align: right; font-size: 12px; color: #666; margin-top: 10px; }
            .bill-to { margin: 30px 0; padding: 20px; background: #f8f9fa; border-radius: 8px; }
            .bill-to-title { font-size: 12px; color: #666; text-transform: uppercase; margin-bottom: 10px; }
            .customer-name { font-size: 18px; font-weight: 600; }
            .customer-details { font-size: 13px; color: #666; margin-top: 5px; }
            table { width: 100%; border-collapse: collapse; margin: 30px 0; }
            th { background: #0891b2; color: white; padding: 12px; text-align: left; font-size: 12px; text-transform: uppercase; }
            td { padding: 12px; border-bottom: 1px solid #eee; font-size: 13px; }
            .text-right { text-align: right; }
            .totals { margin-top: 20px; }
            .total-row { display: flex; justify-content: flex-end; padding: 8px 0; font-size: 14px; }
            .total-label { width: 120px; }
            .total-value { width: 100px; text-align: right; }
            .grand-total { font-size: 18px; font-weight: bold; border-top: 2px solid #333; padding-top: 10px; }
            .payment-info { margin-top: 40px; padding: 20px; background: #f0f9ff; border-radius: 8px; }
            .payment-title { font-size: 14px; font-weight: 600; margin-bottom: 10px; }
            .payment-details { font-size: 12px; color: #666; line-height: 1.8; }
            .footer { margin-top: 40px; text-align: center; font-size: 14px; color: #666; }
            @media print { body { padding: 20px; } }
          </style>
        </head>
        <body>
          ${printContents}
        </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);
  };

  if (!order) return null;

  const items = Array.isArray(order.items) ? order.items : [];
  const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const invoiceDate = order.created_at ? new Date(order.created_at).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  }) : '';

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="flex flex-row items-center justify-between">
          <DialogTitle>Invoice - {order.order_number}</DialogTitle>
          <Button onClick={handlePrint} size="sm" className="gap-2">
            <Printer className="h-4 w-4" />
            Print Invoice
          </Button>
        </DialogHeader>

        <div ref={printRef} className="invoice-container">
          {/* Header */}
          <div className="flex justify-between items-start mb-8">
            <div>
              <h1 className="text-2xl font-bold text-primary">edukkit</h1>
              <p className="text-xs text-muted-foreground mt-1">
                Raihsoft Technologies Karaya<br />
                1st Floor Pandikkad<br />
                Malappuram, Kerala 676521<br />
                India
              </p>
            </div>
            <div className="text-right">
              <h2 className="text-3xl font-bold text-foreground">INVOICE</h2>
              <div className="text-sm text-muted-foreground mt-2">
                <p><strong>Invoice #:</strong> {order.order_number}</p>
                <p><strong>Date:</strong> {invoiceDate}</p>
              </div>
            </div>
          </div>

          {/* Bill To */}
          <div className="bg-muted/50 rounded-lg p-4 mb-6">
            <p className="text-xs text-muted-foreground uppercase mb-2">Bill To</p>
            <p className="font-semibold text-lg">{order.customer_name}</p>
            <p className="text-sm text-muted-foreground">{order.shipping_address}</p>
            <p className="text-sm text-muted-foreground">{order.customer_phone}</p>
            {order.customer_email && (
              <p className="text-sm text-muted-foreground">{order.customer_email}</p>
            )}
          </div>

          {/* Items Table */}
          <table className="w-full mb-6">
            <thead>
              <tr className="bg-primary text-primary-foreground">
                <th className="p-3 text-left text-xs uppercase">No</th>
                <th className="p-3 text-left text-xs uppercase">Item</th>
                <th className="p-3 text-right text-xs uppercase">Price</th>
                <th className="p-3 text-right text-xs uppercase">Qty</th>
                <th className="p-3 text-right text-xs uppercase">Total</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, index) => (
                <tr key={index} className="border-b border-border">
                  <td className="p-3 text-sm">{index + 1}</td>
                  <td className="p-3 text-sm">{item.name}</td>
                  <td className="p-3 text-sm text-right">₹{item.price.toLocaleString()}</td>
                  <td className="p-3 text-sm text-right">{item.quantity}</td>
                  <td className="p-3 text-sm text-right">₹{(item.price * item.quantity).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Totals */}
          <div className="flex justify-end mb-6">
            <div className="w-64">
              <div className="flex justify-between py-2 text-sm">
                <span className="text-muted-foreground">Sub-Total</span>
                <span>₹{subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between py-3 text-lg font-bold border-t-2 border-foreground">
                <span>Total Due</span>
                <span>₹{Number(order.total).toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Payment Info */}
          <div className="bg-primary/5 rounded-lg p-4 mb-6">
            <p className="font-semibold mb-2">Payment Method</p>
            <div className="text-sm text-muted-foreground grid grid-cols-2 gap-2">
              <p><strong>Bank:</strong> Kotak811 Bank</p>
              <p><strong>A/C No:</strong> 7049752112</p>
              <p><strong>IFSC:</strong> KKBK0009308</p>
              <p><strong>UPI ID:</strong> 8075100930@kotak811</p>
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              <strong>Email:</strong> edukkitofficial@gmail.com
            </p>
          </div>

          {/* Footer */}
          <div className="text-center text-muted-foreground">
            <p className="font-medium">THANK YOU FOR YOUR BUSINESS</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
