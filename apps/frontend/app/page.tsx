"use client";

import { useState, useEffect } from 'react';
import {
  Heart,
  Users,
  FileText,
  Shield,
  Clock,
  Smartphone,
  UserCheck,
  Stethoscope,
  ChevronRight,
  Menu,
  X,
  Star,
  CheckCircle,
  Sparkles,
  Activity
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import { useRouter } from 'next/navigation';

export default function Home() {
  const features = [
    {
      icon: <FileText className="w-8 h-8 text-blue-400" />,
      title: "Digital Prescriptions",
      description: "Doctors can create and manage digital prescriptions securely, eliminating paper-based errors.",
      gradient: "from-blue-400 to-cyan-400"
    },
    {
      icon: <Shield className="w-8 h-8 text-emerald-400" />,
      title: "Secure Document Storage",
      description: "All medical documents are encrypted and stored safely with HIPAA-compliant security measures.",
      gradient: "from-emerald-400 to-teal-400"
    },
    {
      icon: <Clock className="w-8 h-8 text-purple-400" />,
      title: "Real-time Access",
      description: "Patients can access their prescriptions and medical records instantly, anytime, anywhere.",
      gradient: "from-purple-400 to-pink-400"
    },
    {
      icon: <Smartphone className="w-8 h-8 text-orange-400" />,
      title: "Mobile Friendly",
      description: "Access your medical information on any device with our responsive mobile platform.",
      gradient: "from-orange-400 to-red-400"
    }
  ];

  const benefits = [
    {
      category: "For Doctors",
      icon: <Stethoscope className="w-6 h-6 text-blue-400" />,
      items: [
        "Streamlined prescription management",
        "Reduced administrative burden",
        "Better patient communication",
        "Secure document sharing"
      ],
      gradient: "from-blue-500/20 to-cyan-500/20"
    },
    {
      category: "For Patients",
      icon: <UserCheck className="w-6 h-6 text-emerald-400" />,
      items: [
        "Instant access to prescriptions",
        "Organized medical history",
        "Easy document sharing",
        "Improved healthcare coordination"
      ],
      gradient: "from-emerald-500/20 to-teal-500/20"
    }
  ];

  const steps = [
    {
      number: "01",
      title: "Register & Verify",
      description: "Create your account and verify your identity with our secure registration process.",
      gradient: "from-blue-500 to-cyan-500"
    },
    {
      number: "02",
      title: "Connect with Healthcare",
      description: "Link with your healthcare providers and start receiving digital prescriptions.",
      gradient: "from-purple-500 to-pink-500"
    },
    {
      number: "03",
      title: "Manage & Access",
      description: "Access all your medical documents and prescriptions from one centralized platform.",
      gradient: "from-emerald-500 to-teal-500"
    }
  ];

  const router = useRouter();
  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 dark:from-slate-900 dark:via-purple-900 dark:to-slate-900 light:from-blue-50 light:via-indigo-50 light:to-purple-50 relative overflow-hidden transition-all duration-500">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-r from-blue-400/30 to-purple-600/30 dark:from-blue-400/30 dark:to-purple-600/30 light:from-blue-400/20 light:to-purple-600/20 rounded-full mix-blend-multiply filter blur-xl animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-r from-pink-400/30 to-red-600/30 dark:from-pink-400/30 dark:to-red-600/30 light:from-pink-400/20 light:to-red-600/20 rounded-full mix-blend-multiply filter blur-xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-gradient-to-r from-green-400/20 to-blue-600/20 dark:from-green-400/20 dark:to-blue-600/20 light:from-green-400/15 light:to-blue-600/15 rounded-full mix-blend-multiply filter blur-xl animate-pulse delay-500"></div>
        </div>



        {/* Hero Section */}
        <section className="relative pt-20 pb-16 min-h-screen flex items-center">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="text-center">
              <div className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-blue-500/20 to-purple-500/20 dark:from-blue-500/20 dark:to-purple-500/20 light:from-blue-500/10 light:to-purple-500/10 backdrop-blur-sm border border-white/20 dark:border-white/20 light:border-gray-200/30 mb-8">
                <Sparkles className="w-4 h-4 text-blue-400 mr-2" />
                <span className="text-white/90 dark:text-white/90 light:text-gray-700 text-sm font-medium">Revolutionary Healthcare Platform</span>
              </div>

              <h1 className="text-4xl md:text-7xl font-bold text-white dark:text-white light:text-gray-900 mb-6 leading-tight">
                Connecting Healthcare,
                <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent block">
                  Empowering Patients
                </span>
              </h1>

              <p className="text-xl text-white/80 dark:text-white/80 light:text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
                Revolutionary platform bridging doctors and patients with secure digital prescriptions,
                seamless document management, and instant access to medical records.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button className="group bg-gradient-to-r from-blue-500 to-purple-600 text-white px-8 py-4 rounded-xl text-lg font-medium hover:from-blue-600 hover:to-purple-700 transition-all transform hover:scale-105 shadow-2xl backdrop-blur-sm" onClick={() => router.push('/dashboard/doctor')}>
                  <span className="flex items-center">
                    Start Your Journey
                    <ChevronRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                  </span>
                </button>
                <button className="backdrop-blur-sm bg-white/10 dark:bg-white/10 light:bg-white/50 border border-white/20 dark:border-white/20 light:border-gray-200/30 text-white dark:text-white light:text-gray-700 px-8 py-4 rounded-xl text-lg font-medium hover:bg-white/20 dark:hover:bg-white/20 light:hover:bg-white/70 transition-all transform hover:scale-105">
                  Learn More
                </button>
              </div>
            </div>
          </div>

          {/* Floating Glass Cards */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-1/4 left-10 backdrop-blur-md bg-white/10 dark:bg-white/10 light:bg-white/60 p-4 rounded-xl border border-white/20 dark:border-white/20 light:border-gray-200/30 shadow-2xl animate-float">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium text-white dark:text-white light:text-gray-700">Prescription Ready</span>
              </div>
            </div>
            <div className="absolute top-1/3 right-10 backdrop-blur-md bg-white/10 dark:bg-white/10 light:bg-white/60 p-4 rounded-xl border border-white/20 dark:border-white/20 light:border-gray-200/30 shadow-2xl animate-float delay-1000">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-gradient-to-r from-blue-400 to-cyan-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium text-white dark:text-white light:text-gray-700">Document Secured</span>
              </div>
            </div>
            <div className="absolute bottom-1/4 left-1/2 transform -translate-x-1/2 backdrop-blur-md bg-white/10 dark:bg-white/10 light:bg-white/60 p-4 rounded-xl border border-white/20 dark:border-white/20 light:border-gray-200/30 shadow-2xl animate-float delay-500">
              <div className="flex items-center space-x-2">
                <Activity className="w-4 h-4 text-purple-400" />
                <span className="text-sm font-medium text-white dark:text-white light:text-gray-700">Real-time Sync</span>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-16 relative">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-5xl font-bold text-white dark:text-white light:text-gray-900 mb-4">
                Powerful Features for
                <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent"> Modern Healthcare</span>
              </h2>
              <p className="text-lg text-white/70 dark:text-white/70 light:text-gray-600 max-w-2xl mx-auto">
                Our platform combines cutting-edge technology with healthcare expertise to deliver
                an exceptional experience for both doctors and patients.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {features.map((feature, index) => (
                <div key={index} className="group">
                  <div className="backdrop-blur-md bg-white/10 dark:bg-white/10 light:bg-white/60 border border-white/20 dark:border-white/20 light:border-gray-200/30 p-6 rounded-2xl hover:bg-white/20 dark:hover:bg-white/20 light:hover:bg-white/80 transition-all duration-300 transform hover:scale-105 hover:-translate-y-2 shadow-2xl">
                    <div className={`inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r ${feature.gradient} rounded-xl mb-4 shadow-lg`}>
                      {feature.icon}
                    </div>
                    <h3 className="text-xl font-semibold text-white dark:text-white light:text-gray-900 mb-2">{feature.title}</h3>
                    <p className="text-white/70 dark:text-white/70 light:text-gray-600">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section id="how-it-works" className="py-16 relative">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-5xl font-bold text-white dark:text-white light:text-gray-900 mb-4">
                How <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">MedConnect</span> Works
              </h2>
              <p className="text-lg text-white/70 dark:text-white/70 light:text-gray-600">
                Get started in three simple steps and transform your healthcare experience
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {steps.map((step, index) => (
                <div key={index} className="text-center group">
                  <div className="relative">
                    <div className={`inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r ${step.gradient} rounded-2xl text-white text-xl font-bold mb-6 shadow-2xl transform group-hover:scale-110 transition-transform`}>
                      {step.number}
                    </div>
                    {index < steps.length - 1 && (
                      <div className="hidden md:block absolute top-10 left-full w-full">
                        <div className="w-full h-0.5 bg-gradient-to-r from-white/30 to-transparent"></div>
                      </div>
                    )}
                  </div>
                  <div className="backdrop-blur-md bg-white/5 dark:bg-white/5 light:bg-white/40 border border-white/10 dark:border-white/10 light:border-gray-200/30 p-6 rounded-2xl">
                    <h3 className="text-xl font-semibold text-white dark:text-white light:text-gray-900 mb-2">{step.title}</h3>
                    <p className="text-white/70 dark:text-white/70 light:text-gray-600">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section id="benefits" className="py-16 relative">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-5xl font-bold text-white dark:text-white light:text-gray-900 mb-4">
                Benefits for <span className="bg-gradient-to-r from-pink-400 to-orange-400 bg-clip-text text-transparent">Everyone</span>
              </h2>
              <p className="text-lg text-white/70 dark:text-white/70 light:text-gray-600">
                Our platform is designed to benefit both healthcare providers and patients
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {benefits.map((benefit, index) => (
                <div key={index} className="group">
                  <div className={`backdrop-blur-md bg-gradient-to-br ${benefit.gradient} dark:${benefit.gradient} light:from-white/60 light:to-gray-50/60 border border-white/20 dark:border-white/20 light:border-gray-200/30 p-8 rounded-2xl hover:bg-white/20 dark:hover:bg-white/20 light:hover:bg-white/80 transition-all duration-300 transform hover:scale-105 shadow-2xl`}>
                    <div className="flex items-center mb-6">
                      <div className="p-3 rounded-xl bg-white/10 dark:bg-white/10 light:bg-white/50 backdrop-blur-sm mr-4">
                        {benefit.icon}
                      </div>
                      <h3 className="text-2xl font-semibold text-white dark:text-white light:text-gray-900">{benefit.category}</h3>
                    </div>
                    <ul className="space-y-4">
                      {benefit.items.map((item, itemIndex) => (
                        <li key={itemIndex} className="flex items-center">
                          <div className="p-1 rounded-full bg-gradient-to-r from-green-400 to-emerald-500 mr-3">
                            <CheckCircle className="w-4 h-4 text-white" />
                          </div>
                          <span className="text-white/90 dark:text-white/90 light:text-gray-700">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="py-16 relative">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-5xl font-bold text-white dark:text-white light:text-gray-900 mb-4">
                Trusted by <span className="bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">Healthcare Professionals</span>
              </h2>
              <p className="text-lg text-white/70 dark:text-white/70 light:text-gray-600">
                Join thousands of doctors and patients who have transformed their healthcare experience
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {[1, 2, 3].map((testimonial, index) => (
                <div key={index} className="group">
                  <div className="backdrop-blur-md bg-white/10 dark:bg-white/10 light:bg-white/60 border border-white/20 dark:border-white/20 light:border-gray-200/30 p-6 rounded-2xl hover:bg-white/20 dark:hover:bg-white/20 light:hover:bg-white/80 transition-all duration-300 transform hover:scale-105 shadow-2xl">
                    <div className="flex items-center mb-4">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star key={star} className="w-5 h-5 text-yellow-400 fill-current" />
                      ))}
                    </div>
                    <p className="text-white/80 dark:text-white/80 light:text-gray-700 mb-4">
                      "MedConnect has revolutionized how I manage patient prescriptions. The platform is intuitive and saves me hours every week."
                    </p>
                    <div className="flex items-center">
                      <div className="w-12 h-12 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full mr-3 flex items-center justify-center">
                        <span className="text-white font-semibold">SJ</span>
                      </div>
                      <div>
                        <h4 className="font-semibold text-white dark:text-white light:text-gray-900">Dr. Sarah Johnson</h4>
                        <p className="text-sm text-white/60 dark:text-white/60 light:text-gray-500">Family Medicine</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 relative">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="backdrop-blur-md bg-gradient-to-r from-blue-500/20 to-purple-500/20 dark:from-blue-500/20 dark:to-purple-500/20 light:from-blue-500/10 light:to-purple-500/10 border border-white/20 dark:border-white/20 light:border-gray-200/30 rounded-3xl p-12 shadow-2xl">
              <h2 className="text-3xl md:text-5xl font-bold text-white dark:text-white light:text-gray-900 mb-4">
                Ready to Transform Your
                <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent block">Healthcare Experience?</span>
              </h2>
              <p className="text-lg text-white/80 dark:text-white/80 light:text-gray-600 mb-8">
                Join MedConnect today and experience the future of healthcare management
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-8 py-4 rounded-xl text-lg font-medium hover:from-blue-600 hover:to-purple-700 transition-all transform hover:scale-105 shadow-2xl">
                  Get Started Free
                </button>
                <button className="backdrop-blur-sm bg-white/10 dark:bg-white/10 light:bg-white/50 border border-white/20 dark:border-white/20 light:border-gray-200/30 text-white dark:text-white light:text-gray-700 px-8 py-4 rounded-xl text-lg font-medium hover:bg-white/20 dark:hover:bg-white/20 light:hover:bg-white/70 transition-all transform hover:scale-105">
                  Schedule Demo
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="backdrop-blur-md bg-black/20 dark:bg-black/20 light:bg-white/60 border-t border-white/10 dark:border-white/10 light:border-gray-200/30 text-white dark:text-white light:text-gray-700 py-12 relative">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-4 gap-8">
              <div>
                <div className="flex items-center mb-4">
                  <div className="p-2 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600">
                    <Heart className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-xl font-bold ml-3">MedConnect</span>
                </div>
                <p className="text-white/70 dark:text-white/70 light:text-gray-600">
                  Connecting healthcare providers and patients through innovative digital solutions.
                </p>
              </div>
              <div>
                <h4 className="text-lg font-semibold mb-4">Platform</h4>
                <ul className="space-y-2 text-white/70 dark:text-white/70 light:text-gray-600">
                  <li><a href="#" className="hover:text-white dark:hover:text-white light:hover:text-gray-900 transition-colors">Features</a></li>
                  <li><a href="#" className="hover:text-white dark:hover:text-white light:hover:text-gray-900 transition-colors">Security</a></li>
                  <li><a href="#" className="hover:text-white dark:hover:text-white light:hover:text-gray-900 transition-colors">Pricing</a></li>
                  <li><a href="#" className="hover:text-white dark:hover:text-white light:hover:text-gray-900 transition-colors">API</a></li>
                </ul>
              </div>
              <div>
                <h4 className="text-lg font-semibold mb-4">Support</h4>
                <ul className="space-y-2 text-white/70 dark:text-white/70 light:text-gray-600">
                  <li><a href="#" className="hover:text-white dark:hover:text-white light:hover:text-gray-900 transition-colors">Help Center</a></li>
                  <li><a href="#" className="hover:text-white dark:hover:text-white light:hover:text-gray-900 transition-colors">Contact Us</a></li>
                  <li><a href="#" className="hover:text-white dark:hover:text-white light:hover:text-gray-900 transition-colors">Privacy Policy</a></li>
                  <li><a href="#" className="hover:text-white dark:hover:text-white light:hover:text-gray-900 transition-colors">Terms of Service</a></li>
                </ul>
              </div>
              <div>
                <h4 className="text-lg font-semibold mb-4">Company</h4>
                <ul className="space-y-2 text-white/70 dark:text-white/70 light:text-gray-600">
                  <li><a href="#" className="hover:text-white dark:hover:text-white light:hover:text-gray-900 transition-colors">About</a></li>
                  <li><a href="#" className="hover:text-white dark:hover:text-white light:hover:text-gray-900 transition-colors">Careers</a></li>
                  <li><a href="#" className="hover:text-white dark:hover:text-white light:hover:text-gray-900 transition-colors">Press</a></li>
                  <li><a href="#" className="hover:text-white dark:hover:text-white light:hover:text-gray-900 transition-colors">Partners</a></li>
                </ul>
              </div>
            </div>
            <div className="border-t border-white/10 dark:border-white/10 light:border-gray-200/30 mt-8 pt-8 text-center text-white/60 dark:text-white/60 light:text-gray-500">
              <p>&copy; 2024 MedConnect. All rights reserved.</p>
            </div>
          </div>
        </footer>

        <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
      `}</style>
      </div>
    </>
  );
}