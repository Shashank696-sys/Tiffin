import { useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Navbar } from "@/components/navbar";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth-context";
import { useLocation } from "wouter";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { SellerWithUser, BookingWithDetails, AdminStats } from "@shared/schema";
import { Users, UtensilsCrossed, Package, UserCheck, CheckCircle, XCircle, AlertCircle } from "lucide-react";

export default function AdminPanel() {
  const { isAuthenticated, isAdmin } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  useEffect(() => {
    if (!isAuthenticated || !isAdmin) {
      setLocation("/login");
    }
  }, [isAuthenticated, isAdmin, setLocation]);

  const { data: stats } = useQuery<AdminStats>({
    queryKey: ["/api/admin/stats"],
    enabled: isAuthenticated && isAdmin,
  });

  const { data: sellers = [], isLoading: sellersLoading } = useQuery<SellerWithUser[]>({
    queryKey: ["/api/admin/sellers"],
    enabled: isAuthenticated && isAdmin,
  });

  const { data: bookings = [], isLoading: bookingsLoading } = useQuery<BookingWithDetails[]>({
    queryKey: ["/api/admin/bookings"],
    enabled: isAuthenticated && isAdmin,
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      return await apiRequest("PUT", `/api/admin/sellers/${id}/status`, { status });
    },
    onSuccess: (_, { status }) => {
      toast({
        title: "Status updated",
        description: `Seller has been ${status === "active" ? "approved" : status}.`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/sellers"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update status",
        variant: "destructive",
      });
    },
  });

  if (!isAuthenticated || !isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="mb-8">
          <h1 className="font-[family-name:var(--font-sans)] text-3xl md:text-4xl font-bold mb-2">Admin Dashboard</h1>
          <p className="text-muted-foreground">Manage sellers, tiffins, and bookings</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="border-card-border">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium">Total Sellers</CardTitle>
              <Users className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalSellers || 0}</div>
            </CardContent>
          </Card>

          <Card className="border-card-border">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium">Pending Approvals</CardTitle>
              <UserCheck className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.pendingSellers || 0}</div>
            </CardContent>
          </Card>

          <Card className="border-card-border">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium">Total Tiffins</CardTitle>
              <UtensilsCrossed className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalTiffins || 0}</div>
            </CardContent>
          </Card>

          <Card className="border-card-border">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
              <Package className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalBookings || 0}</div>
            </CardContent>
          </Card>
        </div>

        <Card className="mb-8 border-card-border">
          <CardHeader>
            <CardTitle className="font-[family-name:var(--font-sans)]">Seller Management</CardTitle>
          </CardHeader>
          <CardContent>
            {sellersLoading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-20 bg-muted rounded animate-pulse" />
                ))}
              </div>
            ) : sellers.length === 0 ? (
              <div className="text-center py-12">
                <Users className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-xl font-semibold mb-2">No sellers yet</h3>
                <p className="text-muted-foreground">Sellers will appear here once they register</p>
              </div>
            ) : (
              <div className="space-y-3">
                {sellers.map((seller) => (
                  <div
                    key={seller._id}
                    className="flex items-center justify-between p-4 border border-card-border rounded-lg hover-elevate"
                    data-testid={`card-seller-${seller._id}`}
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold">{seller.shopName}</h3>
                        <Badge
                          variant={
                            seller.status === "active"
                              ? "default"
                              : seller.status === "suspended"
                              ? "destructive"
                              : "secondary"
                          }
                          data-testid={`badge-status-${seller._id}`}
                        >
                          {seller.status}
                        </Badge>
                      </div>
                      <div className="text-sm text-muted-foreground space-y-1">
                        <p>{seller.user.name} • {seller.user.email}</p>
                        <p>{seller.address}, {seller.city}</p>
                        <p>Contact: {seller.contactNumber}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {seller.status === "pending" && (
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() => updateStatusMutation.mutate({ id: seller._id, status: "active" })}
                          disabled={updateStatusMutation.isPending}
                          data-testid={`button-approve-${seller._id}`}
                        >
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Approve
                        </Button>
                      )}
                      {seller.status === "active" && (
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => updateStatusMutation.mutate({ id: seller._id, status: "suspended" })}
                          disabled={updateStatusMutation.isPending}
                          data-testid={`button-suspend-${seller._id}`}
                        >
                          <XCircle className="w-4 h-4 mr-1" />
                          Suspend
                        </Button>
                      )}
                      {seller.status === "suspended" && (
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() => updateStatusMutation.mutate({ id: seller._id, status: "active" })}
                          disabled={updateStatusMutation.isPending}
                          data-testid={`button-reactivate-${seller._id}`}
                        >
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Reactivate
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-card-border">
          <CardHeader>
            <CardTitle className="font-[family-name:var(--font-sans)]">All Bookings</CardTitle>
          </CardHeader>
          <CardContent>
            {bookingsLoading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-20 bg-muted rounded animate-pulse" />
                ))}
              </div>
            ) : bookings.length === 0 ? (
              <div className="text-center py-12">
                <Package className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-xl font-semibold mb-2">No bookings yet</h3>
                <p className="text-muted-foreground">Bookings will appear here once customers start ordering</p>
              </div>
            ) : (
              <div className="space-y-3">
                {bookings.map((booking) => (
                  <div
                    key={booking._id}
                    className="flex items-center justify-between p-4 border border-card-border rounded-lg hover-elevate"
                    data-testid={`card-booking-${booking._id}`}
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold">{booking.tiffin.title}</h3>
                        <Badge
                          variant={
                            booking.status === "Confirmed"
                              ? "default"
                              : booking.status === "Cancelled"
                              ? "destructive"
                              : "secondary"
                          }
                        >
                          {booking.status}
                        </Badge>
                      </div>
                      <div className="text-sm text-muted-foreground space-y-1">
                        <p>Customer: {booking.customerName} • {booking.customerPhone}</p>
                        <p>Seller: {booking.seller.shopName}</p>
                        <p>Date: {new Date(booking.date).toLocaleDateString()} • {booking.slot}</p>
                        <p>Quantity: {booking.quantity} • Amount: ₹{booking.totalPrice}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
