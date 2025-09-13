"use client"

import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  Sprout, 
  BarChart3, 
  Shield, 
  Zap, 
  Users, 
  TrendingUp,
  Check,
  Star,
  Menu,
  X,
  ArrowRight,
  Leaf,
  DollarSign,
  Calendar,
  Cloud
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ThemeToggle } from '@/components/theme-toggle';
import { useState } from 'react';

export default function Home() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 dark:from-gray-900 dark:via-gray-900 dark:to-green-900/20">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-green-200/20 bg-white/80 backdrop-blur-md dark:bg-gray-900/80 dark:border-gray-800/20">
        <div className="container mx-auto px-4 lg:px-6">
          <div className="flex h-16 items-center justify-between">
            <motion.div 
              className="flex items-center space-x-2"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Sprout className="h-8 w-8 text-primary-600" />
              <span className="text-2xl font-heading font-bold text-primary-600">FarmKeeper</span>
            </motion.div>
            
            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              <Link href="#features" className="text-sm font-medium text-gray-700 hover:text-primary-600 dark:text-gray-300 dark:hover:text-primary-400 transition-colors">
                Features
              </Link>
              <Link href="#pricing" className="text-sm font-medium text-gray-700 hover:text-primary-600 dark:text-gray-300 dark:hover:text-primary-400 transition-colors">
                Pricing
              </Link>
              <Link href="#testimonials" className="text-sm font-medium text-gray-700 hover:text-primary-600 dark:text-gray-300 dark:hover:text-primary-400 transition-colors">
                Testimonials
              </Link>
            </nav>

            <div className="flex items-center space-x-4">
              <ThemeToggle />
              <div className="hidden md:flex items-center space-x-2">
                <Button variant="outline" asChild>
                  <Link href="/auth/login">Login</Link>
                </Button>
                <Button asChild>
                  <Link href="/auth/register">Get Started</Link>
                </Button>
              </div>
              
              {/* Mobile menu button */}
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-gray-100"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <motion.div 
            className="md:hidden border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
          >
            <div className="container mx-auto px-4 py-4 space-y-4">
              <Link href="#features" className="block text-sm font-medium text-gray-700 hover:text-primary-600 dark:text-gray-300">
                Features
              </Link>
              <Link href="#pricing" className="block text-sm font-medium text-gray-700 hover:text-primary-600 dark:text-gray-300">
                Pricing
              </Link>
              <Link href="#testimonials" className="block text-sm font-medium text-gray-700 hover:text-primary-600 dark:text-gray-300">
                Testimonials
              </Link>
              <div className="flex flex-col space-y-2 pt-4 border-t border-gray-200 dark:border-gray-800">
                <Button variant="outline" asChild className="justify-start">
                  <Link href="/auth/login">Login</Link>
                </Button>
                <Button asChild className="justify-start">
                  <Link href="/auth/register">Get Started</Link>
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 lg:py-32">
        <div className="container mx-auto px-4 lg:px-6">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-8 items-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="flex flex-col justify-center space-y-8"
            >
              <div className="space-y-6">
                <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-6xl lg:text-7xl font-heading">
                  Manage Your Farm{" "}
                  <span className="text-primary-600 dark:text-primary-400">Smarter</span>
                </h1>
                <p className="text-xl text-gray-600 dark:text-gray-300 leading-relaxed">
                  Transform your farming operations with FarmKeeper's comprehensive management platform. 
                  Track livestock, monitor crops, manage finances, and optimize resources—all in one place.
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" asChild className="text-lg px-8 py-6">
                  <Link href="/auth/register">
                    Get Started
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild className="text-lg px-8 py-6">
                  <Link href="#pricing">Subscribe Now</Link>
                </Button>
              </div>

              <div className="flex items-center space-x-8 text-sm text-gray-600 dark:text-gray-400">
                <div className="flex items-center space-x-2">
                  <Check className="h-5 w-5 text-primary-600" />
                  <span>Free 14-day trial</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Check className="h-5 w-5 text-primary-600" />
                  <span>No credit card required</span>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative"
            >
              <div className="relative mx-auto aspect-square max-w-lg">
                <div className="absolute inset-0 bg-gradient-to-r from-primary-400 to-emerald-400 rounded-3xl rotate-6 opacity-20"></div>
                <div className="relative bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-8 border border-gray-200 dark:border-gray-700">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-primary-50 dark:bg-primary-900/20 rounded-xl p-4 flex flex-col items-center">
                      <Sprout className="h-8 w-8 text-primary-600 mb-2" />
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Crop Management</span>
                    </div>
                    <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-xl p-4 flex flex-col items-center">
                      <BarChart3 className="h-8 w-8 text-emerald-600 mb-2" />
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Analytics</span>
                    </div>
                    <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 flex flex-col items-center">
                      <DollarSign className="h-8 w-8 text-blue-600 mb-2" />
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Finance Tracking</span>
                    </div>
                    <div className="bg-amber-50 dark:bg-amber-900/20 rounded-xl p-4 flex flex-col items-center">
                      <Cloud className="h-8 w-8 text-amber-600 mb-2" />
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Weather Data</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 lg:py-32 bg-gray-50 dark:bg-gray-900/50">
        <div className="container mx-auto px-4 lg:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl lg:text-5xl font-heading mb-4">
              Everything You Need to{" "}
              <span className="text-primary-600 dark:text-primary-400">Succeed</span>
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Comprehensive farm management tools designed specifically for modern farmers
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: Leaf,
                title: "Smart Record Management",
                description: "Keep detailed records of all farming operations, from planting to harvest, with automated tracking and insights.",
                color: "text-green-600"
              },
              {
                icon: DollarSign,
                title: "Financial Intelligence",
                description: "Track expenses, revenue, and profitability with real-time financial analytics and forecasting tools.",
                color: "text-blue-600"
              },
              {
                icon: Users,
                title: "Resource Optimization",
                description: "Manage labor, equipment, and materials efficiently with scheduling and allocation tools.",
                color: "text-purple-600"
              },
              {
                icon: BarChart3,
                title: "Advanced Analytics",
                description: "Make data-driven decisions with comprehensive reporting and predictive analytics.",
                color: "text-emerald-600"
              },
              {
                icon: Calendar,
                title: "Smart Scheduling",
                description: "Plan and track farming activities with intelligent scheduling and reminder systems.",
                color: "text-orange-600"
              },
              {
                icon: Cloud,
                title: "Weather Integration",
                description: "Get accurate weather forecasts and alerts to optimize your farming operations.",
                color: "text-sky-600"
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="h-full hover:shadow-lg transition-shadow duration-300">
                  <CardHeader>
                    <feature.icon className={`h-12 w-12 ${feature.color} mb-4`} />
                    <CardTitle className="text-xl">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-base leading-relaxed">
                      {feature.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 lg:py-32">
        <div className="container mx-auto px-4 lg:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl lg:text-5xl font-heading mb-4">
              Choose Your{" "}
              <span className="text-primary-600 dark:text-primary-400">Perfect Plan</span>
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Start with our free trial and scale as your farm grows
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {[
              {
                name: "Free Trial",
                price: "Free",
                period: "14 days",
                description: "Perfect for getting started",
                features: [
                  "Up to 25 livestock records",
                  "Basic financial tracking",
                  "1 user account",
                  "Mobile & web access",
                  "Email support"
                ],
                cta: "Start Free Trial",
                popular: false,
                href: "/auth/register?plan=trial"
              },
              {
                name: "Pro",
                price: "UGX 75,000",
                period: "/month",
                description: "Best for growing farms",
                features: [
                  "Unlimited livestock records",
                  "Advanced financial analytics",
                  "Up to 5 user accounts",
                  "Weather integration",
                  "Priority support",
                  "Data export & backup"
                ],
                cta: "Get Started",
                popular: true,
                href: "/auth/register?plan=pro"
              },
              {
                name: "Enterprise",
                price: "UGX 150,000",
                period: "/month",
                description: "For large-scale operations",
                features: [
                  "Everything in Pro",
                  "Unlimited user accounts",
                  "Custom integrations",
                  "Advanced reporting",
                  "Dedicated support",
                  "Training & onboarding"
                ],
                cta: "Contact Sales",
                popular: false,
                href: "/contact?plan=enterprise"
              }
            ].map((plan, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className={`relative ${plan.popular ? 'scale-105' : ''}`}
              >
                <Card className={`h-full ${plan.popular ? 'border-primary-500 shadow-xl' : ''}`}>
                  {plan.popular && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                      <span className="bg-primary-600 text-white px-4 py-1 rounded-full text-sm font-medium">
                        Most Popular
                      </span>
                    </div>
                  )}
                  
                  <CardHeader className="text-center pb-8">
                    <CardTitle className="text-2xl font-bold">{plan.name}</CardTitle>
                    <div className="mt-4">
                      <span className="text-4xl font-bold text-gray-900 dark:text-white">
                        {plan.price}
                      </span>
                      <span className="text-gray-500 dark:text-gray-400">{plan.period}</span>
                    </div>
                    <CardDescription className="mt-2 text-base">
                      {plan.description}
                    </CardDescription>
                  </CardHeader>
                  
                  <CardContent className="space-y-6">
                    <ul className="space-y-3">
                      {plan.features.map((feature, featureIndex) => (
                        <li key={featureIndex} className="flex items-center">
                          <Check className="h-5 w-5 text-primary-600 mr-3 flex-shrink-0" />
                          <span className="text-gray-700 dark:text-gray-300">{feature}</span>
                        </li>
                      ))}
                    </ul>
                    
                    <Button 
                      asChild 
                      className={`w-full ${plan.popular ? 'bg-primary-600 hover:bg-primary-700' : ''}`}
                      variant={plan.popular ? 'default' : 'outline'}
                    >
                      <Link href={plan.href}>{plan.cta}</Link>
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-20 lg:py-32 bg-gray-50 dark:bg-gray-900/50">
        <div className="container mx-auto px-4 lg:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl lg:text-5xl font-heading mb-4">
              Trusted by{" "}
              <span className="text-primary-600 dark:text-primary-400">Farmers Everywhere</span>
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              See how FarmKeeper is transforming agricultural operations across Uganda
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                name: "Sarah Nakato",
                role: "Poultry Farmer, Kampala",
                content: "FarmKeeper has revolutionized how I manage my poultry farm. The financial tracking alone has helped me increase profits by 30% in just 6 months.",
                rating: 5
              },
              {
                name: "James Okello",
                role: "Mixed Farmer, Gulu",
                content: "The weather integration feature is incredible. I can now plan my planting and harvesting perfectly, which has significantly reduced my losses.",
                rating: 5
              },
              {
                name: "Mary Atuhaire",
                role: "Dairy Farmer, Mbarara",
                content: "Managing 200+ cattle was overwhelming until I found FarmKeeper. Now everything is organized and I can make data-driven decisions easily.",
                rating: 5
              },
              {
                name: "David Ssemakula",
                role: "Crop Farmer, Masaka",
                content: "The analytics dashboard gives me insights I never had before. I can see exactly which crops are most profitable and optimize accordingly.",
                rating: 5
              },
              {
                name: "Grace Apio",
                role: "Organic Farmer, Lira",
                content: "Customer support is amazing and the mobile app works perfectly even in remote areas. FarmKeeper truly understands farmers' needs.",
                rating: 5
              },
              {
                name: "Peter Wanyama",
                role: "Commercial Farmer, Jinja",
                content: "Switched from spreadsheets to FarmKeeper and never looked back. The time saved on record-keeping allows me to focus on growing my business.",
                rating: 5
              }
            ].map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="h-full">
                  <CardContent className="p-6">
                    <div className="flex mb-4">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                      ))}
                    </div>
                    <blockquote className="text-gray-700 dark:text-gray-300 mb-4 leading-relaxed">
                      "{testimonial.content}"
                    </blockquote>
                    <div className="border-t pt-4">
                      <div className="font-semibold text-gray-900 dark:text-white">
                        {testimonial.name}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {testimonial.role}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 lg:py-32 bg-primary-600 dark:bg-primary-700">
        <div className="container mx-auto px-4 lg:px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto"
          >
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl font-heading mb-6">
              Ready to Transform Your Farm?
            </h2>
            <p className="text-xl text-primary-100 mb-8 leading-relaxed">
              Join thousands of farmers who are already using FarmKeeper to optimize their operations and increase profitability.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" variant="secondary" asChild className="text-lg px-8 py-6">
                <Link href="/auth/register">
                  Start Your Free Trial
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="text-lg px-8 py-6 border-white text-white hover:bg-white hover:text-primary-600">
                <Link href="#pricing">View Pricing</Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 dark:bg-gray-950 text-white">
        <div className="container mx-auto px-4 lg:px-6 py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="lg:col-span-1">
              <div className="flex items-center space-x-2 mb-4">
                <Sprout className="h-8 w-8 text-primary-400" />
                <span className="text-2xl font-heading font-bold text-white">FarmKeeper</span>
              </div>
              <p className="text-gray-400 mb-6 leading-relaxed">
                Empowering farmers with smart technology to optimize operations, increase productivity, and build sustainable agricultural businesses.
              </p>
              <div className="flex space-x-4">
                <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white">
                  <span className="sr-only">Facebook</span>
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </Button>
                <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white">
                  <span className="sr-only">Twitter</span>
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                  </svg>
                </Button>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold text-white mb-4">Product</h4>
              <ul className="space-y-3 text-gray-400">
                <li><Link href="#features" className="hover:text-white transition-colors">Features</Link></li>
                <li><Link href="#pricing" className="hover:text-white transition-colors">Pricing</Link></li>
                <li><Link href="/auth/register" className="hover:text-white transition-colors">Free Trial</Link></li>
                <li><Link href="/demo" className="hover:text-white transition-colors">Request Demo</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-white mb-4">Company</h4>
              <ul className="space-y-3 text-gray-400">
                <li><Link href="/about" className="hover:text-white transition-colors">About Us</Link></li>
                <li><Link href="/contact" className="hover:text-white transition-colors">Contact</Link></li>
                <li><Link href="/careers" className="hover:text-white transition-colors">Careers</Link></li>
                <li><Link href="/blog" className="hover:text-white transition-colors">Blog</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-white mb-4">Support</h4>
              <ul className="space-y-3 text-gray-400">
                <li><Link href="/help" className="hover:text-white transition-colors">Help Center</Link></li>
                <li><Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
                <li><Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link></li>
                <li>
                  <a href="mailto:support@farmkeeper.com" className="hover:text-white transition-colors">
                    support@farmkeeper.com
                  </a>
                </li>
                <li>
                  <a href="tel:+256700123456" className="hover:text-white transition-colors">
                    +256 700 123456
                  </a>
                </li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">
              &copy; {new Date().getFullYear()} FarmKeeper. All rights reserved.
            </p>
            <div className="flex items-center space-x-6 mt-4 md:mt-0">
              <span className="text-gray-400 text-sm">Made with ❤️ for farmers in Uganda</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
