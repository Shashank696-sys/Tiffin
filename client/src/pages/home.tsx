import { useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import CookieConsent from "@/components/cookie-consent";
import { 
  Search, 
  MapPin, 
  Clock, 
  IndianRupee, 
  Star,
  Shield,
  Truck,
  Clock4,
  Heart,
  ChevronDown,
  Filter,
  Navigation,
  Phone,
  Mail,
  Facebook,
  Twitter,
  Instagram,
  User,
  LogIn,
  ChefHat,
  Crown,
  BookOpen,
  Menu,
  X,
  Users,
  ExternalLink,
  Zap,
  Code,
  Cpu,
  Sparkles,
  Award,
  GitBranch,
  Globe
} from "lucide-react";
import { Link, useLocation } from "wouter";
import type { TiffinWithSeller } from "@shared/schema";

interface TopRatedSeller {
  _id: string;
  shopName: string;
  city: string;
  ratingStats?: {
    averageRating: number;
    totalRatings: number;
  };
  user?: {
    name: string;
    email: string;
  };
}

// Import optimized images
import heroImage from "@assets/generated_images/Traditional_Indian_tiffin_thali_d174217b.png";
import vegImage from "@assets/generated_images/Vegetarian_tiffin_lunch_box_a5780b62.png";
import nonVegImage from "@assets/generated_images/Non-vegetarian_tiffin_meal_aa63199b.png";
import jainImage from "@assets/generated_images/Jain_vegetarian_tiffin_7cdaa2e8.png";

const categoryImages: Record<string, string> = {
  Veg: vegImage,
  "Non-Veg": nonVegImage,
  Jain: jainImage,
};

// Featured cities
const featuredCities = ["Lucknow", "Unnao", "Nawabganj", "Kanpur"];

// Cuisine categories
const cuisineCategories = [
  { name: "North Indian", icon: "🍛", count: "150+" },
  { name: "South Indian", icon: "🍛", count: "120+" },
  { name: "Gujarati", icon: "🍛", count: "80+" },
  { name: "Punjabi", icon: "🍛", count: "200+" },
  { name: "Maharashtrian", icon: "🍛", count: "90+" },
  { name: "Rajasthani", icon: "🍛", count: "60+" },
];

// Scroll animation component with 3D effect - Mobile Optimized
const ScrollAnimation3D = ({ children, delay = 0, className = "" }: { children: React.ReactNode; delay?: number; className?: string }) => {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => setIsVisible(true), delay);
        }
      },
      { threshold: 0.1 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current);
      }
    };
  }, [delay]);

  return (
    <div
      ref={ref}
      className={`transition-all duration-700 transform ${
        isVisible
          ? "translate-y-0 opacity-100 rotate-0 scale-100"
          : "translate-y-8 opacity-0 rotate-1 scale-95"
      } ${className}`}
      style={{
        transformStyle: 'preserve-3d',
      }}
    >
      {children}
    </div>
  );
};

