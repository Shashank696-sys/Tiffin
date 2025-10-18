import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { Navbar } from "@/components/navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth-context";
import { apiRequest } from "@/lib/queryClient";
import { insertUserSchema, type InsertUser, type AuthResponse } from "@shared/schema";
import { UtensilsCrossed } from "lucide-react";

type RegisterFormData = InsertUser;

export default function Register() {
  const { toast } = useToast();
  const { login } = useAuth();
  const [, setLocation] = useLocation();

  const form = useForm<RegisterFormData>({
    resolver: zodResolver(insertUserSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      password: "",
      role: "customer",
    },
  });

  const selectedRole = form.watch("role");

  const registerMutation = useMutation({
    mutationFn: async (data: RegisterFormData) => {
      return await apiRequest<AuthResponse>("POST", "/api/auth/register", data);
    },
    onSuccess: (data) => {
      login(data);
      toast({
        title: "Account created!",
        description: "Welcome to TiffinBox.",
      });

      if (data.user.role === "seller") {
        toast({
          title: "Seller account pending",
          description: "Your account is pending approval from admin.",
          variant: "default",
        });
        setLocation("/seller/dashboard");
      } else {
        setLocation("/");
      }
    },
    onError: (error: any) => {
      toast({
        title: "Registration failed",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: RegisterFormData) => {
    registerMutation.mutate(data);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="flex items-center justify-center px-4 py-12">
        <Card className="w-full max-w-md border-card-border">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                <UtensilsCrossed className="w-8 h-8 text-primary" />
              </div>
            </div>
            <CardTitle className="font-[family-name:var(--font-sans)] text-2xl">Create Account</CardTitle>
            <CardDescription>Join TiffinBox and start your journey</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name</FormLabel>
                      <FormControl>
                        <Input placeholder="John Doe" {...field} data-testid="input-name" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="john@example.com"
                          type="email"
                          {...field}
                          data-testid="input-email"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number</FormLabel>
                      <FormControl>
                        <Input placeholder="9876543210" {...field} data-testid="input-phone" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Min 6 characters"
                          type="password"
                          {...field}
                          data-testid="input-password"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="role"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>I want to</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-role">
                            <SelectValue placeholder="Select role" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="customer">Order Tiffins (Customer)</SelectItem>
                          <SelectItem value="seller">Sell Tiffins (Seller)</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  className="w-full"
                  disabled={registerMutation.isPending}
                  data-testid="button-register"
                >
                  {registerMutation.isPending ? "Creating account..." : "Create Account"}
                </Button>
              </form>
            </Form>

            <div className="mt-6 text-center text-sm">
              <span className="text-muted-foreground">Already have an account? </span>
              <Link href="/login" data-testid="link-login">
                <a className="text-primary font-medium hover:underline">Sign in</a>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
