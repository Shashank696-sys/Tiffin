import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Navbar } from "@/components/navbar";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth-context";
import { useLocation } from "wouter";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { insertTiffinSchema, type InsertTiffin, type Tiffin, type BookingWithDetails, type Seller } from "@shared/schema";
import { Plus, Edit, Trash2, UtensilsCrossed, Package, AlertCircle, Calendar } from "lucide-react";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const TIME_SLOTS = ["12:00 PM - 2:00 PM", "7:00 PM - 9:00 PM", "12:00 PM - 9:00 PM"];

export default function SellerDashboard() {
  const { isAuthenticated, isSeller, seller, user } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingTiffin, setEditingTiffin] = useState<Tiffin | null>(null);

  useEffect(() => {
    if (!isAuthenticated || !isSeller) {
      setLocation("/login");
    }
  }, [isAuthenticated, isSeller, setLocation]);

  const { data: sellerData } = useQuery<Seller>({
    queryKey: ["/api/seller/profile"],
    enabled: isAuthenticated && isSeller,
  });

  const { data: tiffins = [], isLoading: tiffinsLoading } = useQuery<Tiffin[]>({
    queryKey: ["/api/seller/tiffins"],
    enabled: isAuthenticated && isSeller,
  });

  const { data: bookings = [], isLoading: bookingsLoading } = useQuery<BookingWithDetails[]>({
    queryKey: ["/api/seller/bookings"],
    enabled: isAuthenticated && isSeller,
  });

  const form = useForm<InsertTiffin>({
    resolver: zodResolver(insertTiffinSchema),
    defaultValues: {
      sellerId: seller?._id || "",
      title: "",
      description: "",
      category: "Veg",
      price: 0,
      availableDays: [],
      slots: [],
    },
  });

  const selectedDays = form.watch("availableDays");
  const selectedSlots = form.watch("slots");

  const addTiffinMutation = useMutation({
    mutationFn: async (data: InsertTiffin) => {
      return await apiRequest("POST", "/api/seller/tiffins", data);
    },
    onSuccess: () => {
      toast({ title: "Success", description: "Tiffin added successfully" });
      queryClient.invalidateQueries({ queryKey: ["/api/seller/tiffins"] });
      setIsAddDialogOpen(false);
      form.reset();
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const updateTiffinMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: InsertTiffin }) => {
      return await apiRequest("PUT", `/api/seller/tiffins/${id}`, data);
    },
    onSuccess: () => {
      toast({ title: "Success", description: "Tiffin updated successfully" });
      queryClient.invalidateQueries({ queryKey: ["/api/seller/tiffins"] });
      setEditingTiffin(null);
      form.reset();
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const deleteTiffinMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest("DELETE", `/api/seller/tiffins/${id}`, {});
    },
    onSuccess: () => {
      toast({ title: "Success", description: "Tiffin deleted successfully" });
      queryClient.invalidateQueries({ queryKey: ["/api/seller/tiffins"] });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const onSubmit = (data: InsertTiffin) => {
    if (editingTiffin) {
      updateTiffinMutation.mutate({ id: editingTiffin._id, data });
    } else {
      addTiffinMutation.mutate(data);
    }
  };

  const handleEdit = (tiffin: Tiffin) => {
    setEditingTiffin(tiffin);
    form.reset({
      sellerId: tiffin.sellerId,
      title: tiffin.title,
      description: tiffin.description,
      category: tiffin.category,
      price: tiffin.price,
      availableDays: tiffin.availableDays,
      slots: tiffin.slots,
    });
  };

  if (!isAuthenticated || !isSeller) {
    return null;
  }

  const isSuspended = sellerData?.status === "suspended";
  const isPending = sellerData?.status === "pending";

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="mb-8">
          <h1 className="font-[family-name:var(--font-sans)] text-3xl md:text-4xl font-bold mb-2">Seller Dashboard</h1>
          <p className="text-muted-foreground">Manage your tiffin listings and bookings</p>
        </div>

        {isSuspended && (
          <Card className="mb-6 border-destructive bg-destructive/10">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-destructive mt-0.5" />
                <div>
                  <h3 className="font-semibold text-destructive">Account Suspended</h3>
                  <p className="text-sm text-destructive/90">
                    Your account has been suspended. You cannot add new tiffins until your account is reactivated.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {isPending && (
          <Card className="mb-6 border-chart-3 bg-chart-3/10">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-chart-3 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-chart-3">Account Pending Approval</h3>
                  <p className="text-sm text-chart-3/90">
                    Your seller account is awaiting admin approval. You'll be able to add tiffins once approved.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="border-card-border">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium">Total Tiffins</CardTitle>
              <UtensilsCrossed className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{tiffins.length}</div>
            </CardContent>
          </Card>

          <Card className="border-card-border">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
              <Package className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{bookings.length}</div>
            </CardContent>
          </Card>

          <Card className="border-card-border">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium">Account Status</CardTitle>
              <AlertCircle className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <Badge variant={sellerData?.status === "active" ? "default" : sellerData?.status === "suspended" ? "destructive" : "secondary"}>
                {sellerData?.status || "Loading..."}
              </Badge>
            </CardContent>
          </Card>
        </div>

        <Card className="mb-8 border-card-border">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="font-[family-name:var(--font-sans)]">My Tiffins</CardTitle>
            <Button
              onClick={() => {
                form.reset();
                setEditingTiffin(null);
                setIsAddDialogOpen(true);
              }}
              disabled={isSuspended || isPending}
              data-testid="button-add-tiffin"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Tiffin
            </Button>
          </CardHeader>
          <CardContent>
            {tiffinsLoading ? (
              <div className="space-y-4">
                {[...Array(2)].map((_, i) => (
                  <div key={i} className="h-20 bg-muted rounded animate-pulse" />
                ))}
              </div>
            ) : tiffins.length === 0 ? (
              <div className="text-center py-12">
                <UtensilsCrossed className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-xl font-semibold mb-2">No tiffins yet</h3>
                <p className="text-muted-foreground mb-4">Start by adding your first tiffin listing</p>
              </div>
            ) : (
              <div className="space-y-3">
                {tiffins.map((tiffin) => (
                  <div
                    key={tiffin._id}
                    className="flex items-center justify-between p-4 border border-card-border rounded-lg hover-elevate"
                    data-testid={`card-tiffin-${tiffin._id}`}
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold">{tiffin.title}</h3>
                        <Badge variant="outline">{tiffin.category}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{tiffin.description}</p>
                      <div className="flex items-center gap-4 text-sm">
                        <span className="font-semibold text-primary">₹{tiffin.price}</span>
                        <span className="text-muted-foreground">{tiffin.availableDays.length} days</span>
                        <span className="text-muted-foreground">{tiffin.slots.length} slots</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(tiffin)}
                        disabled={isSuspended}
                        data-testid={`button-edit-${tiffin._id}`}
                        className="hover-elevate active-elevate-2"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deleteTiffinMutation.mutate(tiffin._id)}
                        disabled={isSuspended}
                        data-testid={`button-delete-${tiffin._id}`}
                        className="hover-elevate active-elevate-2"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-card-border">
          <CardHeader>
            <CardTitle className="font-[family-name:var(--font-sans)]">Recent Bookings</CardTitle>
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
                <p className="text-muted-foreground">Bookings will appear here once customers order your tiffins</p>
              </div>
            ) : (
              <div className="space-y-3">
                {bookings.map((booking) => (
                  <div
                    key={booking._id}
                    className="flex items-center justify-between p-4 border border-card-border rounded-lg hover-elevate"
                    data-testid={`card-booking-${booking._id}`}
                  >
                    <div>
                      <h3 className="font-semibold mb-1">{booking.tiffin.title}</h3>
                      <p className="text-sm text-muted-foreground mb-2">
                        {booking.customerName} • {booking.customerPhone}
                      </p>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(booking.date).toLocaleDateString()}
                        </span>
                        <span>{booking.slot}</span>
                        <span>Qty: {booking.quantity}</span>
                      </div>
                    </div>
                    <div className="text-right">
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
                      <p className="text-lg font-semibold text-primary mt-2">₹{booking.totalPrice}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={isAddDialogOpen || !!editingTiffin} onOpenChange={(open) => {
        if (!open) {
          setIsAddDialogOpen(false);
          setEditingTiffin(null);
          form.reset();
        }
      }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-[family-name:var(--font-sans)]">
              {editingTiffin ? "Edit Tiffin" : "Add New Tiffin"}
            </DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Delicious Homemade Thali" {...field} data-testid="input-title" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Describe your tiffin meal..."
                        {...field}
                        data-testid="input-description"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-category">
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Veg">Vegetarian</SelectItem>
                        <SelectItem value="Non-Veg">Non-Vegetarian</SelectItem>
                        <SelectItem value="Jain">Jain</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Price (₹)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="120"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value))}
                        data-testid="input-price"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="availableDays"
                render={() => (
                  <FormItem>
                    <FormLabel>Available Days</FormLabel>
                    <div className="grid grid-cols-2 gap-2">
                      {DAYS.map((day) => (
                        <div key={day} className="flex items-center gap-2">
                          <Checkbox
                            checked={selectedDays?.includes(day)}
                            onCheckedChange={(checked) => {
                              const current = selectedDays || [];
                              const updated = checked
                                ? [...current, day]
                                : current.filter((d) => d !== day);
                              form.setValue("availableDays", updated);
                            }}
                            data-testid={`checkbox-day-${day.toLowerCase()}`}
                          />
                          <label className="text-sm">{day}</label>
                        </div>
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="slots"
                render={() => (
                  <FormItem>
                    <FormLabel>Time Slots</FormLabel>
                    <div className="space-y-2">
                      {TIME_SLOTS.map((slot) => (
                        <div key={slot} className="flex items-center gap-2">
                          <Checkbox
                            checked={selectedSlots?.includes(slot)}
                            onCheckedChange={(checked) => {
                              const current = selectedSlots || [];
                              const updated = checked
                                ? [...current, slot]
                                : current.filter((s) => s !== slot);
                              form.setValue("slots", updated);
                            }}
                            data-testid={`checkbox-slot-${slot}`}
                          />
                          <label className="text-sm">{slot}</label>
                        </div>
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                className="w-full"
                disabled={addTiffinMutation.isPending || updateTiffinMutation.isPending}
                data-testid="button-submit-tiffin"
              >
                {addTiffinMutation.isPending || updateTiffinMutation.isPending
                  ? "Saving..."
                  : editingTiffin
                  ? "Update Tiffin"
                  : "Add Tiffin"}
              </Button>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
