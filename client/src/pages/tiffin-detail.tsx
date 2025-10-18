import { useQuery, useMutation } from "@tanstack/react-query";
import { useParams, useLocation } from "wouter";
import { Navbar } from "@/components/navbar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth-context";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { insertBookingSchema, type InsertBooking, type TiffinWithSeller } from "@shared/schema";
import { IndianRupee, MapPin, Clock, Calendar, Leaf, Drumstick, ArrowLeft } from "lucide-react";
import { Link } from "wouter";
import vegImage from "@assets/generated_images/Vegetarian_tiffin_lunch_box_a5780b62.png";
import nonVegImage from "@assets/generated_images/Non-vegetarian_tiffin_meal_aa63199b.png";
import jainImage from "@assets/generated_images/Jain_vegetarian_tiffin_7cdaa2e8.png";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const categoryImages: Record<string, string> = {
  Veg: vegImage,
  "Non-Veg": nonVegImage,
  Jain: jainImage,
};

export default function TiffinDetail() {
  const { id } = useParams();
  const { toast } = useToast();
  const { user, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();

  const { data: tiffin, isLoading } = useQuery<TiffinWithSeller>({
    queryKey: ["/api/tiffins", id],
    enabled: !!id,
  });

  const form = useForm<InsertBooking>({
    resolver: zodResolver(insertBookingSchema),
    defaultValues: {
      customerName: user?.name || "",
      customerEmail: user?.email || "",
      customerPhone: user?.phone || "",
      tiffinId: id || "",
      sellerId: tiffin?.sellerId || "",
      deliveryAddress: "",
      date: "",
      slot: "",
      quantity: 1,
      totalPrice: 0,
    },
  });

  const quantity = form.watch("quantity");

  const bookingMutation = useMutation({
    mutationFn: async (data: InsertBooking) => {
      if (!isAuthenticated) {
        throw new Error("Please login to book a tiffin");
      }
      return await apiRequest("POST", "/api/bookings", data);
    },
    onSuccess: () => {
      toast({
        title: "Booking successful!",
        description: "Your tiffin has been booked. Check your email for confirmation.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/bookings"] });
      setLocation("/my-bookings");
    },
    onError: (error: any) => {
      toast({
        title: "Booking failed",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: InsertBooking) => {
    if (!tiffin) return;
    const bookingData = {
      ...data,
      sellerId: tiffin.sellerId,
      totalPrice: tiffin.price * quantity,
    };
    bookingMutation.mutate(bookingData);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="animate-pulse space-y-8">
            <div className="h-96 bg-muted rounded-xl" />
            <div className="h-40 bg-muted rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  if (!tiffin) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 py-12 text-center">
          <p className="text-muted-foreground">Tiffin not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-12">
        <Link href="/" data-testid="link-back">
          <Button variant="ghost" className="mb-6 hover-elevate active-elevate-2">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Browse
          </Button>
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <Card className="overflow-hidden border-card-border">
              <div className="relative h-96">
                <img
                  src={categoryImages[tiffin.category]}
                  alt={tiffin.title}
                  className="w-full h-full object-cover"
                />
                <Badge
                  variant={tiffin.category === "Veg" ? "secondary" : "default"}
                  className="absolute top-4 right-4"
                >
                  {tiffin.category === "Veg" && <Leaf className="w-3 h-3 mr-1" />}
                  {tiffin.category === "Non-Veg" && <Drumstick className="w-3 h-3 mr-1" />}
                  {tiffin.category}
                </Badge>
              </div>

              <div className="p-6">
                <h1 className="font-[family-name:var(--font-sans)] text-3xl font-bold mb-4">{tiffin.title}</h1>
                <p className="text-muted-foreground mb-6">{tiffin.description}</p>

                <div className="space-y-3 mb-6">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{tiffin.seller.shopName}</p>
                      <p className="text-sm text-muted-foreground">{tiffin.seller.address}, {tiffin.seller.city}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-muted-foreground" />
                    <span>Available: {tiffin.slots.join(", ")}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-muted-foreground" />
                    <span>Days: {tiffin.availableDays.join(", ")}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 p-4 bg-primary/10 rounded-lg">
                  <IndianRupee className="w-6 h-6 text-primary" />
                  <span className="text-3xl font-bold">{tiffin.price}</span>
                  <span className="text-muted-foreground">per meal</span>
                </div>
              </div>
            </Card>
          </div>

          <div>
            <Card className="p-6 border-card-border">
              <h2 className="font-[family-name:var(--font-sans)] text-2xl font-bold mb-6">Book Your Tiffin</h2>
              
              {!isAuthenticated ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground mb-4">Please login to book a tiffin</p>
                  <Link href="/login">
                    <Button>Login to Book</Button>
                  </Link>
                </div>
              ) : (
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="customerName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Full Name</FormLabel>
                          <FormControl>
                            <Input {...field} data-testid="input-customer-name" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="customerEmail"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input type="email" {...field} data-testid="input-customer-email" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="customerPhone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone</FormLabel>
                          <FormControl>
                            <Input {...field} data-testid="input-customer-phone" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="deliveryAddress"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Delivery Address</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Enter full delivery address"
                              {...field}
                              data-testid="input-delivery-address"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="date"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Delivery Date</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} data-testid="input-date" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="slot"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Time Slot</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid="select-slot">
                                <SelectValue placeholder="Select time slot" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {tiffin.slots.map((slot) => (
                                <SelectItem key={slot} value={slot}>
                                  {slot}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="quantity"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Quantity</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min="1"
                              {...field}
                              onChange={(e) => field.onChange(parseInt(e.target.value))}
                              data-testid="input-quantity"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="bg-muted rounded-lg p-4">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-muted-foreground">Price per meal</span>
                        <span>₹{tiffin.price}</span>
                      </div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-muted-foreground">Quantity</span>
                        <span>{quantity}</span>
                      </div>
                      <div className="border-t border-border pt-2 mt-2">
                        <div className="flex justify-between items-center">
                          <span className="font-semibold">Total Amount</span>
                          <span className="text-2xl font-bold text-primary">₹{tiffin.price * quantity}</span>
                        </div>
                      </div>
                    </div>

                    <Button
                      type="submit"
                      className="w-full"
                      disabled={bookingMutation.isPending}
                      data-testid="button-submit-booking"
                    >
                      {bookingMutation.isPending ? "Booking..." : "Confirm Booking"}
                    </Button>
                  </form>
                </Form>
              )}
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
