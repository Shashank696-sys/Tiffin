import { useQuery } from "@tanstack/react-query";
import { Navbar } from "@/components/navbar";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/lib/auth-context";
import { useLocation } from "wouter";
import type { BookingWithDetails } from "@shared/schema";
import { Calendar, Clock, MapPin, IndianRupee, Package } from "lucide-react";
import { useEffect } from "react";

export default function MyBookings() {
  const { isAuthenticated, isCustomer } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!isAuthenticated || !isCustomer) {
      setLocation("/login");
    }
  }, [isAuthenticated, isCustomer, setLocation]);

  const { data: bookings = [], isLoading } = useQuery<BookingWithDetails[]>({
    queryKey: ["/api/bookings/my"],
    enabled: isAuthenticated && isCustomer,
  });

  if (!isAuthenticated || !isCustomer) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="mb-8">
          <h1 className="font-[family-name:var(--font-sans)] text-3xl md:text-4xl font-bold mb-2">My Bookings</h1>
          <p className="text-muted-foreground">View and track your tiffin orders</p>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <Card key={i} className="p-6 animate-pulse">
                <div className="h-6 bg-muted rounded w-1/3 mb-4" />
                <div className="h-4 bg-muted rounded w-2/3" />
              </Card>
            ))}
          </div>
        ) : bookings.length === 0 ? (
          <Card className="p-12 text-center border-card-border">
            <Package className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-xl font-semibold mb-2">No bookings yet</h3>
            <p className="text-muted-foreground">Start browsing tiffins to make your first order</p>
          </Card>
        ) : (
          <div className="space-y-4">
            {bookings.map((booking) => (
              <Card key={booking._id} className="p-6 border-card-border hover-elevate" data-testid={`card-booking-${booking._id}`}>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                  <div>
                    <h3 className="font-[family-name:var(--font-sans)] text-xl font-semibold mb-1">{booking.tiffin.title}</h3>
                    <p className="text-muted-foreground">{booking.seller.shopName}</p>
                  </div>
                  <Badge
                    variant={
                      booking.status === "Confirmed"
                        ? "default"
                        : booking.status === "Cancelled"
                        ? "destructive"
                        : "secondary"
                    }
                    data-testid={`badge-status-${booking._id}`}
                  >
                    {booking.status}
                  </Badge>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <span>{new Date(booking.date).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    <span>{booking.slot}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Package className="w-4 h-4 text-muted-foreground" />
                    <span>Quantity: {booking.quantity}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <IndianRupee className="w-4 h-4 text-primary" />
                    <span className="font-semibold">₹{booking.totalPrice}</span>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-border">
                  <div className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">Delivery Address</p>
                      <p className="text-sm text-muted-foreground">{booking.deliveryAddress}</p>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
