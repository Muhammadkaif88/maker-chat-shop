import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface SaveAddressCheckboxProps {
  saveAddress: boolean;
  onSaveAddressChange: (checked: boolean) => void;
  addressLabel: string;
  onAddressLabelChange: (label: string) => void;
  isLoggedIn: boolean;
}

export function SaveAddressCheckbox({
  saveAddress,
  onSaveAddressChange,
  addressLabel,
  onAddressLabelChange,
  isLoggedIn,
}: SaveAddressCheckboxProps) {
  if (!isLoggedIn) return null;

  return (
    <div className="space-y-2 border-t border-border pt-4">
      <div className="flex items-center gap-2">
        <Checkbox
          id="save-address"
          checked={saveAddress}
          onCheckedChange={(checked) => onSaveAddressChange(checked as boolean)}
        />
        <Label htmlFor="save-address" className="cursor-pointer">
          Save this address for future orders
        </Label>
      </div>
      {saveAddress && (
        <div className="ml-6">
          <Label htmlFor="address-label" className="text-sm">Address Label</Label>
          <Input
            id="address-label"
            value={addressLabel}
            onChange={(e) => onAddressLabelChange(e.target.value)}
            placeholder="e.g., Home, Office, etc."
            className="mt-1"
          />
        </div>
      )}
    </div>
  );
}
