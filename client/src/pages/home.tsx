import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Navbar } from "@/components/navbar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, MapPin, Clock, IndianRupee, Leaf, Drumstick } from "lucide-react";
import { Link } from "wouter";
import type { TiffinWithSeller } from "@shared/schema";
import heroImage from "@assets/generated_images/Traditional_Indian_tiffin_thali_d174217b.png";
import vegImage from "@assets/generated_images/Vegetarian_tiffin_lunch_box_a5780b62.png";
import nonVegImage from "@assets/generated_images/Non-vegetarian_tiffin_meal_aa63199b.png";
import jainImage from "@assets/generated_images/Jain_vegetarian_tiffin_7cdaa2e8.png";

const categoryImages: Record<string, string> = {
  Veg: vegImage,
  "Non-Veg": nonVegImage,
  Jain: jainImage,
};

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedCity, setSelectedCity] = useState<string | null>(null);

  const { data: tiffins = [], isLoading } = useQuery<TiffinWithSeller[]>({
    queryKey: ["/api/tiffins"],
  });

  const cities = Array.from(new Set(tiffins.map((t) => t.seller.city)));
  const categories = ["Veg", "Non-Veg", "Jain"];

  const filteredTiffins = tiffins.filter((tiffin) => {
    const matchesSearch =
      !searchQuery ||
      tiffin.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tiffin.seller.shopName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !selectedCategory || tiffin.category === selectedCategory;
    const matchesCity = !selectedCity || tiffin.seller.city === selectedCity;
    return matchesSearch && matchesCategory && matchesCity;
  });

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="relative h-[80vh] overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url(${heroImage})`,
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/60 to-background" />
        <div className="relative h-full flex flex-col items-center justify-center px-4 text-center">
          <h1 className="font-[family-name:var(--font-sans)] text-5xl md:text-6xl font-bold text-white mb-4 drop-shadow-lg">
            Fresh Homemade <span className="text-primary">Tiffin</span> Meals
          </h1>
          <p className="text-xl md:text-2xl text-white/90 mb-8 max-w-2xl drop-shadow-md">
            Delicious, healthy meals delivered to your doorstep
          </p>

          <div className="w-full max-w-3xl bg-card/95 backdrop-blur-md rounded-xl shadow-xl p-6 border border-card-border">
            <div className="flex gap-2 mb-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  placeholder="Search for tiffins or sellers..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  data-testid="input-search"
                />
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button
                variant={selectedCategory === null ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(null)}
                data-testid="button-category-all"
                className="hover-elevate active-elevate-2"
              >
                All
              </Button>
              {categories.map((cat) => (
                <Button
                  key={cat}
                  variant={selectedCategory === cat ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(cat)}
                  data-testid={`button-category-${cat.toLowerCase()}`}
                  className="hover-elevate active-elevate-2"
                >
                  {cat === "Veg" && <Leaf className="w-4 h-4 mr-1" />}
                  {cat === "Non-Veg" && <Drumstick className="w-4 h-4 mr-1" />}
                  {cat}
                </Button>
              ))}
            </div>

            {cities.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-4">
                <Button
                  variant={selectedCity === null ? "secondary" : "ghost"}
                  size="sm"
                  onClick={() => setSelectedCity(null)}
                  data-testid="button-city-all"
                  className="hover-elevate active-elevate-2"
                >
                  All Cities
                </Button>
                {cities.map((city) => (
                  <Button
                    key={city}
                    variant={selectedCity === city ? "secondary" : "ghost"}
                    size="sm"
                    onClick={() => setSelectedCity(city)}
                    data-testid={`button-city-${city.toLowerCase()}`}
                    className="hover-elevate active-elevate-2"
                  >
                    <MapPin className="w-3 h-3 mr-1" />
                    {city}
                  </Button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="font-[family-name:var(--font-sans)] text-3xl md:text-4xl font-bold mb-4">
              Available Tiffin Meals
            </h2>
            <p className="text-muted-foreground text-lg">
              Choose from our selection of delicious homemade meals
            </p>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="overflow-hidden animate-pulse">
                  <div className="h-48 bg-muted" />
                  <div className="p-6 space-y-3">
                    <div className="h-6 bg-muted rounded" />
                    <div className="h-4 bg-muted rounded w-2/3" />
                    <div className="h-4 bg-muted rounded w-1/2" />
                  </div>
                </Card>
              ))}
            </div>
          ) : filteredTiffins.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground text-lg">No tiffins found. Try different filters.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTiffins.map((tiffin) => (
                <Card
                  key={tiffin._id}
                  className="overflow-hidden hover-elevate transition-all cursor-pointer group border-card-border"
                  data-testid={`card-tiffin-${tiffin._id}`}
                >
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={categoryImages[tiffin.category]}
                      alt={tiffin.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <Badge
                      variant={tiffin.category === "Veg" ? "secondary" : "default"}
                      className="absolute top-4 right-4"
                      data-testid={`badge-category-${tiffin._id}`}
                    >
                      {tiffin.category === "Veg" && <Leaf className="w-3 h-3 mr-1" />}
                      {tiffin.category === "Non-Veg" && <Drumstick className="w-3 h-3 mr-1" />}
                      {tiffin.category}
                    </Badge>
                  </div>

                  <div className="p-6">
                    <h3 className="font-[family-name:var(--font-sans)] text-xl font-semibold mb-2" data-testid={`text-title-${tiffin._id}`}>
                      {tiffin.title}
                    </h3>
                    <p className="text-muted-foreground text-sm mb-4 line-clamp-2">{tiffin.description}</p>

                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                      <MapPin className="w-4 h-4" />
                      <span>{tiffin.seller.shopName}</span>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                      <Clock className="w-4 h-4" />
                      <span>{tiffin.slots.join(", ")}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        <IndianRupee className="w-5 h-5 text-primary" />
                        <span className="text-2xl font-bold" data-testid={`text-price-${tiffin._id}`}>
                          {tiffin.price}
                        </span>
                        <span className="text-muted-foreground">/meal</span>
                      </div>
                      <Link href={`/tiffin/${tiffin._id}`} data-testid={`link-book-${tiffin._id}`}>
                        <Button>Book Now</Button>
                      </Link>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
