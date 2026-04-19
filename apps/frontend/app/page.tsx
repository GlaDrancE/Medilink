"use client";

import { useState, useLayoutEffect, useRef } from 'react';
import Image from 'next/image';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import 'lenis/dist/lenis.css';
import {
  FileText,
  Shield,
  Clock,
  Smartphone,
  UserCheck,
  Stethoscope,
  CheckCircle,
  Menu,
  X,
  ArrowRight,
  Star,
} from 'lucide-react';
import {
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  UserButton,
} from '@clerk/nextjs';
import { useRouter } from 'next/navigation';

const CREAM = '#faf7ed';
const DARK = '#1a1a18';

export default function Home() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const router = useRouter();
  const landingRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const root = landingRef.current;
    if (!root) return;

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (reducedMotion) {
      const onScroll = () => setIsScrolled(window.scrollY > 20);
      onScroll();
      window.addEventListener('scroll', onScroll, { passive: true });
      return () => window.removeEventListener('scroll', onScroll);
    }

    gsap.registerPlugin(ScrollTrigger);

    const lenis = new Lenis({
      duration: 1.15,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      touchMultiplier: 2,
    });

    lenis.on('scroll', (lenisInstance: Lenis) => {
      ScrollTrigger.update();
      setIsScrolled(lenisInstance.scroll > 20);
    });

    const tickerFn = (time: number) => {
      lenis.raf(time * 1000);
    };
    gsap.ticker.add(tickerFn);
    gsap.ticker.lagSmoothing(0);

    document.documentElement.classList.add('lenis');

    const ctx = gsap.context(() => {
      const sections = gsap.utils.toArray<HTMLElement>(root.querySelectorAll('section'));
      const footerEl = root.querySelector('footer');
      const blocks: HTMLElement[] = footerEl ? [...sections, footerEl as HTMLElement] : [...sections];

      blocks.forEach((el) => {
        gsap.fromTo(
          el,
          { opacity: 0, y: 56 },
          {
            opacity: 1,
            y: 0,
            duration: 0.95,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: el,
              start: 'top 88%',
              once: true,
            },
          }
        );
      });

      const headings = gsap.utils.toArray<HTMLElement>(root.querySelectorAll('h1, h2, h3'));
      headings.forEach((el) => {
        gsap.fromTo(
          el,
          { opacity: 0, y: 44 },
          {
            opacity: 1,
            y: 0,
            duration: 0.78,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: el,
              start: 'top 90%',
              once: true,
            },
          }
        );
      });
    }, root);

    requestAnimationFrame(() => {
      ScrollTrigger.refresh();
    });

    return () => {
      ctx.revert();
      lenis.destroy();
      gsap.ticker.remove(tickerFn);
      document.documentElement.classList.remove('lenis');
    };
  }, []);

  const features = [
    {
      icon: <FileText className="w-6 h-6" />,
      title: 'Digital Prescriptions',
      description:
        'Doctors create and manage digital prescriptions securely, eliminating paper-based errors and delays.',
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: 'Secure Document Storage',
      description:
        'All medical documents are encrypted and stored with HIPAA-compliant security at every layer.',
    },
    {
      icon: <Clock className="w-6 h-6" />,
      title: 'Real-time Access',
      description:
        'Patients access their prescriptions and medical records instantly — anytime, anywhere.',
    },
    {
      icon: <Smartphone className="w-6 h-6" />,
      title: 'Mobile Friendly',
      description:
        'A fully responsive experience built for every device, from desktop clinics to bedside phones.',
    },
  ];

  const testimonials = [
    {
      quote:
        'MediLink has completely transformed how I manage patient prescriptions. The clarity and speed are unmatched.',
      name: 'Dr. Sarah Johnson',
      role: 'Family Medicine, Apollo Hospitals',
      initials: 'SJ',
    },
    {
      quote:
        'I no longer worry about losing prescriptions or missing follow-ups. Everything is in one place.',
      name: 'Rohan Mehta',
      role: 'Patient, Mumbai',
      initials: 'RM',
    },
    {
      quote:
        'The coordination between our care team improved dramatically since adopting MediLink.',
      name: 'Dr. Priya Nair',
      role: 'Cardiologist, Fortis',
      initials: 'PN',
    },
  ];

  const partners = [
    'CliniForm',
    'CarePath',
    'Apex Health',
    'MedData',
    'SynergiLog',
    'HealthNet',
  ];

  return (
    <>
      <style>{`
        /* Fonts load via next/font in layout.tsx — use CSS vars so headings aren’t overridden by Tailwind/base */

        .landing-page {
          font-family: var(--font-manrope), system-ui, sans-serif;
        }
        .landing-page h1,
        .landing-page h2,
        .landing-page h3,
        .landing-page h4,
        .landing-page h5,
        .landing-page h6 {
          font-family: var(--font-noto-serif), Georgia, serif !important;
          font-weight: 700;
        }

        .video-blend-top {
          background: linear-gradient(to bottom, ${CREAM} 0%, ${CREAM}cc 10%, transparent 40%);
        }
        .video-blend-bottom {
          background: linear-gradient(to top, ${CREAM} 0%, ${CREAM}aa 12%, transparent 40%);
        }
        .video-blend-left {
          background: linear-gradient(to right, ${CREAM} 0%, transparent 22%);
        }
        .video-blend-right {
          background: linear-gradient(to left, ${CREAM} 0%, transparent 22%);
        }

        .nav-link {
          font-size: 0.875rem;
          color: #3a3a35;
          text-decoration: none;
          padding: 0.25rem 0;
          position: relative;
          transition: color 0.2s;
        }
        .nav-link::after {
          content: '';
          position: absolute;
          bottom: -2px;
          left: 0;
          width: 0;
          height: 1px;
          background: #1a1a18;
          transition: width 0.25s;
        }
        .nav-link:hover { color: #1a1a18; }
        .nav-link:hover::after { width: 100%; }

        .btn-primary {
          background: #1a1a18;
          color: #f2ece1;
          border: none;
          border-radius: 9999px;
          padding: 0.6rem 1.6rem;
          font-size: 0.875rem;
          font-family: var(--font-manrope), system-ui, sans-serif;
          cursor: pointer;
          transition: background 0.2s, transform 0.15s;
          letter-spacing: 0.01em;
        }
        .btn-primary:hover { background: #2e2e28; transform: translateY(-1px); }

        .btn-outline {
          background: transparent;
          color: #1a1a18;
          border: 1.5px solid #1a1a18;
          border-radius: 9999px;
          padding: 0.6rem 1.6rem;
          font-size: 0.875rem;
          font-family: 'Manrope', system-ui, sans-serif;
          cursor: pointer;
          transition: background 0.2s, transform 0.15s;
        }
        .btn-outline:hover { background: #1a1a1808; transform: translateY(-1px); }

        .nav-desktop { display: none; }
        .nav-mobile-toggle { display: flex; }
        @media (min-width: 768px) {
          .nav-desktop { display: flex; }
          .nav-mobile-toggle { display: none; }
        }

        .feature-card {
          background: #fff9f2;
          border: 1px solid #e8e0d5;
          border-radius: 16px;
          padding: 2rem;
          transition: transform 0.25s, box-shadow 0.25s;
        }
        .feature-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 40px #1a1a1810;
        }

        .section-divider {
          width: 48px;
          height: 2px;
          background: #1a1a18;
          margin: 0 auto 1.5rem;
        }
      `}</style>

      <div ref={landingRef} className="landing-page" style={{ background: CREAM, color: DARK, minHeight: '100vh' }}>

        {/* ── Navbar ── */}
        <nav
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            zIndex: 100,
            transition: 'all 0.3s',
            background: isScrolled ? `${CREAM}ee` : 'transparent',
            backdropFilter: isScrolled ? 'blur(12px)' : 'none',
            borderBottom: isScrolled ? '1px solid #e8e0d540' : '1px solid transparent',
          }}
        >
          <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 64 }}>

              {/* Logo */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '1.35rem', fontWeight: 300, letterSpacing: '-0.01em' }}>
                  <span style={{ fontWeight: 700 }}>+</span> MediLink
                </span>
              </div>

              {/* Desktop Links */}
              <div className="nav-desktop" style={{ alignItems: 'center', gap: '2rem' }}>
                {['Features', 'Solutions', 'Doctors', 'Patients', 'Pricing', 'About'].map((link) => (
                  <a key={link} href={`#${link.toLowerCase()}`} className="nav-link">{link}</a>
                ))}
              </div>

              {/* Desktop Auth */}
              <div className="nav-desktop" style={{ alignItems: 'center', gap: '1rem' }}>
                <SignedOut>
                  <SignInButton>
                    <button className="nav-link" style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.875rem', color: '#3a3a35', fontFamily: "'Manrope', system-ui, sans-serif" }}>
                      Login
                    </button>
                  </SignInButton>
                  <SignUpButton>
                    <button className="btn-primary">Apply Now</button>
                  </SignUpButton>
                </SignedOut>
                <SignedIn>
                  <UserButton />
                  <button className="btn-primary" onClick={() => router.push('/dashboard/doctor')}>
                    Dashboard
                  </button>
                </SignedIn>
              </div>

              {/* Mobile menu toggle */}
              <button
                className="nav-mobile-toggle"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: DARK, padding: '0.5rem' }}
              >
                {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {isMenuOpen && (
            <div style={{ background: CREAM, borderTop: '1px solid #e8e0d5', padding: '1rem 1.5rem' }}>
              {['Features', 'Solutions', 'Doctors', 'Patients', 'Pricing', 'About'].map((link) => (
                <a
                  key={link}
                  href={`#${link.toLowerCase()}`}
                  style={{ display: 'block', padding: '0.6rem 0', color: '#3a3a35', textDecoration: 'none', fontSize: '0.95rem', borderBottom: '1px solid #e8e0d540' }}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {link}
                </a>
              ))}
              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
                <SignedOut>
                  <SignInButton>
                    <button className="btn-outline" style={{ flex: 1 }}>Login</button>
                  </SignInButton>
                  <SignUpButton>
                    <button className="btn-primary" style={{ flex: 1 }}>Apply Now</button>
                  </SignUpButton>
                </SignedOut>
                <SignedIn>
                  <button className="btn-primary" style={{ flex: 1 }} onClick={() => router.push('/dashboard/doctor')}>
                    Dashboard
                  </button>
                </SignedIn>
              </div>
            </div>
          )}
        </nav>

        {/* ── Hero Section ── */}
        <section style={{ paddingTop: 96, paddingBottom: 0, textAlign: 'center', overflow: 'hidden' }}>

          {/* Text block */}
          <div style={{ margin: '0 auto', padding: '3rem 1.5rem 2.5rem' }}>

            <p style={{ fontSize: '0.8rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#7a7060', marginBottom: '1.25rem', fontWeight: 500 }}>
              Healthcare · Connected · Simplified
            </p>

            <h1
              style={{
                fontFamily: 'var(--font-noto-serif), Georgia, serif',
                fontSize: 'clamp(2.4rem, 6vw, 5rem)',
                fontWeight: 400,
                lineHeight: 1.1,
                letterSpacing: '-0.02em',
                marginBottom: '1.5rem',
                color: DARK,
              }}
            >
              Introducing MediLink:{' '}
              <br />Healthcare connected with clarity.
            </h1>

            <p
              style={{ fontSize: 'clamp(1rem, 2vw, 1.15rem)', color: '#5a5248', lineHeight: 1.75, maxWidth: 560, margin: '0 auto 2.5rem', fontWeight: 400 }}
            >
              MediLink simplifies patient care, care-team coordination, and medical
              workflows through a unified digital experience.
            </p>

            <div style={{ display: 'flex', gap: '0.875rem', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '1rem' }}>
              <button
                className="btn-primary"
                style={{ padding: '0.85rem 2.2rem', fontSize: '0.95rem' }}
                onClick={() => router.push('/dashboard/doctor')}
              >
                Get Started — For Doctors
              </button>
              <button className="btn-outline" style={{ padding: '0.85rem 2.2rem', fontSize: '0.95rem' }}>
                Book a Demo
              </button>
            </div>

            {/* Patient entry point */}
            <p style={{ fontSize: '0.875rem', color: '#7a7060', marginBottom: '2.5rem' }}>
              Are you a patient?{' '}
              <button
                onClick={() => router.push('/dashboard/patient')}
                style={{
                  background: 'none',
                  border: 'none',
                  padding: 0,
                  color: '#4a7c59',
                  fontWeight: 600,
                  fontSize: 'inherit',
                  cursor: 'pointer',
                  textDecoration: 'underline',
                  textUnderlineOffset: '3px',
                }}
              >
                View your health records →
              </button>
            </p>

            {/* Trust badge */}
            <p style={{ fontSize: '0.78rem', color: '#8a8070', letterSpacing: '0.04em', marginBottom: '1.5rem' }}>
              Trusted by <strong style={{ color: DARK }}>1,200+</strong> hospitals and <strong style={{ color: DARK }}>8,000+</strong> care teams. &nbsp;HIPAA &amp; GDPR Compliant.
            </p>

            {/* Partner logos */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', flexWrap: 'wrap', alignItems: 'center' }}>
              {partners.map((p) => (
                <span key={p} style={{ fontSize: '0.75rem', color: '#aaa090', letterSpacing: '0.06em', textTransform: 'uppercase', fontWeight: 500 }}>{p}</span>
              ))}
            </div>
          </div>

          {/* ── Full-width hero illustration (intrinsic height — do not use fill + height:auto) ── */}
          <div
            style={{
              width: '100%',
              backgroundColor: '#e8e0d5',
              lineHeight: 0,
            }}
          >
            <Image
              src="/images/hero.png"
              alt="Connected healthcare ecosystem — hospitals, care teams, and patient data flowing across a digital network"
              width={1024}
              height={376}
              priority
              sizes="100vw"
              style={{
                width: '100%',
                height: 'auto',
                display: 'block',
                objectPosition: 'center bottom',
              }}
            />
          </div>
        </section>

        {/* ── Features Section ── */}
        <section id="features" style={{ padding: '6rem 1.5rem', maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
            <div className="section-divider" />
            <h2 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', fontWeight: 700, letterSpacing: '-0.02em', marginBottom: '1rem' }}>
              Powerful features for<br />
              <em style={{ fontWeight: 400 }}>modern healthcare</em>
            </h2>
            <p style={{ color: '#6a6255', maxWidth: 480, margin: '0 auto', lineHeight: 1.7 }}>
              Combining clinical expertise with elegant technology to deliver an exceptional
              experience for providers and patients alike.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem' }}>
            {features.map((f, i) => (
              <div key={i} className="feature-card">
                <div style={{ marginBottom: '1rem', color: '#5a5248', background: '#ede7db', borderRadius: 10, width: 44, height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {f.icon}
                </div>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '0.6rem', letterSpacing: '-0.01em' }}>{f.title}</h3>
                <p style={{ fontSize: '0.9rem', color: '#7a7060', lineHeight: 1.65 }}>{f.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── How It Works ── */}
        <section id="solutions" style={{ background: '#1a1a18', color: '#f2ece1', padding: '6rem 1.5rem' }}>
          <div style={{ maxWidth: 1200, margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
              <div style={{ width: 48, height: 2, background: '#f2ece1', margin: '0 auto 1.5rem' }} />
              <h2 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', fontWeight: 700, letterSpacing: '-0.02em', marginBottom: '1rem', color: '#f2ece1' }}>
                How <em style={{ fontWeight: 400 }}>MediLink</em> works
              </h2>
              <p style={{ color: '#a09880', maxWidth: 440, margin: '0 auto', lineHeight: 1.7 }}>
                Three simple steps to transform your healthcare experience.
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.5rem' }}>
              {[
                { n: '01', title: 'Register & Verify', desc: 'Create your account and verify your identity through our secure onboarding process.' },
                { n: '02', title: 'Connect with Providers', desc: 'Link with your healthcare providers and begin receiving digital prescriptions instantly.' },
                { n: '03', title: 'Manage & Access', desc: 'All your medical documents and prescriptions, centralised in one beautiful dashboard.' },
              ].map((s, i) => (
                <div key={i} style={{ border: '1px solid #2e2e28', borderRadius: 16, padding: '2rem' }}>
                  <span style={{ fontSize: '2.5rem', fontWeight: 700, color: '#3a3a35', letterSpacing: '-0.03em', display: 'block', marginBottom: '1rem' }}>{s.n}</span>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.6rem', color: '#f2ece1' }}>{s.title}</h3>
                  <p style={{ fontSize: '0.9rem', color: '#8a8070', lineHeight: 1.65 }}>{s.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Benefits ── */}
        <section id="doctors" style={{ padding: '6rem 1.5rem', maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
            <div className="section-divider" />
            <h2 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', fontWeight: 700, letterSpacing: '-0.02em', marginBottom: '1rem' }}>
              Built for <em style={{ fontWeight: 400 }}>everyone</em>
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
            {[
              {
                category: 'For Doctors',
                icon: <Stethoscope className="w-5 h-5" />,
                items: ['Streamlined prescription management', 'Reduced administrative burden', 'Better patient communication', 'Secure document sharing'],
              },
              {
                category: 'For Patients',
                icon: <UserCheck className="w-5 h-5" />,
                items: ['Instant access to prescriptions', 'Organised medical history', 'Easy document sharing', 'Improved healthcare coordination'],
              },
            ].map((b, i) => (
              <div key={i} className="feature-card" style={{ padding: '2.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                  <div style={{ background: '#ede7db', borderRadius: 8, padding: '0.5rem', color: '#5a5248' }}>{b.icon}</div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>{b.category}</h3>
                </div>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                  {b.items.map((item, j) => (
                    <li key={j} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.6rem', fontSize: '0.9rem', color: '#5a5248', lineHeight: 1.5 }}>
                      <CheckCircle className="w-4 h-4" style={{ flexShrink: 0, marginTop: 2, color: '#6a8c6a' }} />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {/* ── Testimonials ── */}
        <section style={{ background: '#f9f4ec', padding: '6rem 1.5rem' }}>
          <div style={{ maxWidth: 1200, margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
              <div className="section-divider" />
              <h2 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', fontWeight: 700, letterSpacing: '-0.02em', marginBottom: '1rem' }}>
                Trusted by <em style={{ fontWeight: 400 }}>healthcare professionals</em>
              </h2>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
              {testimonials.map((t, i) => (
                <div key={i} style={{ background: '#fff9f2', border: '1px solid #e8e0d5', borderRadius: 16, padding: '2rem' }}>
                  <div style={{ display: 'flex', gap: '0.25rem', marginBottom: '1rem' }}>
                    {[...Array(5)].map((_, s) => (
                      <Star key={s} className="w-4 h-4" style={{ fill: '#c9a84c', color: '#c9a84c' }} />
                    ))}
                  </div>
                  <p style={{ fontSize: '0.92rem', color: '#5a5248', lineHeight: 1.7, marginBottom: '1.5rem', fontStyle: 'italic' }}>
                    "{t.quote}"
                  </p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#ede7db', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 700, color: '#5a5248', flexShrink: 0 }}>
                      {t.initials}
                    </div>
                    <div>
                      <p style={{ fontSize: '0.88rem', fontWeight: 700, marginBottom: '0.1rem' }}>{t.name}</p>
                      <p style={{ fontSize: '0.78rem', color: '#8a8070' }}>{t.role}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── CTA ── */}
        <section style={{ padding: '6rem 1.5rem', textAlign: 'center' }}>
          <div style={{ maxWidth: 700, margin: '0 auto' }}>
            <div className="section-divider" />
            <h2 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', fontWeight: 700, letterSpacing: '-0.02em', marginBottom: '1rem' }}>
              Ready to transform your<br />
              <em style={{ fontWeight: 400 }}>healthcare experience?</em>
            </h2>
            <p style={{ color: '#6a6255', marginBottom: '2rem', lineHeight: 1.7 }}>
              Join MediLink today and step into the future of healthcare management.
            </p>
            <div style={{ display: 'flex', gap: '0.875rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button
                className="btn-primary"
                style={{ padding: '0.9rem 2.4rem', fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                onClick={() => router.push('/dashboard/doctor')}
              >
                Get Started Free <ArrowRight className="w-4 h-4" />
              </button>
              <button className="btn-outline" style={{ padding: '0.9rem 2.4rem', fontSize: '0.95rem' }}>
                Schedule Demo
              </button>
            </div>
          </div>
        </section>

        {/* ── Footer ── */}
        <footer style={{ background: '#1a1a18', color: '#f2ece1', padding: '4rem 1.5rem 2rem' }}>
          <div style={{ maxWidth: 1200, margin: '0 auto' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '2.5rem', marginBottom: '3rem' }}>
              <div>
                <p style={{ fontWeight: 700, fontSize: '1.1rem', marginBottom: '0.75rem' }}>+ MediLink</p>
                <p style={{ fontSize: '0.85rem', color: '#8a8070', lineHeight: 1.7 }}>
                  Connecting healthcare providers and patients through innovative digital solutions.
                </p>
              </div>
              {[
                { title: 'Platform', links: ['Features', 'Security', 'Pricing', 'API'] },
                { title: 'Support', links: ['Help Center', 'Contact Us', 'Privacy Policy', 'Terms'] },
                { title: 'Company', links: ['About', 'Careers', 'Press', 'Partners'] },
              ].map((col) => (
                <div key={col.title}>
                  <p style={{ fontWeight: 700, fontSize: '0.88rem', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '1rem', color: '#a09880' }}>{col.title}</p>
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                    {col.links.map((link) => (
                      <li key={link}>
                        <a href="#" style={{ color: '#8a8070', textDecoration: 'none', fontSize: '0.88rem', transition: 'color 0.2s' }}
                          onMouseEnter={(e) => (e.currentTarget.style.color = '#f2ece1')}
                          onMouseLeave={(e) => (e.currentTarget.style.color = '#8a8070')}>
                          {link}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
            <div style={{ borderTop: '1px solid #2e2e28', paddingTop: '2rem', textAlign: 'center', fontSize: '0.78rem', color: '#6a6255' }}>
              © 2026 MediLink. All rights reserved.
            </div>
          </div>
        </footer>

      </div>
    </>
  );
}
