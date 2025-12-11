import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { UserPlus, Trash2, Users, Search } from "lucide-react";
import { useUserRole } from "@/hooks/useUserRole";

interface UserRole {
  id: string;
  user_id: string;
  role: "admin" | "staff" | "customer";
  created_at: string;
}

export default function StaffManagement() {
  const queryClient = useQueryClient();
  const { role } = useUserRole();
  const [newStaffEmail, setNewStaffEmail] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const { data: staffList, isLoading } = useQuery({
    queryKey: ["staff-list"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("user_roles")
        .select("*")
        .in("role", ["admin", "staff"])
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as UserRole[];
    },
  });

  const addStaffMutation = useMutation({
    mutationFn: async (email: string) => {
      // First check if user exists by looking up in auth
      // Since we can't directly query auth.users, we'll add the role
      // and the user can register/login with that email
      const { data: existingRole, error: checkError } = await supabase
        .from("user_roles")
        .select("*")
        .eq("role", "staff");

      // For now, we need the user to be registered first
      // We'll show instructions to the admin
      toast.info(`Please ask the staff member to register with email: ${email}, then come back here to add them.`);
      return;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["staff-list"] });
      setNewStaffEmail("");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const removeStaffMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("user_roles")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["staff-list"] });
      toast.success("Staff member removed");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const handleRemoveStaff = (id: string, userRole: string) => {
    if (userRole === "admin") {
      toast.error("Cannot remove admin users");
      return;
    }
    if (!confirm("Remove this staff member's access?")) return;
    removeStaffMutation.mutate(id);
  };

  // Filter staff list by search
  const filteredStaff = staffList?.filter(staff => 
    staff.user_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    staff.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Only admins can access this page
  if (role !== "admin") {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-muted-foreground">You don't have permission to access this page.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-foreground mb-2 flex items-center gap-3">
          <Users className="h-8 w-8" />
          Staff Management
        </h2>
        <p className="text-muted-foreground">
          Manage staff access. Staff can manage Products, Categories, Courses, and Orders but cannot access Settings.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Current Staff & Admins</CardTitle>
          <CardDescription>Users with administrative access to the store</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by user ID or role..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="border border-border rounded-lg overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User ID</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Added</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8">
                      Loading...
                    </TableCell>
                  </TableRow>
                ) : filteredStaff?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                      No staff members found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredStaff?.map((staff) => (
                    <TableRow key={staff.id}>
                      <TableCell className="font-mono text-sm">
                        {staff.user_id.slice(0, 8)}...
                      </TableCell>
                      <TableCell>
                        <Badge variant={staff.role === "admin" ? "default" : "secondary"}>
                          {staff.role}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {new Date(staff.created_at || "").toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        {staff.role !== "admin" && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleRemoveStaff(staff.id, staff.role)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Staff Permissions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <Badge variant="default">Admin</Badge>
              <span className="text-muted-foreground">Full access to all features including Settings</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary">Staff</Badge>
              <span className="text-muted-foreground">Access to Products, Categories, Courses, and Orders only</span>
            </div>
          </div>
          <p className="text-sm text-muted-foreground mt-4">
            To add a new staff member, ask them to register on the website first. Then contact the system administrator to assign them the staff role.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
