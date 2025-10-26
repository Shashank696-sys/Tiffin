import { useState, useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Users, 
  Award, 
  Target,
  Heart,
  Star,
  Clock,
  Shield,
  Zap,
  ArrowLeft,
  Phone,
  Mail,
  MapPin,
  Github,
  Linkedin,
  Twitter,
  BarChart3,
  CheckCircle,
  Rocket,
  Brain,
  GitBranch,
  Server,
  Smartphone,
  Globe,
  Truck,
  Utensils,
  Home,
  Bike,
  Instagram,
  Salad
} from "lucide-react";
import { Link } from "wouter";

// Scroll Animation Component
const ScrollAnimation = ({ children, delay = 0, className = "" }: { children: React.ReactNode; delay?: number; className?: string }) => {
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
          ? "translate-y-0 opacity-100"
          : "translate-y-8 opacity-0"
      } ${className}`}
    >
      {children}
    </div>
  );
};

// Team Member Card - Red & White Theme
const TeamMemberCard = ({ member, index }: { member: any; index: number }) => {
  return (
    <ScrollAnimation delay={index * 200}>
      <Card className="bg-white border-2 border-red-100 shadow-xl rounded-2xl overflow-hidden hover:shadow-2xl transition-all duration-500 group hover:-translate-y-3">
        <div className="p-6 text-center relative">
          {/* Background Pattern */}
          <div className="absolute top-0 right-0 w-24 h-24 bg-red-50 rounded-full -translate-y-12 translate-x-12 opacity-50"></div>
          
          {/* Profile Image */}
          <div className="relative mx-auto mb-4 z-10">
            <div className="w-28 h-28 rounded-full bg-gradient-to-r from-red-500 to-red-600 p-1.5 mx-auto shadow-2xl group-hover:from-red-600 group-hover:to-red-700 transition-all duration-300">
              <img
                src={member.image}
                alt={member.name}
                className="w-full h-full rounded-full object-cover border-3 border-white shadow-inner"
              />
            </div>
            <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-gradient-to-r from-green-500 to-green-600 rounded-full border-3 border-white flex items-center justify-center shadow-lg">
              <Zap className="w-3 h-3 text-white" />
            </div>
          </div>

          {/* Name & Role */}
          <h3 className="text-2xl font-bold text-gray-900 mb-2 relative z-10">{member.name}</h3>
          <div className="mb-3 relative z-10">
            <span className="bg-gradient-to-r from-red-500 to-red-600 text-white text-sm font-semibold px-4 py-1.5 rounded-full inline-block mb-2 shadow-lg">
              {member.role}
            </span>
            <p className="text-red-400 font-medium text-sm">{member.subRole}</p>
          </div>

          {/* Description */}
          <p className="text-gray-700 text-sm leading-relaxed mb-6 relative z-10 bg-red-50 p-4 rounded-xl border border-red-100">
            {member.description}
          </p>

          {/* Key Responsibilities */}
          <div className="mb-6 relative z-10">
            <h4 className="text-sm font-semibold text-gray-800 mb-3 flex items-center justify-center gap-2">
              <Target className="w-4 h-4 text-red-500" />
              Key Contributions
            </h4>
            <div className="space-y-2">
              {member.responsibilities.map((resp: string, i: number) => (
                <div key={i} className="flex items-center gap-2 text-sm text-gray-600">
                  <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                  <span>{resp}</span>
                </div>
              ))}
            </div>
          </div>
          
          {/* Social Links */}
          <div className="flex justify-center gap-3 relative z-10">
            {member.socials.map((social: any, i: number) => (
              <a
                key={i}
                href={social.url}
                className="w-10 h-10 bg-white hover:bg-red-500 text-gray-600 hover:text-white rounded-full flex items-center justify-center transition-all duration-300 border-2 border-red-200 hover:border-red-500 shadow-sm hover:shadow-lg transform hover:scale-110"
              >
                <social.icon className="w-4 h-4" />
              </a>
            ))}
          </div>
        </div>
      </Card>
    </ScrollAnimation>
  );
};

export default function About() {
  // Team Members Data - Original Details
  const teamMembers = [
    {
      name: "Shashank Pandey",
      role: "Co-Founder & Tech Lead",
      subRole: "Platform Architect & Business Strategist",
      image: "https://image2url.com/images/1761493174895-96410492-2048-4afe-ae3e-da4dd6a505c9.png",
      description: "Handling seller verification & overall execution of Tiffo platform. Building with modern web technologies and managing complete technical operations. Driving growth through technical innovation and robust system design.",
      responsibilities: [
        "Seller Verification & Onboarding",
        "Full Platform Execution & Development", 
        "Technical Team Leadership & Execution",
        "Business Strategy & Growth Planning",
        "System Architecture & Scalability"
      ],
      socials: [
  { icon: Linkedin, url: "https://linkedin.com/in/abhayrajput" },
  { icon: Instagram, url: "https://www.instagram.com/shashank__0001__?igsh=MXN5eGs2cjludWV5cA==" }
]
    },
    {
      name: "Abhay Rajput", 
      role: "Co-Founder & Marketing Lead",
      subRole: "Growth Specialist & Business Strategist",
      image: "https://image2url.com/images/1761493210429-f913fe4b-935e-43c4-acfc-b9238c9044fe.jpg",
      description: "Conducting market research and analysis to drive Tiffo's business strategy. Identifying growth opportunities and customer insights. Expert in market research, growth strategies, and expanding platform reach.",
      responsibilities: [
        "Market Research & Competitive Analysis",
        "Customer Acquisition & Retention Strategies", 
        "Brand Positioning & Digital Marketing",
        "Business Development & Partnerships",
        "Business Strategy & Growth Planning"
      ],
      socials: [
  { icon: Linkedin, url: "https://in.linkedin.com/in/abhay-rajput-b723ba2b5?trk=profile-badge" },
  { icon: Instagram, url: "https://www.instagram.com/abhay_x_rajput07?igsh=bTBicXNoNjZsOHM1" }
]
    }
  ];

  // Company Stats - Red Theme
  const companyStats = [
    { icon: Users, value: "50K+", label: "Happy Customers", color: "from-red-500 to-orange-500" },
    { icon: Star, value: "4.8★", label: "Customer Rating", color: "from-yellow-500 to-orange-500" },
    { icon: MapPin, value: "4+", label: "Cities", color: "from-green-500 to-teal-500" },
    { icon: Shield, value: "1K+", label: "Verified Sellers", color: "from-blue-500 to-purple-500" },
    { icon: Rocket, value: "200%", label: "Growth", color: "from-purple-500 to-pink-500" },
    { icon: Award, value: "99%", label: "Satisfaction", color: "from-indigo-500 to-blue-500" }
  ];

  // Founder Collaboration Section
  const collaborationPoints = [
    {
      icon: Brain,
      title: "Strategic Planning", 
      description: "Both founders collaborate on business strategy, market positioning, and long-term vision for Tiffo.",
      color: "from-purple-500 to-pink-500"
    },
    {
      icon: GitBranch,
      title: "Idea Execution",
      description: "Shashank transforms business ideas into technical reality while Abhay ensures market fit and customer adoption.",
      color: "from-blue-500 to-cyan-500" 
    },
    {
      icon: Rocket,
      title: "Growth Partnership",
      description: "Working together on growth metrics, user acquisition, and platform scalability to drive business success.",
      color: "from-green-500 to-teal-500"
    }
  ];

  // Features - Red Theme
  const features = [
    {
      icon: Shield,
      title: "Verified Home Chefs",
      description: "Every chef is personally verified for quality and hygiene standards"
    },
    {
      icon: Truck, 
      title: "Quick Delivery",
      description: "Fresh meals delivered within 30-45 minutes"
    },
    {
      icon: Utensils,
      title: "Homemade Taste", 
      description: "Authentic homemade flavors you won't find in restaurants"
    },
    {
      icon: Salad,
      title: "Fresh Ingredients",
      description: "Daily fresh ingredients for every meal"
    }
  ];

  // Current Cities - Updated to LKO, Kanpur, Unnao, Nawabganj
  const currentCities = [
    { name: "Lucknow", chefs: "25+", color: "bg-red-100 text-red-600" },
    { name: "Kanpur", chefs: "15+", color: "bg-orange-100 text-orange-600" },
    { name: "Unnao", chefs: "10+", color: "bg-green-100 text-green-600" },
    { name: "Nawabganj", chefs: "8+", color: "bg-blue-100 text-blue-600" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50">
      {/* Header - Not Sticky */}
      <div className="bg-white/80 backdrop-blur-md shadow-lg border-b border-red-100">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link href="/">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="text-gray-600 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all duration-300"
                >
                  <ArrowLeft className="w-5 h-5" />
                </Button>
              </Link>
              <div className="w-12 h-12 bg-gradient-to-r from-red-500 to-orange-500 rounded-xl flex items-center justify-center shadow-lg hover:shadow-xl transition-shadow duration-300">
                <span className="text-white font-bold text-xl">T</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800 bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent">
                  About Tiffo
                </h1>
                <p className="text-gray-500 text-sm">Meet the visionary founders behind your favorite tiffins</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Hero Section - Red Theme */}
      <section className="relative bg-gradient-to-br from-red-500 via-red-600 to-orange-500 py-20 text-white overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-32 h-32 bg-white rounded-full"></div>
          <div className="absolute bottom-10 right-10 w-24 h-24 bg-white rounded-full"></div>
          <div className="absolute top-1/2 left-1/4 w-16 h-16 bg-white rounded-full"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 text-center relative z-10">
          <ScrollAnimation>
            <h1 className="text-5xl lg:text-6xl font-bold mb-6 drop-shadow-2xl leading-tight">
              Delivering Happiness,
              <span className="block text-red-100">One Tiffin at a Time</span>
            </h1>
          </ScrollAnimation>
          <ScrollAnimation delay={200}>
            <p className="text-xl text-red-100 mb-12 max-w-3xl mx-auto leading-relaxed font-light">
              We're passionate foodies and tech enthusiasts on a mission to connect homemade kitchens with hungry food lovers across India.
            </p>
          </ScrollAnimation>
          <ScrollAnimation delay={400}>
            <div className="grid grid-cols-2 lg:grid-cols-6 gap-6 mt-12">
              {companyStats.map((stat, index) => (
                <div key={index} className="text-center transform hover:scale-110 transition-transform duration-500">
                  <div className={`w-16 h-16 ${stat.color} rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg`}>
                    <stat.icon className="w-7 h-7 text-white" />
                  </div>
                  <div className="text-2xl font-bold drop-shadow-lg">{stat.value}</div>
                  <div className="text-red-100 text-sm font-medium">{stat.label}</div>
                </div>
              ))}
            </div>
          </ScrollAnimation>
        </div>
      </section>

      {/* Founder Collaboration Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <ScrollAnimation>
            <div className="text-center mb-12">
              <div className="w-20 h-1 bg-gradient-to-r from-red-500 to-orange-500 mx-auto mb-6 rounded-full"></div>
              <h2 className="text-3xl font-bold text-gray-800 mb-4">Strategic Partnership</h2>
              <p className="text-gray-600 text-lg max-w-2xl mx-auto">
                How our founders work together to drive Tiffo's success
              </p>
            </div>
          </ScrollAnimation>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {collaborationPoints.map((point, index) => (
              <ScrollAnimation key={index} delay={index * 150}>
                <Card className="bg-white border-2 border-red-50 shadow-lg rounded-2xl p-6 text-center hover:shadow-xl transition-all duration-300 group">
                  <div className={`w-14 h-14 bg-gradient-to-r ${point.color} rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300`}>
                    <point.icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 mb-3">{point.title}</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">{point.description}</p>
                </Card>
              </ScrollAnimation>
            ))}
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20 bg-gradient-to-br from-red-50 to-orange-50">
        <div className="max-w-7xl mx-auto px-4">
          <ScrollAnimation>
            <div className="text-center mb-16">
              <div className="w-20 h-1 bg-gradient-to-r from-red-500 to-orange-500 mx-auto mb-6 rounded-full"></div>
              <h2 className="text-4xl font-bold text-gray-800 mb-6">Our Mission</h2>
              <p className="text-gray-600 text-lg max-w-3xl mx-auto leading-relaxed">
                To revolutionize the way India eats by bringing authentic homemade food to every doorstep, 
                while empowering local home chefs to showcase their culinary talents and build sustainable businesses.
              </p>
            </div>
          </ScrollAnimation>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: Heart,
                title: "Passion for Food",
                description: "We believe every homemade meal tells a story and brings people together with authentic flavors and love.",
                color: "from-red-500 to-pink-500"
              },
              {
                icon: Shield,
                title: "Trust & Safety", 
                description: "Every kitchen is thoroughly verified and every meal is quality-checked for your complete safety and satisfaction.",
                color: "from-green-500 to-teal-500"
              },
              {
                icon: Zap,
                title: "Fast & Reliable",
                description: "Fresh meals delivered hot and fast, right when you need them with our optimized delivery network.",
                color: "from-orange-500 to-red-500"
              }
            ].map((item, index) => (
              <ScrollAnimation key={index} delay={index * 150}>
                <Card className="bg-white border-2 border-red-50 shadow-xl rounded-2xl p-8 text-center hover:shadow-2xl transition-all duration-500 group hover:border-red-200">
                  <div className={`w-16 h-16 bg-gradient-to-r ${item.color} rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                    <item.icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-4">{item.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{item.description}</p>
                </Card>
              </ScrollAnimation>
            ))}
          </div>
        </div>
      </section>

      {/* Current Cities Section - Updated */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <ScrollAnimation>
            <div className="text-center mb-12">
              <div className="w-20 h-1 bg-gradient-to-r from-red-500 to-orange-500 mx-auto mb-6 rounded-full"></div>
              <h2 className="text-3xl font-bold text-gray-800 mb-4">Currently Serving</h2>
              <p className="text-gray-600 text-lg">We've started with quality-focused expansion in Uttar Pradesh</p>
            </div>
          </ScrollAnimation>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            {currentCities.map((city, index) => (
              <ScrollAnimation key={index} delay={index * 100}>
                <Card className="bg-white border-2 border-red-100 rounded-2xl p-6 text-center hover:shadow-lg transition-all duration-300">
                  <div className="text-xl font-bold text-gray-800 mb-2">{city.name}</div>
                  <div className={`text-sm px-4 py-2 rounded-full ${city.color} font-medium inline-block`}>
                    {city.chefs} home chefs
                  </div>
                </Card>
              </ScrollAnimation>
            ))}
          </div>

          <ScrollAnimation delay={300}>
            <div className="text-center mt-8">
              <p className="text-gray-500 text-sm">
                🚀 <strong>More cities coming soon!</strong> We believe in sustainable growth
              </p>
            </div>
          </ScrollAnimation>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="py-16 bg-red-50">
        <div className="max-w-7xl mx-auto px-4">
          <ScrollAnimation>
            <div className="text-center mb-12">
              <div className="w-20 h-1 bg-gradient-to-r from-red-500 to-orange-500 mx-auto mb-6 rounded-full"></div>
              <h2 className="text-3xl font-bold text-gray-800 mb-4">Why Food Lovers Choose Tiffo</h2>
              <p className="text-gray-600 text-lg">The homemade difference that sets us apart</p>
            </div>
          </ScrollAnimation>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <ScrollAnimation key={index} delay={index * 150}>
                <Card className="bg-white border-2 border-red-100 rounded-2xl p-6 text-center hover:shadow-xl transition-all duration-300 group">
                  <div className="w-14 h-14 bg-red-500 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                    <feature.icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 mb-3">{feature.title}</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">{feature.description}</p>
                </Card>
              </ScrollAnimation>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <ScrollAnimation>
            <div className="text-center mb-16">
              <div className="w-20 h-1 bg-gradient-to-r from-red-500 to-orange-500 mx-auto mb-6 rounded-full"></div>
              <h2 className="text-4xl font-bold text-gray-800 mb-4">Meet Our Team</h2>
              <p className="text-gray-600 text-lg max-w-2xl mx-auto">
                The passionate individuals working behind the scenes to make Tiffo amazing
              </p>
            </div>
          </ScrollAnimation>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
            {teamMembers.map((member, index) => (
              <TeamMemberCard key={member.name} member={member} index={index} />
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <ScrollAnimation>
            <div className="text-center mb-16">
              <div className="w-20 h-1 bg-gradient-to-r from-red-500 to-orange-500 mx-auto mb-6 rounded-full"></div>
              <h2 className="text-4xl font-bold text-gray-800 mb-4">Get In Touch</h2>
              <p className="text-gray-600 text-lg">
                Have questions or suggestions? We'd love to hear from you
              </p>
            </div>
          </ScrollAnimation>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              {
                icon: Phone,
                title: "Call Us",
                detail: "+91 8115067311",
                description: "Mon-Sun, 8AM-10PM",
                color: "from-green-500 to-teal-500"
              },
              {
                icon: Mail,
                title: "Email Us", 
                detail: "shashank@tiffo.com",
                description: "We reply within 24 hours",
                color: "from-blue-500 to-purple-500"
              },
              {
                icon: MapPin,
                title: "Visit Us",
                detail: "Lucknow, India", 
                description: "Come say hello!",
                color: "from-orange-500 to-red-500"
              }
            ].map((item, index) => (
              <ScrollAnimation key={index} delay={index * 100}>
                <Card className="bg-white border-2 border-red-50 shadow-xl rounded-2xl p-8 text-center hover:shadow-2xl transition-all duration-500 group hover:border-red-200">
                  <div className={`w-16 h-16 bg-gradient-to-r ${item.color} rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                    <item.icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 mb-3">{item.title}</h3>
                  <p className="text-red-500 font-semibold text-lg mb-2">{item.detail}</p>
                  <p className="text-gray-500 text-sm">{item.description}</p>
                </Card>
              </ScrollAnimation>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gradient-to-r from-gray-900 to-gray-800 text-white py-16 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-0 left-0 w-32 h-32 bg-red-500 rounded-full"></div>
          <div className="absolute bottom-0 right-0 w-24 h-24 bg-orange-500 rounded-full"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 text-center relative z-10">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="w-12 h-12 bg-gradient-to-r from-red-500 to-orange-500 rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-xl">T</span>
            </div>
            <span className="font-bold text-2xl bg-gradient-to-r from-red-400 to-orange-400 bg-clip-text text-transparent">
              Tiffo
            </span>
          </div>
          <p className="text-gray-400 text-lg mb-6 max-w-md mx-auto leading-relaxed">
            Delivering homemade happiness to your doorstep
          </p>
          <div className="flex justify-center gap-6 mb-8">
            {[Github, Linkedin, Twitter, Mail].map((Icon, index) => (
              <a
                key={index}
                href="#"
                className="w-10 h-10 bg-gray-700 hover:bg-red-500 text-gray-300 hover:text-white rounded-lg flex items-center justify-center transition-all duration-300 hover:scale-110"
              >
                <Icon className="w-4 h-4" />
              </a>
            ))}
          </div>
          <p className="text-gray-500 text-sm">
            &copy; 2025 Tiffo. All rights reserved. | Made with ❤️ in India
          </p>
        </div>
      </footer>
    </div>
  );
}