// Parallax Scrolling Effect Component - Mobile Optimized
const ParallaxSection = ({ children, speed = 0.3, className = "" }: { children: React.ReactNode; speed?: number; className?: string }) => {
  const [offset, setOffset] = useState(0);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (ref.current) {
        const elementTop = ref.current.getBoundingClientRect().top;
        const elementHeight = ref.current.offsetHeight;
        const scrollY = window.scrollY;
        
        if (elementTop < window.innerHeight && elementTop > -elementHeight) {
          setOffset(scrollY * speed);
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [speed]);

  return (
    <div
      ref={ref}
      className={className}
      style={{
        transform: `translateY(${offset}px)`,
        transition: 'transform 0.1s ease-out'
      }}
    >
      {children}
    </div>
  );
};

// Better Food Section Component - Animation on scroll only
const BetterFoodSection = () => {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);
  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated) {
          setTimeout(() => {
            setIsVisible(true);
            setHasAnimated(true);
          }, 300);
        }
      },
      { 
        threshold: 0.3,
        rootMargin: '0px 0px -50px 0px'
      }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current);
      }
    };
  }, [hasAnimated]);

  return (
    <section 
      ref={sectionRef}
      className="py-20 bg-white relative overflow-hidden"
    >
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-4 items-start">
          <div className={`flex justify-center lg:justify-start transition-all duration-1000 ease-out delay-300 ${
            isVisible 
              ? 'translate-x-0 translate-y-0 opacity-100 rotate-[-5deg]' 
              : '-translate-x-20 -translate-y-10 opacity-0 rotate-[-15deg]'
          }`}>
            <img
              src="https://images.unsplash.com/photo-1628462626251-dc8abf27ece0?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=880"
              alt="Main Dish"
              className="w-40 h-40 lg:w-48 lg:h-48 object-cover rounded-2xl shadow-lg transform rotate-[-5deg] hover:rotate-0 transition-transform duration-300"
            />
          </div>

          <div className={`text-center px-2 lg:px-12 transition-all duration-1000 transform ${
            isVisible ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-10 opacity-0 scale-95'
          }`}>
            <h2 className="text-3xl lg:text-5xl font-bold text-gray-800 mb-6 leading-tight">
              Better food for more people
            </h2>
            
            <p className="text-lg lg:text-xl text-gray-600 mb-10 leading-relaxed max-w-3xl mx-auto">
              For over a decade, we've enabled our customers to discover new tastes, 
              delivered right to their doorstep.
            </p>

            <div className={`flex justify-center items-center gap-8 lg:gap-16 max-w-2xl mx-auto transition-all duration-1000 delay-400 ${
              isVisible ? 'opacity-100' : 'opacity-0'
            }`}>
              <div className="text-center">
                <div className="text-2xl lg:text-4xl font-bold text-gray-800 mb-2">100+</div>
                <div className="text-gray-500 text-sm lg:text-base">restaurants</div>
              </div>
              <div className="text-center">
                <div className="text-2xl lg:text-4xl font-bold text-gray-800 mb-2">3+</div>
                <div className="text-gray-500 text-sm lg:text-base">cities</div>
              </div>
              <div className="text-center">
                <div className="text-2xl lg:text-4xl font-bold text-gray-800 mb-2">1k+</div>
                <div className="text-gray-500 text-sm lg:text-base">orders delivered</div>
              </div>
            </div>
          </div>

          <div className={`flex flex-col gap-10 lg:gap-12 items-center lg:items-end transition-all duration-1000 ease-out delay-500 ${
            isVisible 
              ? 'translate-x-0 translate-y-0 opacity-100' 
              : 'translate-x-20 -translate-y-10 opacity-0'
          }`}>
            <div className={`transform transition-all duration-1000 ease-out delay-600 ${
              isVisible 
                ? 'rotate-[8deg] opacity-100' 
                : 'rotate-[20deg] opacity-0'
            }`}>
              <img
                src="https://images.pexels.com/photos/12737805/pexels-photo-12737805.jpeg"
                alt="Tiffin Box"
                className="w-32 h-32 lg:w-36 lg:h-36 object-cover rounded-2xl shadow-lg transform rotate-[8deg] hover:rotate-0 transition-transform duration-300"
              />
            </div>

            <div className={`transform transition-all duration-1000 ease-out delay-700 ${
              isVisible 
                ? 'rotate-[-6deg] opacity-100' 
                : 'rotate-[-20deg] opacity-0'
            }`}>
              <img
                src="https://media.istockphoto.com/id/669635320/photo/kidney-bean-curry-or-rajma-or-rajmah-chawal-and-roti-typical-north-indian-main-course.jpg?b=1&s=612x612&w=0&k=20&c=IgMdz1ZM-zHUmmxCUTlTACqqM0VbXjqu3KqTcOkKtkQ="
                alt="Biryani"
                className="w-32 h-32 lg:w-36 lg:h-36 object-cover rounded-2xl shadow-lg transform rotate-[-6deg] hover:rotate-0 transition-transform duration-300"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

// Zomato-style App Download Section with Animation & Floating Tags
const AppDownloadSection = () => {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  const iphoneImageUrl = "https://image2url.com/images/1761330459663-adb52748-b610-4a4b-b7c9-05ebe666eedc.jpg";

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.3 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current);
      }
    };
  }, []);

  return (
    <section 
      ref={sectionRef}
      className="py-16 bg-white relative overflow-hidden border-t border-gray-200"
    >
      <div className="max-w-7xl mx-auto px-4 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="text-gray-800 text-center lg:text-left">
            <h2 className="text-4xl lg:text-5xl font-bold mb-4 leading-tight">
              Download the app now!
            </h2>
            
            <p className="text-gray-600 text-lg lg:text-xl mb-8 leading-relaxed max-w-md">
              Experience seamless online ordering only on the Tiffo app
            </p>

            <div className="space-y-4 mb-8">
              <div className="text-center lg:text-left">
                <p className="text-gray-500 text-sm mb-3">GET IT ON</p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                  <Button className="bg-gray-900 hover:bg-black text-white px-8 py-4 rounded-lg font-semibold transition-all hover:scale-105 border border-gray-300 relative">
                    <div className="flex items-center gap-3">
                      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M3.609 1.814L13.792 12 3.61 22.186a.996.996 0 0 1-.61-.92V2.734a1 1 0 0 1 .609-.92zM14 5v14l7-7-7-7z"/>
                      </svg>
                      <div className="text-left">
                        <div className="text-xs">Google Play</div>
                      </div>
                    </div>
                    <span className="absolute -top-2 -right-2 bg-yellow-500 text-black text-xs px-2 py-1 rounded-full font-bold">
                      Soon
                    </span>
                  </Button>
                  
                  <Button className="bg-gray-900 hover:bg-black text-white px-8 py-4 rounded-lg font-semibold transition-all hover:scale-105 border border-gray-300 relative">
                    <div className="flex items-center gap-3">
                      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                      </svg>
                      <div className="text-left">
                        <div className="text-xs">App Store</div>
                      </div>
                    </div>
                    <span className="absolute -top-2 -right-2 bg-yellow-500 text-black text-xs px-2 py-1 rounded-full font-bold">
                      Soon
                    </span>
                  </Button>
                </div>
              </div>
            </div>

            <div>
              <p className="text-gray-500 text-sm">
                Scan the QR code to download the app
              </p>
            </div>
          </div>

          <div className="relative flex justify-center lg:justify-end">
            <div className={`
              relative z-20 transition-all duration-1000 transform
              ${isVisible 
                ? 'translate-y-0 opacity-100 rotate-0 scale-100' 
                : 'translate-y-20 opacity-0 rotate-3 scale-95'
              }
            `}>
              <div className="relative w-auto max-w-[500px] h-auto">
                <img 
                  src={iphoneImageUrl}
                  alt="Tiffo App Download"
                  className="w-full h-auto max-h-[600px] min-h-[400px] object-contain rounded-2xl shadow-2xl transition-transform duration-500 hover:scale-105"
                />
              </div>
            </div>

            <div className={`
              absolute top-6 -left-8 z-10 transition-all duration-1000 delay-300
              ${isVisible ? 'translate-x-0 opacity-100' : '-translate-x-10 opacity-0'}
            `}>
              <div className="bg-white rounded-2xl p-4 shadow-2xl w-36 transform -rotate-6 border border-gray-200 hover:scale-105 transition-transform">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                    <Truck className="w-4 h-4 text-green-600" />
                  </div>
                  <span className="text-xs font-semibold text-gray-800">Fast Delivery</span>
                </div>
                <div className="text-[10px] text-gray-600">30-min guarantee</div>
              </div>
            </div>

            <div className={`
              absolute top-32 -left-4 z-10 transition-all duration-1000 delay-500
              ${isVisible ? 'translate-x-0 opacity-100' : '-translate-x-8 opacity-0'}
            `}>
              <div className="bg-white rounded-2xl p-4 shadow-2xl w-32 transform rotate-3 border border-gray-200 hover:scale-105 transition-transform">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-7 h-7 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Zap className="w-4 h-4 text-blue-600" />
                  </div>
                  <span className="text-xs font-semibold text-gray-800">Live Tracking</span>
                </div>
                <div className="text-[10px] text-gray-600">Real-time updates</div>
              </div>
            </div>

            <div className={`
              absolute bottom-32 -right-6 z-10 transition-all duration-1000 delay-700
              ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-10 opacity-0'}
            `}>
              <div className="bg-white rounded-2xl p-4 shadow-2xl w-32 transform rotate-6 border border-gray-200 hover:scale-105 transition-transform">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-7 h-7 bg-yellow-100 rounded-lg flex items-center justify-center">
                    <Star className="w-4 h-4 text-yellow-600" />
                  </div>
                  <span className="text-xs font-semibold text-gray-800">4.8 Rating</span>
                </div>
                <div className="text-[10px] text-gray-600">5000+ reviews</div>
              </div>
            </div>

            <div className={`
              absolute bottom-8 -right-4 z-10 transition-all duration-1000 delay-900
              ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-8 opacity-0'}
            `}>
              <div className="bg-white rounded-2xl p-4 shadow-2xl w-36 transform -rotate-3 border border-gray-200 hover:scale-105 transition-transform">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-7 h-7 bg-red-100 rounded-lg flex items-center justify-center">
                    <Award className="w-4 h-4 text-red-600" />
                  </div>
                  <span className="text-xs font-semibold text-gray-800">Exclusive Offers</span>
                </div>
                <div className="text-[10px] text-gray-600">App-only deals</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

// Style 1: Professional Red Theme - Fixed Version
const FloatingDeveloperCard = () => {
  const [showCard, setShowCard] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const [location] = useLocation();

  useEffect(() => {
    const cameFromAbout = sessionStorage.getItem('cameFromAbout');
    if (cameFromAbout) {
      console.log('Came from about page, not showing card');
      sessionStorage.removeItem('cameFromAbout');
      return;
    }

    const hasClosedCard = sessionStorage.getItem('developerCardClosed');
    if (hasClosedCard) return;

    console.log('Showing card after delay');
    
    const timer = setTimeout(() => {
      setShowCard(true);
      setTimeout(() => setIsVisible(true), 100);
    }, 2500);

    return () => clearTimeout(timer);
  }, [location]);

  const closeCard = () => {
    sessionStorage.setItem('developerCardClosed', 'true');
    setIsVisible(false);
    setTimeout(() => setShowCard(false), 300);
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (cardRef.current && !cardRef.current.contains(e.target as Node)) {
      closeCard();
    }
  };

  const handleAboutClick = () => {
    sessionStorage.setItem('cameFromAbout', 'true');
    window.location.href = '/about';
  };

  if (!showCard) return null;

  return (
    <div 
      className={`fixed inset-0 z-[9999] transition-all duration-500 flex items-center justify-center p-4 ${
        isVisible ? 'bg-black/40 backdrop-blur-sm' : 'bg-transparent'
      }`}
      onClick={handleBackdropClick}
    >
      <div 
        ref={cardRef}
        className={`transition-all duration-500 transform ${
          isVisible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
        }`}
      >
        <div className="bg-white rounded-2xl shadow-2xl mx-2 max-w-[280px] w-full relative">
          <button
            onClick={closeCard}
            className="absolute -top-2 -right-2 z-20 w-7 h-7 bg-red-500 hover:bg-red-600 text-white rounded-full shadow-lg border-2 border-white flex items-center justify-center transition-all duration-300"
          >
            <X className="w-3 h-3" />
          </button>

          <div className="p-4 text-center">
            <div className="relative mx-auto mb-3">
              <div className="w-16 h-16 rounded-full bg-gradient-to-r from-red-500 to-orange-500 p-0.5 mx-auto shadow-lg">
                <img
                  src="https://as2.ftcdn.net/v2/jpg/05/89/93/27/1000_F_589932782_vQAEAZhHnq1QCGu5ikwrYaQD0Mmurm0N.jpg"
                  alt="Shashank Pandey"
                  className="w-full h-full rounded-full object-cover border-2 border-white"
                />
              </div>
            </div>
            <h3 className="text-base font-bold text-gray-800 mb-1">Shashank Pandey</h3>
            <p className="text-red-500 font-semibold text-xs mb-1">Lead Developer & Executor</p>
            <p className="text-gray-500 text-[10px] mb-3">Full Stack Developer - End to End Solutions</p>

            <p className="text-gray-600 text-xs leading-relaxed mb-3">
               Managing seller verification and overall platform execution.
            </p>
            <button 
              onClick={handleAboutClick}
              className="w-full bg-red-500 hover:bg-red-600 text-white font-semibold rounded-lg text-xs py-2 shadow-md transition-all duration-300"
            >
              About our Team
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Team Member Card Component
const TeamMemberCard = ({ member, index }: { member: any; index: number }) => {
  const [isFlipped, setIsFlipped] = useState(false);

  return (
    <ScrollAnimation3D delay={index * 200}>
      <div 
        className="relative w-full max-w-xs mx-auto cursor-pointer group"
        onClick={() => setIsFlipped(!isFlipped)}
      >
        <div className={`absolute inset-0 backface-hidden transition-all duration-500 transform ${
          isFlipped ? 'rotate-y-180 opacity-0' : 'rotate-y-0 opacity-100'
        }`}>
          <Card className="bg-gradient-to-br from-white to-gray-50 border-0 shadow-lg rounded-2xl p-4 h-72 flex flex-col items-center text-center group-hover:shadow-xl transition-all duration-300">
            <div className="relative mb-3">
              <div className="w-16 h-16 rounded-full bg-gradient-to-r from-red-500 to-orange-500 p-0.5">
                <img
                  src={member.image}
                  alt={member.name}
                  className="w-full h-full rounded-full object-cover border-2 border-white"
                />
              </div>
              <div className="absolute bottom-1 right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
            </div>

            <h3 className="text-lg font-bold text-gray-800 mb-1">{member.name}</h3>
            <p className="text-red-500 font-semibold text-sm mb-1">{member.role}</p>
            <p className="text-gray-600 text-xs mb-2">{member.additionalRole}</p>

            <div className="flex flex-wrap gap-1 justify-center mb-3">
              {member.achievements.map((achievement: string, i: number) => (
                <span key={i} className="bg-red-50 text-red-600 text-xs px-2 py-1 rounded-full">
                  {achievement}
                </span>
              ))}
            </div>

            <div className="mt-auto flex items-center gap-1 text-gray-500 text-xs">
              <span>Tap to flip</span>
              <ExternalLink className="w-3 h-3" />
            </div>
          </Card>
        </div>

        <div className={`absolute inset-0 backface-hidden transition-all duration-500 transform ${
          isFlipped ? 'rotate-y-0 opacity-100' : 'rotate-y-180 opacity-0'
        }`}>
          <Card className="bg-gradient-to-br from-gray-800 to-gray-900 text-white border-0 shadow-lg rounded-2xl p-4 h-72 flex flex-col">
            <h3 className="text-lg font-bold mb-2 text-center">{member.name}</h3>
            
            <p className="text-gray-300 text-xs mb-3 text-center leading-relaxed">
              {member.description}
            </p>

            <div className="mb-3">
              <h4 className="font-semibold text-red-400 mb-1 text-center text-sm">Skills</h4>
              <div className="flex flex-wrap gap-1 justify-center">
                {member.skills.map((skill: string, i: number) => (
                  <span key={i} className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            <Button 
              className="w-full bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm py-2 mt-auto"
              onClick={(e) => {
                e.stopPropagation();
                window.location.href = '/about';
              }}
            >
              View Full Profile
            </Button>
          </Card>
        </div>
      </div>
    </ScrollAnimation3D>
  );
};

// Team Members Data
const teamMembers = [
  {
    name: "Shashank Pandey",
    role: "Lead Developer",
    additionalRole: "Team Lead & Executor",
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face",
    description: "Full-stack developer with 5+ years experience in building scalable web applications.",
  }
];



// Main Home Component
export default function Home() {
  const { data: topRatedSellers = [] } = useQuery<TopRatedSeller[]>({
    queryKey: ["/api/top-rated-sellers"],
  });
  
  const [hasSearched, setHasSearched] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedCity, setSelectedCity] = useState<string | null>(null);
  const [selectedFoodType, setSelectedFoodType] = useState<string | null>(null);
  const [showCityDropdown, setShowCityDropdown] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeTab, setActiveTab] = useState("all");
  const [showLoginPopup, setShowLoginPopup] = useState(false);
  const [userType, setUserType] = useState<"customer" | "seller" | "admin" | null>(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [location] = useLocation();

  const [selectedPriceRange, setSelectedPriceRange] = useState<string | null>(null);
const [showMoreFilters, setShowMoreFilters] = useState(false);

  const [currentPlaceholder, setCurrentPlaceholder] = useState('');
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  

  const searchTerms = [
    "kadhai paneer..",
    "butter chicken..", 
    "biryani..",
    "tiffin services..",
    "home cooked meals..",
    "daily lunch..",
    "healthy food..",
    "veg thali..",
    "chole bhature..",
    "north indian food..",
    "south indian food..",
    "paneer butter masala..",
    "dal makhani..",
    "rajma chawal.."
  ];

  

  useEffect(() => {
    const currentTerm = searchTerms[placeholderIndex];
    const baseText = "Search for ";
    
    const timeout = setTimeout(() => {
      if (!isDeleting) {
        if (charIndex < currentTerm.length) {
          setCurrentPlaceholder(baseText + currentTerm.substring(0, charIndex + 1));
          setCharIndex(charIndex + 1);
        } else {
          setTimeout(() => setIsDeleting(true), 1500);
        }
      } else {
        if (charIndex > 0) {
          setCurrentPlaceholder(baseText + currentTerm.substring(0, charIndex - 1));
          setCharIndex(charIndex - 1);
        } else {
          setIsDeleting(false);
          setPlaceholderIndex((placeholderIndex + 1) % searchTerms.length);
        }
      }
    }, isDeleting ? 50 : 100);

    return () => clearTimeout(timeout);
  }, [charIndex, isDeleting, placeholderIndex]);

  const { data: tiffins = [], isLoading } = useQuery<TiffinWithSeller[]>({
    queryKey: ["/api/tiffins"],
  });

  

  useEffect(() => {
    const handleScroll = () => {
      const scrolled = window.scrollY > 20;
      setIsScrolled(scrolled);

      const winHeight = window.innerHeight;
      const docHeight = document.documentElement.scrollHeight;
      const scrollTop = window.pageYOffset;
      const trackLength = docHeight - winHeight;
      const progress = Math.floor((scrollTop / trackLength) * 100);
      setScrollProgress(progress);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (userType === "seller") {
      window.location.href = "/seller/dashboard";
    } else if (userType === "admin") {
      window.location.href = "/admin";
    } else if (userType === "customer") {
      window.location.href = "/my-bookings";
    }
  }, [userType]);

  const cities = Array.from(new Set(tiffins.map((t) => t.seller.city)));
  const categories = ["Veg", "Non-Veg", "Jain"];
  const foodTypes = ["Tiffin", "Meal"];

  // Price ranges define karo
const priceRanges = [
  { label: "Under ₹100", value: "0-100", min: 0, max: 100 },
  { label: "₹100 - ₹200", value: "100-200", min: 100, max: 200 },
  { label: "₹200 - ₹300", value: "200-300", min: 200, max: 300 },
  { label: "₹300 - ₹400", value: "300-400", min: 300, max: 400 },
  { label: "₹400 - ₹500", value: "400-500", min: 400, max: 500 },
  { label: "Above ₹500", value: "500+", min: 500, max: Infinity }
];

// Filtered tiffins mein price range filter add karo
const filteredTiffins = tiffins.filter((tiffin) => {
  const matchesSearch =
    !searchQuery ||
    tiffin.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    tiffin.seller.shopName.toLowerCase().includes(searchQuery.toLowerCase());
  
  const matchesCategory = !selectedCategory || tiffin.category === selectedCategory;
  const matchesCity = !selectedCity || tiffin.seller.city === selectedCity;
  
  const matchesFoodType = !selectedFoodType || 
    (selectedFoodType === "Tiffin" && tiffin.serviceType === "tiffin") ||
    (selectedFoodType === "Meal" && tiffin.serviceType === "meal");

  // Price range filter
  const matchesPrice = !selectedPriceRange || (() => {
    const range = priceRanges.find(r => r.value === selectedPriceRange);
    if (!range) return true;
    
    if (range.value === "500+") {
      return tiffin.price >= range.min;
    }
    return tiffin.price >= range.min && tiffin.price <= range.max;
  })();
  
  return matchesSearch && matchesCategory && matchesCity && matchesFoodType && matchesPrice;
});

  const popularTiffins = filteredTiffins.slice(0, 6);

  const handleLogin = (type: "customer" | "seller" | "admin") => {
    setUserType(type);
    setShowLoginPopup(false);
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  

  return (
    <div className="min-h-screen bg-white">
      {/* Scroll Progress Bar */}
      <div className="fixed top-0 left-0 w-full h-1 bg-gray-200 z-50">
        <div 
          className="h-full bg-gradient-to-r from-red-500 to-orange-500 transition-all duration-300"
          style={{ width: `${scrollProgress}%` }}
        />
      </div>

      {/* Floating Developer Card */}
      <FloatingDeveloperCard />

      {/* Cookie Consent */}
      <CookieConsent />

      {/* Navbar - Transparent Background */}
      <div className={`absolute top-0 left-0 right-0 z-40 transition-all duration-300 ${
        isScrolled ? ' backdrop-blur-md shadow-lg py-2' : 'bg-transparent py-4'
      }`}>
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-r from-red-500 to-red-600 rounded-lg flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-lg">T</span>
              </div>
              <span className={`font-bold text-2xl ${
                isScrolled ? 'text-gray-800' : 'text-white drop-shadow-md'
              }`}>
                Tiffo
              </span>
            </div>

            <div className="hidden lg:flex items-center gap-6">
              <Link href="/my-bookings">
                <span className={`font-medium cursor-pointer transition-colors ${
                  isScrolled 
                    ? 'text-gray-700 hover:text-red-500' 
                    : 'text-white hover:text-red-300 drop-shadow-sm'
                }`}>
                  My Orders
                </span>
              </Link>
              
              {userType === "customer" && (
                <Link href="/my-bookings">
                  <span className={`font-medium cursor-pointer transition-colors ${
                    isScrolled 
                      ? 'text-gray-700 hover:text-red-500' 
                      : 'text-white hover:text-red-300 drop-shadow-sm'
                  }`}>
                    <BookOpen className="w-4 h-4 inline mr-1" />
                    My Bookings
                  </span>
                </Link>
              )}

              <div className="flex items-center gap-4">
                <Link href="/help">
                  <span className={`font-medium cursor-pointer transition-colors ${
                    isScrolled 
                      ? 'text-gray-700 hover:text-red-500' 
                      : 'text-white hover:text-red-300 drop-shadow-sm'
                  }`}>
                    Help
                  </span>
                </Link>
                
                <Button 
                  onClick={() => setShowLoginPopup(true)}
                  className={`rounded-full font-medium transition-all ${
                    isScrolled
                      ? 'bg-white text-red-500 border border-red-500 hover:bg-red-50'
                      : 'bg-white/90 backdrop-blur-sm text-red-500 border border-red-500 hover:bg-white hover:shadow-lg'
                  }`}
                >
                  <LogIn className="w-4 h-4 mr-2" />
                  Login
                </Button>
              </div>
            </div>

            <div className="flex items-center gap-3 lg:hidden">
              <Button 
                onClick={() => setShowLoginPopup(true)}
                className={`rounded-full font-medium transition-all ${
                  isScrolled
                    ? 'bg-white text-red-500 border border-red-500 hover:bg-red-50'
                    : 'bg-white/90 backdrop-blur-sm text-red-500 border border-red-500 hover:bg-white hover:shadow-lg'
                }`}
                size="sm"
              >
                <LogIn className="w-4 h-4" />
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowMobileMenu(!showMobileMenu)}
                className={isScrolled ? 'text-gray-700' : 'text-white hover:bg-white/20 backdrop-blur-sm'}
              >
                {showMobileMenu ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </Button>
            </div>
          </div>

          {showMobileMenu && (
            <div className="lg:hidden absolute top-full left-0 right-0 bg-white/95 backdrop-blur-md shadow-xl border-t">
              <div className="flex flex-col p-4 space-y-3">
                {userType === "customer" && (
                  <Link href="/my-bookings">
                    <span className="font-medium text-gray-700 hover:text-red-500 block py-2">
                      <BookOpen className="w-4 h-4 inline mr-2" />
                      My Orders
                    </span>
                  </Link>
                )}
                <Link href="/help">
                  <span className="font-medium text-gray-700 hover:text-red-500 block py-2">
                    Help
                  </span>
                </Link>
                <Link href="/about">
                  <span className="font-medium text-gray-700 hover:text-red-500 block py-2">
                    About Team
                  </span>
                </Link>
                <Link href="/my-bookings">
                  <span className={`font-medium cursor-pointer transition-colors ${
                    isScrolled 
                      ? 'text-gray-700 hover:text-red-500' 
                      : 'text-black hover:text-red-300 drop-shadow-sm'
                  }`}>
                    <BookOpen className="w-4 h-4 inline mr-1" />
                    My Bookings
                  </span>
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>

      {showLoginPopup && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-auto shadow-2xl">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Welcome to Tiffo</h2>
              <p className="text-gray-600">Choose how you want to continue</p>
            </div>

            <div className="space-y-4">
              <Button 
                onClick={() => handleLogin("customer")}
                className="w-full bg-red-500 hover:bg-red-600 text-white py-4 rounded-xl text-base font-semibold transition-all hover:scale-105"
              >
                <User className="w-5 h-5 mr-3" />
                Continue as Customer
              </Button>

              <Button 
                onClick={() => handleLogin("seller")}
                className="w-full bg-orange-500 hover:bg-orange-600 text-white py-4 rounded-xl text-base font-semibold transition-all hover:scale-105"
              >
                <ChefHat className="w-5 h-5 mr-3" />
                Continue as Seller
              </Button>
            </div>

            <Button 
              onClick={() => setShowLoginPopup(false)}
              variant="ghost" 
              className="w-full mt-4 text-gray-500 hover:text-gray-700"
            >
              Close
            </Button>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <ParallaxSection speed={0.3}>
        <div className="relative h-screen min-h-[600px] overflow-hidden">
          {/* Background Video */}
          <div className="absolute inset-0 w-full h-full">
            <video
              autoPlay
              muted
              loop
              playsInline
              className="w-full h-full object-cover"
              style={{
                filter: 'brightness(0.7)'
              }}
            >
              <source src="/videos/bg.mp4" type="video/mp4" />
              <div 
                className="w-full h-full bg-cover bg-center"
                style={{
                  backgroundImage: `linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.4)), url('https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2000&q=80')`
                }}
              />
            </video>
            <div className="absolute inset-0 bg-black bg-opacity-40"></div>
          </div>

          <div className="relative h-full container mx-auto px-4 flex items-center pt-16">
            <div className="max-w-2xl text-center mx-auto w-full">
              <ScrollAnimation3D>
                <h1 className="font-bold text-4xl lg:text-6xl text-white mb-4 leading-tight drop-shadow-2xl">
                  <span className="block">Hungry?</span>
                  <span className="block text-yellow-300 bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent">
                    Pre - Order Tiffin Now
                  </span>
                </h1>
              </ScrollAnimation3D>

              <ScrollAnimation3D delay={200}>
                <p className="text-lg lg:text-xl text-white/90 mb-6 leading-relaxed max-w-2xl mx-auto drop-shadow-lg px-4">
                  Discover the best homemade tiffins from trusted kitchens near you. 
                  Fresh, delicious, and delivered to your doorstep.
                </p>
              </ScrollAnimation3D>

              <ScrollAnimation3D delay={400}>
                <div className="bg-white rounded-xl shadow-2xl p-2 max-w-2xl mx-auto transform hover:scale-105 transition-transform duration-300">
                  <div className="flex flex-col sm:flex-row gap-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 p-3 border-b sm:border-b-0 sm:border-r">
                        <MapPin className="w-5 h-5 text-red-500" />
                        <div className="text-left flex-1">
                          <select 
                            className="font-semibold text-gray-800 outline-none bg-transparent cursor-pointer w-full text-sm"
                            value={selectedCity || ""}
                            onChange={(e) => setSelectedCity(e.target.value)}
                          >
                            <option value="">Select City</option>
                            {featuredCities.map(city => (
                              <option key={city} value={city}>{city}</option>
                            ))}
                          </select>
                          <div className="text-xs text-gray-500">Select your location</div>
                        </div>
                      </div>
                    </div>

                    <div className="flex-[2] relative">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 z-10" />
                        <Input
                          placeholder={currentPlaceholder}
                          className="pl-10 pr-4 py-4 text-base border-0 focus:ring-0 w-full"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                        />
                      </div>
                    </div>

                    <Button className="bg-red-500 hover:bg-red-600 text-white px-6 py-4 text-base font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300">
                      <Search className="w-5 h-5" />
                    </Button>
                  </div>
                </div>
              </ScrollAnimation3D>

              <ScrollAnimation3D delay={600}>
                <div className="flex flex-wrap justify-center gap-6 mt-8 px-4">
                  {[
                    { number: "50k+", label: "Happy Customers" },
                    { number: "1K+", label: "Tiffin Partners" },
                    { number: "3+", label: "Cities" },
                    { number: "4.8★", label: "Rating" }
                  ].map((stat, index) => (
                    <div key={index} className="text-center transform hover:scale-110 transition-transform duration-300">
                      <div className="text-xl font-bold text-white drop-shadow-lg">{stat.number}</div>
                      <div className="text-white/80 text-sm">{stat.label}</div>
                    </div>
                  ))}
                </div>
              </ScrollAnimation3D>
            </div>
          </div>

          <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 animate-bounce">
            <div className="w-6 h-10 border-2 border-white rounded-full flex justify-center cursor-pointer" onClick={scrollToTop}>
              <div className="w-1 h-3 bg-white rounded-full mt-2 animate-pulse"></div>
            </div>
          </div>
        </div>
      </ParallaxSection>

      {isScrolled && (
        <Button
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 z-40 w-12 h-12 bg-red-500 hover:bg-red-600 text-white rounded-full shadow-2xl transition-all duration-300 hover:scale-110"
          size="icon"
        >
          <Navigation className="w-5 h-5" />
        </Button>
      )}

      {/* Food Type Filter Section */}
      <ScrollAnimation3D>
        <section className="py-8 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                Choose Your Food Type
              </h2>
              <p className="text-gray-600">
                Select between complete meals or individual tiffins
              </p>
            </div>

            <div className="flex flex-wrap justify-center gap-4">
              {foodTypes.map((type) => (
                <Button
                  key={type}
                  onClick={() => setSelectedFoodType(selectedFoodType === type ? null : type)}
                  variant={selectedFoodType === type ? "default" : "outline"}
                  className={`rounded-full px-6 py-3 font-semibold transition-all ${
                    selectedFoodType === type
                      ? 'bg-red-500 hover:bg-red-600 text-white shadow-lg'
                      : 'bg-white text-gray-700 border-gray-300 hover:border-red-500 hover:text-red-500'
                  }`}
                >
                  {type === "Tiffin" ? "🍱 Tiffin Boxes" : "🍛 Full Meals"}
                </Button>
              ))}
            </div>
          </div>
        </section>
      </ScrollAnimation3D>

      {/* Better Food Section */}
      {(hasSearched || (!searchQuery && !selectedCity && !selectedCategory)) && (
        <BetterFoodSection />
      )}

      {/* Tiffin Section with Tabs */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8 gap-4">
            <div>
              <h2 className="text-3xl font-bold text-gray-800 mb-2">
                {selectedFoodType === "Tiffin" 
                  ? "Best Tiffin Boxes in Your Area" 
                  : selectedFoodType === "Meal" 
                  ? "Best Full Meals in Your Area"
                  : "Best Food in Your Area"
                }
              </h2>
              <p className="text-gray-600">
                Discover homemade delights from trusted kitchens
              </p>
            </div>
            
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex gap-2">
                {foodTypes.map((type) => (
                  <Button
                    key={type}
                    onClick={() => setSelectedFoodType(selectedFoodType === type ? null : type)}
                    variant={selectedFoodType === type ? "default" : "outline"}
                    size="sm"
                    className={`rounded-full ${
                      selectedFoodType === type
                        ? 'bg-red-500 hover:bg-red-600 text-white'
                        : 'border-gray-300 text-gray-700'
                    }`}
                  >
                    {type}
                  </Button>
                ))}
              </div>

              <div className="flex gap-2">
                {categories.map((category) => (
                  <Button
                    key={category}
                    onClick={() => setSelectedCategory(selectedCategory === category ? null : category)}
                    variant={selectedCategory === category ? "default" : "outline"}
                    size="sm"
                    className={`rounded-full ${
                      selectedCategory === category
                        ? 'bg-red-500 hover:bg-red-600 text-white'
                        : 'border-gray-300 text-gray-700'
                    }`}
                  >
                    {category}
                  </Button>
                ))}
              </div>

  {/* More Filters Button with Dropdown */}
  <div className="relative">
    <Button 
      variant="outline" 
      className="border-gray-300 text-gray-700 rounded-full whitespace-nowrap" 
      size="sm"
      onClick={() => setShowMoreFilters(!showMoreFilters)}
    >
      <Filter className="w-4 h-4 mr-2" />
      More Filters
      {selectedPriceRange && (
        <span className="ml-1 w-2 h-2 bg-red-500 rounded-full"></span>
      )}
    </Button>

    {/* Filters Dropdown */}
    {showMoreFilters && (
      <div className="absolute top-full right-0 mt-2 w-64 bg-white rounded-xl shadow-2xl border border-gray-200 z-50 p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-800">Filters</h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowMoreFilters(false)}
            className="w-6 h-6 p-0"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Price Range Filter */}
        <div className="mb-4">
          <h4 className="font-medium text-gray-700 mb-3">Price Range</h4>
          <div className="space-y-2">
            {priceRanges.map((range) => (
              <div
                key={range.value}
                className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-all ${
                  selectedPriceRange === range.value
                    ? 'bg-red-50 border border-red-200'
                    : 'bg-gray-50 hover:bg-gray-100'
                }`}
                onClick={() => {
                  setSelectedPriceRange(selectedPriceRange === range.value ? null : range.value);
                }}
              >
                <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                  selectedPriceRange === range.value
                    ? 'border-red-500 bg-red-500'
                    : 'border-gray-400'
                }`}>
                  {selectedPriceRange === range.value && (
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  )}
                </div>
                <span className={`text-sm ${
                  selectedPriceRange === range.value ? 'text-red-600 font-semibold' : 'text-gray-700'
                }`}>
                  {range.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Clear All Button */}
        {(selectedPriceRange) && (
          <Button
            variant="outline"
            className="w-full border-red-200 text-red-600 hover:bg-red-50"
            size="sm"
            onClick={() => {
              setSelectedPriceRange(null);
            }}
          >
            Clear All Filters
          </Button>
        )}
      </div>
    )}
  </div>
          
          </div>
          </div>

          <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="mb-6">
            <TabsList className="bg-gray-100 p-1 rounded-xl inline-flex overflow-x-auto w-full">
              {[
                { value: "all", label: "All Items" },
                { value: "popular", label: "Popular 🔥" },
                { value: "top-rated", label: "Top Rated ⭐" },
              ].map((tab) => (
                <TabsTrigger 
                  key={tab.value}
                  value={tab.value}
                  className="rounded-lg data-[state=active]:bg-white data-[state=active]:text-red-500 data-[state=active]:shadow-sm font-semibold px-4 py-2 transition-all hover:scale-105 whitespace-nowrap"
                >
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>

            {/* All Items Tab */}
            <TabsContent value="all" className="mt-6">
              {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[...Array(6)].map((_, i) => (
                    <Card key={i} className="overflow-hidden border-0 shadow-lg rounded-2xl">
                      <Skeleton className="h-48 w-full rounded-2xl" />
                      <div className="p-6 space-y-4">
                        <Skeleton className="h-6 w-3/4 rounded" />
                        <Skeleton className="h-4 w-full rounded" />
                        <Skeleton className="h-4 w-2/3 rounded" />
                        <div className="flex justify-between items-center pt-4">
                          <Skeleton className="h-8 w-20 rounded-lg" />
                          <Skeleton className="h-10 w-24 rounded-lg" />
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              ) : filteredTiffins.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-20 h-20 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                    <Search className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">No items found</h3>
                  <p className="text-gray-600 mb-4">Try adjusting your search criteria</p>
                  <Button 
                    onClick={() => {
                      setSearchQuery("");
                      setSelectedCategory(null);
                      setSelectedCity(null);
                      setSelectedFoodType(null);
                    }}
                    className="bg-red-500 hover:bg-red-600 text-white rounded-full hover:scale-105 transition-transform"
                  >
                    Clear Filters
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredTiffins.map((tiffin, index) => (
                    <ScrollAnimation3D key={tiffin._id} delay={index * 100}>
                      <Card className="overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-500 cursor-pointer group rounded-2xl transform hover:-translate-y-2 hover:scale-105">
                        <div className="relative h-48 overflow-hidden">
                          <img
                            src={categoryImages[tiffin.category]}
                            alt={tiffin.title}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          />
                          
                          <div className="absolute top-3 left-3 bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-semibold shadow-lg">
                            {tiffin.serviceType === "tiffin" ? "🍱 Tiffin" : "🍛 Meal"}
                          </div>

                          {index % 3 === 0 && (
                            <div className="absolute top-3 right-3 bg-yellow-500 text-white px-3 py-1 rounded-full text-sm font-semibold shadow-lg">
                              ⭐ Premium
                            </div>
                          )}

                          <div className="absolute bottom-3 left-3">
                            <Badge className={`${
                              tiffin.category === "Veg" 
                                ? "bg-green-500 text-white" 
                                : tiffin.category === "Non-Veg"
                                ? "bg-red-500 text-white"
                                : "bg-purple-500 text-white"
                            } border-0 font-semibold shadow-lg`}>
                              {tiffin.category}
                            </Badge>
                          </div>

                          <Button
                            variant="ghost"
                            size="icon"
                            className="absolute top-3 right-3 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full shadow-lg hover:bg-white hover:scale-110 transition-all duration-300"
                          >
                            <Heart className="w-5 h-5 text-gray-600" />
                          </Button>
                        </div>

                        <div className="p-6">
                          <div className="flex items-start justify-between mb-3">
                            <h3 className="text-xl font-bold text-gray-800 line-clamp-1 group-hover:text-red-500 transition-colors">
                              {tiffin.title}
                            </h3>
                            <div className="flex items-center gap-1 bg-green-100 text-green-700 px-2 py-1 rounded-full text-sm font-semibold">
                              <Star className="w-3 h-3 fill-green-500 text-green-500" />
                              <span>{(4.4 + ((tiffin._id.charCodeAt(0) + tiffin._id.charCodeAt(tiffin._id.length - 1)) % 6 * 0.1)).toFixed(1)}</span>
                            </div>
                          </div>

                          <p className="text-gray-600 text-sm mb-4 line-clamp-2 leading-relaxed">
                            {tiffin.description}
                          </p>

                          <div className="flex items-center gap-3 mb-4">
                            <div className="w-8 h-8 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center shadow-lg">
                              <span className="text-white text-xs font-bold">T</span>
                            </div>
                            <div>
                              <div className="font-semibold text-gray-800 text-sm">
                                {tiffin.seller.shopName}
                              </div>
                              <div className="flex items-center gap-2 text-xs text-gray-500">
                                <MapPin className="w-3 h-3" />
                                {tiffin.seller.city} • 2.5 km
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                            <div className="flex items-center gap-2">
                              <div className="flex items-center gap-1 text-lg font-bold text-gray-800">
                                <IndianRupee className="w-4 h-4" />
                                <span>{tiffin.price}</span>
                              </div>
                              <div className="flex flex-col">
                                <span className="text-sm text-gray-500 line-through">
                                  <IndianRupee className="w-3 h-3 inline" />
                                  {Math.round(tiffin.price * 1.2)}
                                </span>
                                <span className="text-xs text-green-600 font-semibold">
                                  You save ₹{Math.round(tiffin.price * 0.2)}
                                </span>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-2">
                              <div className="flex items-center gap-1 text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full">
                                <Truck className="w-3 h-3" />
                                FREE
                              </div>
                              <Link href={`/tiffin/${tiffin._id}`}>
                                <Button className="bg-red-500 hover:bg-red-600 text-white px-4 rounded-full font-semibold shadow-lg shadow-red-200 hover:scale-105 transition-transform">
                                  Order Now
                                </Button>
                              </Link>
                            </div>
                          </div>
                        </div>
                      </Card>
                    </ScrollAnimation3D>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* Popular Tab */}
            <TabsContent value="popular" className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {popularTiffins.map((tiffin, index) => (
                  <ScrollAnimation3D key={tiffin._id} delay={index * 150}>
                    <Card className="overflow-hidden border-0 shadow-lg rounded-2xl group hover:shadow-xl transition-all duration-500 transform hover:-translate-y-2 hover:scale-105">
                      <div className="relative h-48 overflow-hidden">
                        <img
                          src={categoryImages[tiffin.category]}
                          alt={tiffin.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                        <div className="absolute top-3 left-3 bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-semibold shadow-lg">
                          {tiffin.serviceType === "tiffin" ? "🍱 Tiffin" : "🍛 Meal"}
                        </div>
                        <div className="absolute top-3 right-3 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-semibold shadow-lg">
                          Popular 🔥
                        </div>
                      </div>
                      <div className="p-6">
                        <h3 className="text-xl font-bold text-gray-800 mb-2">{tiffin.title}</h3>
                        <p className="text-gray-600 text-sm mb-4 line-clamp-2">{tiffin.description}</p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="flex items-center gap-1 text-lg font-bold text-gray-800">
                              <IndianRupee className="w-4 h-4" />
                              <span>{tiffin.price}</span>
                            </div>
                            <div className="flex items-center gap-1 text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                              <Star className="w-3 h-3 fill-green-500 text-green-500" />
                              4.5
                            </div>
                          </div>
                          <Link href={`/tiffin/${tiffin._id}`}>
                            <Button className="bg-red-500 hover:bg-red-600 text-white rounded-full hover:scale-105 transition-transform">
                              Order Now
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </Card>
                  </ScrollAnimation3D>
                ))}
              </div>
            </TabsContent>

<TabsContent value="top-rated" className="mt-6">
  {isLoading ? (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[...Array(6)].map((_, i) => (
        <Card key={i} className="overflow-hidden border-0 shadow-lg rounded-2xl">
          <Skeleton className="h-48 w-full rounded-2xl" />
          <div className="p-6 space-y-4">
            <Skeleton className="h-6 w-3/4 rounded" />
            <Skeleton className="h-4 w-full rounded" />
            <Skeleton className="h-4 w-2/3 rounded" />
            <div className="flex justify-between items-center pt-4">
              <Skeleton className="h-8 w-20 rounded-lg" />
              <Skeleton className="h-10 w-24 rounded-lg" />
            </div>
          </div>
        </Card>
      ))}
    </div>
  ) : (() => {
    // Debug: Check what data we have
    console.log("Top Rated Sellers:", topRatedSellers);
    console.log("All Tiffins:", filteredTiffins);
    
    // Method 1: Get top rated seller IDs
    const topRatedSellerIds = topRatedSellers.map(seller => seller._id);
    console.log("Top Rated Seller IDs:", topRatedSellerIds);
    
    // Method 2: Also check by shop name as fallback
    const topRatedShopNames = topRatedSellers.map(seller => seller.shopName.toLowerCase());
    console.log("Top Rated Shop Names:", topRatedShopNames);
    
    // Filter tiffins from top rated sellers
    const topRatedTiffins = filteredTiffins.filter(tiffin => {
      const isFromTopRatedSeller = topRatedSellerIds.includes(tiffin.seller._id);
      const isFromTopRatedShop = topRatedShopNames.includes(tiffin.seller.shopName.toLowerCase());
      
      console.log(`Tiffin: ${tiffin.title}, Seller: ${tiffin.seller.shopName}, Match: ${isFromTopRatedSeller || isFromTopRatedShop}`);
      
      return isFromTopRatedSeller || isFromTopRatedShop;
    });
    
    console.log("Final Top Rated Tiffins:", topRatedTiffins);

    return topRatedTiffins.length === 0 ? (
      <div className="text-center py-12">
        <div className="w-20 h-20 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
          <Star className="w-8 h-8 text-yellow-400" />
        </div>
        <h3 className="text-xl font-semibold text-gray-800 mb-2">No top rated items found</h3>
        <p className="text-gray-600 mb-4">
          {topRatedSellers.length > 0 
            ? "Top rated sellers found, but no matching tiffins with current filters"
            : "No top rated sellers available yet"
          }
        </p>
        
        {/* Show available top rated sellers for debugging */}
        {topRatedSellers.length > 0 && (
          <div className="mb-4 p-4 bg-yellow-50 rounded-lg">
            <h4 className="font-semibold text-gray-800 mb-2">Available Top Rated Sellers:</h4>
            <div className="flex flex-wrap gap-2 justify-center">
              {topRatedSellers.map(seller => (
                <Badge key={seller._id} className="bg-yellow-500 text-white">
                  {seller.shopName} - {seller.city}
                </Badge>
              ))}
            </div>
          </div>
        )}
        
        <Button 
          onClick={() => {
            setSearchQuery("");
            setSelectedCategory(null);
            setSelectedCity(null);
            setSelectedFoodType(null);
          }}
          className="bg-red-500 hover:bg-red-600 text-white rounded-full hover:scale-105 transition-transform"
        >
          Clear Filters
        </Button>
      </div>
    ) : (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {topRatedTiffins.map((tiffin, index) => (
          <ScrollAnimation3D key={tiffin._id} delay={index * 100}>
            <Card className="overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-500 cursor-pointer group rounded-2xl transform hover:-translate-y-2 hover:scale-105 border-2 border-yellow-200">
              <div className="relative h-48 overflow-hidden">
                <img
                  src={categoryImages[tiffin.category]}
                  alt={tiffin.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                
                {/* Top Rated Badge */}
                <div className="absolute top-3 right-3 bg-yellow-500 text-white px-3 py-1 rounded-full text-sm font-semibold shadow-lg flex items-center gap-1">
                  <Star className="w-3 h-3 fill-white" />
                  Top Rated
                </div>

                <div className="absolute top-3 left-3 bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-semibold shadow-lg">
                  {tiffin.serviceType === "tiffin" ? "🍱 Tiffin" : "🍛 Meal"}
                </div>

                {index % 3 === 0 && (
                  <div className="absolute top-12 right-3 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-semibold shadow-lg">
                    ⭐ Premium
                  </div>
                )}

                <div className="absolute bottom-3 left-3">
                  <Badge className={`${
                    tiffin.category === "Veg" 
                      ? "bg-green-500 text-white" 
                      : tiffin.category === "Non-Veg"
                      ? "bg-red-500 text-white"
                      : "bg-purple-500 text-white"
                  } border-0 font-semibold shadow-lg`}>
                    {tiffin.category}
                  </Badge>
                </div>

                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-3 right-12 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full shadow-lg hover:bg-white hover:scale-110 transition-all duration-300"
                >
                  <Heart className="w-5 h-5 text-gray-600" />
                </Button>
              </div>

              <div className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-xl font-bold text-gray-800 line-clamp-1 group-hover:text-red-500 transition-colors">
                    {tiffin.title}
                  </h3>
                  <div className="flex items-center gap-1 bg-green-100 text-green-700 px-2 py-1 rounded-full text-sm font-semibold">
                    <Star className="w-3 h-3 fill-green-500 text-green-500" />
                    <span>{(4.4 + ((tiffin._id.charCodeAt(0) + tiffin._id.charCodeAt(tiffin._id.length - 1)) % 6 * 0.1)).toFixed(1)}</span>
                  </div>
                </div>

                <p className="text-gray-600 text-sm mb-4 line-clamp-2 leading-relaxed">
                  {tiffin.description}
                </p>

                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-full flex items-center justify-center shadow-lg">
                    <span className="text-white text-xs font-bold">
                      {tiffin.seller.shopName.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <div className="font-semibold text-gray-800 text-sm flex items-center gap-2">
                      {tiffin.seller.shopName}
                      <Badge className="bg-yellow-100 text-yellow-700 border-0 text-xs">
                        Top Seller
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <MapPin className="w-3 h-3" />
                      {tiffin.seller.city} • 2.5 km
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1 text-lg font-bold text-gray-800">
                      <IndianRupee className="w-4 h-4" />
                      <span>{tiffin.price}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm text-gray-500 line-through">
                        <IndianRupee className="w-3 h-3 inline" />
                        {Math.round(tiffin.price * 1.2)}
                      </span>
                      <span className="text-xs text-green-600 font-semibold">
                        You save ₹{Math.round(tiffin.price * 0.2)}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1 text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full">
                      <Truck className="w-3 h-3" />
                      FREE
                    </div>
                    <Link href={`/tiffin/${tiffin._id}`}>
                      <Button className="bg-red-500 hover:bg-red-600 text-white px-4 rounded-full font-semibold shadow-lg shadow-red-200 hover:scale-105 transition-transform">
                        Order Now
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </Card>
          </ScrollAnimation3D>
        ))}
      </div>
    );
  })()}
</TabsContent>

            {/* Discount Tab */}
            <TabsContent value="discount" className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredTiffins.filter(tiffin => tiffin.price < 200).slice(0, 6).map((tiffin, index) => (
                  <ScrollAnimation3D key={tiffin._id} delay={index * 150}>
                    <Card className="overflow-hidden border-0 shadow-lg rounded-2xl group hover:shadow-xl transition-all duration-500 transform hover:-translate-y-2 hover:scale-105">
                      <div className="relative h-48 overflow-hidden">
                        <img
                          src={categoryImages[tiffin.category]}
                          alt={tiffin.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                        <div className="absolute top-3 left-3 bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-semibold shadow-lg">
                          {tiffin.serviceType === "tiffin" ? "🍱 Tiffin" : "🍛 Meal"}
                        </div>
                        <div className="absolute top-3 right-3 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-semibold shadow-lg">
                          Discount 🎯
                        </div>
                      </div>
                      <div className="p-6">
                        <h3 className="text-xl font-bold text-gray-800 mb-2">{tiffin.title}</h3>
                        <p className="text-gray-600 text-sm mb-4 line-clamp-2">{tiffin.description}</p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="flex items-center gap-1 text-lg font-bold text-gray-800">
                              <IndianRupee className="w-4 h-4" />
                              <span>{tiffin.price}</span>
                            </div>
                            <div className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full">
                              Save 20%
                            </div>
                          </div>
                          <Link href={`/tiffin/${tiffin._id}`}>
                            <Button className="bg-red-500 hover:bg-red-600 text-white rounded-full hover:scale-105 transition-transform">
                              Order Now
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </Card>
                  </ScrollAnimation3D>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      <AppDownloadSection />

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-red-500 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">T</span>
                </div>
                <span className="font-bold text-xl">Tiffo</span>
              </div>
              <p className="text-gray-400 text-sm mb-4 leading-relaxed">
                Delivering homemade happiness to your doorstep. Fresh, hygienic, and delicious tiffins from trusted kitchens.
              </p>
              <div className="flex gap-3">
                <Facebook className="w-5 h-5 text-gray-400 hover:text-white cursor-pointer transition-colors hover:scale-110" />
                <Twitter className="w-5 h-5 text-gray-400 hover:text-white cursor-pointer transition-colors hover:scale-110" />
                <a
  href="https://www.instagram.com/tiffo.official"
  target="_blank"
  rel="noopener noreferrer"
>
  <Instagram className="w-5 h-5 text-gray-400 hover:text-white cursor-pointer transition-colors hover:scale-110" />
</a>

              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-3">Quick Links</h3>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li className="hover:text-white cursor-pointer transition-colors hover:translate-x-1 transform"><a href="/about">About Us</a></li>
                <li className="hover:text-white cursor-pointer transition-colors hover:translate-x-1 transform"><a href="/register">Partner With Us</a></li>
                <li className="hover:text-white cursor-pointer transition-colors hover:translate-x-1 transform">
                  <a 
                    href="https://wa.me/918115067311" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-1"
                  >
                    Contact Us
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-3">Legal</h3>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li className="hover:text-white cursor-pointer transition-colors hover:translate-x-1 transform">
                  <Link href="/terms-conditions">Terms & Conditions</Link>
                </li>
                <li className="hover:text-white cursor-pointer transition-colors hover:translate-x-1 transform">
                  <Link href="/privacy-policy">Privacy Policy</Link>
                </li>
                <li className="hover:text-white cursor-pointer transition-colors hover:translate-x-1 transform">
                  <a href="/cookie-policy">Cookie Policy</a>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-3">Contact Us</h3>
              <div className="space-y-2 text-gray-400 text-sm">
                <a href="tel:+918115067311" className="flex items-center gap-2 hover:text-white transition-colors">
                  <Phone className="w-4 h-4" />
                  <span>+91 8115067311</span>
                </a>
                <a href="tel:+918115067311" className="flex items-center gap-2 hover:text-white transition-colors">
                  <Phone className="w-4 h-4" />
                  <span>+91 9670421522</span>
                </a>
                <div className="flex items-center gap-2 hover:text-white transition-colors">
                  <Mail className="w-4 h-4" />
                  <span>help@tiffo.com</span>
                </div>
                <div className="flex items-center gap-2 hover:text-white transition-colors">
                  <MapPin className="w-4 h-4" />
                  <span>Lucknow(Uttar Pradesh), India</span>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-8 pt-6 text-center text-gray-400 text-sm">
            <p>&copy; 2025 Tiffo. All rights reserved.</p>
          </div>
        </div>
      </footer>

      <style jsx>{`
        @keyframes float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
          100% { transform: translateY(0px); }
        }
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
        .backface-hidden {
          backface-visibility: hidden;
        }
        .rotate-y-180 {
          transform: rotateY(180deg);
        }
      `}</style>
    </div>
  );
}














