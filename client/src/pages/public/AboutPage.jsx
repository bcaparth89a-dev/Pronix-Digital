import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Lightbulb,
  Award,
  Eye,
  Handshake,
  User,
  ArrowRight,
  X,
  Linkedin,
  Mail,
  Phone,
  Globe,
  GraduationCap,
  Briefcase,
  Code,
  Languages,
  BookOpen,
  Heart
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { publicRoutes } from "@/config/navigation";
import { cn, optimizeImageUrl } from "@/lib/utils";
import { FadeIn, FadeInStagger, FadeInItem, SlideIn, AnimatedCounter } from "@/lib/motion";
import { useMetrics } from "@/features/metrics/useMetrics";
import { AnimatePresence, m as motion } from "framer-motion";
import { DarkWarmAccentBackground, GalleryBackground } from "@/components/public/Backgrounds";
import {
  AboutHeroDots,
  MissionDots,
  ValuesDots,
} from "@/components/public/DotGridBackground";
import { businessProfile } from "@/config/business";
import { resolveSeoMetadata, useSeoMetadata } from "@/lib/seo";



// --- Data --------------------------------------------------------------------

const VALUES = [
  {
    icon: Lightbulb,
    title: "Innovation",
    desc: "We embrace new approaches to solve complex problems. Staying ahead is how we operate.",
  },
  {
    icon: Award,
    title: "Quality",
    desc: "Every pixel, line of code, and strategy is crafted with excellence. We ship work we are proud of.",
  },
  {
    icon: Eye,
    title: "Transparency",
    desc: "Clear timelines and honest communication - no surprises. You'll always know where we stand.",
  },
  {
    icon: Handshake,
    title: "Partnership",
    desc: "We treat every client's project as our own. Your success is our sole metric.",
  },
];

const ABOUT_FAQ = [
  {
    question: "Who is Pronix Digital?",
    answer:
      "Pronix Digital is a software development agency that builds business websites, mobile apps, custom software, SEO campaigns, and digital products for growing companies.",
  },
  {
    question: "Which services does Pronix Digital provide?",
    answer:
      "The team provides website development, mobile app development, software for business operations, SEO and digital marketing, graphic design, brand identity design, social media design, video editing, motion graphics, and product visual design.",
  },
  {
    question: "Which regions does Pronix Digital serve?",
    answer:
      "Pronix Digital serves Vadodara, Surat, Gujarat, India, and worldwide remote clients.",
  },
  {
    question: "What technologies does the team use?",
    answer:
      "The team works with React, Node.js, Express, Tailwind CSS, MongoDB, Flutter, Android, Java, Kotlin, Cloudinary, Firebase, and cloud deployment workflows.",
  },
  {
    question: "What industries does Pronix Digital work with?",
    answer:
      "Pronix Digital works with startups, service businesses, retail, education, operations teams, healthcare-style workflows, and other businesses that need software, websites, or marketing systems.",
  },
];

const AI_OVERVIEW_POINTS = [
  "Software development agency focused on websites, mobile apps, custom software, SEO, and digital products.",
  "Serves Vadodara, Surat, Gujarat, India, and worldwide remote clients.",
  "Built around answer-first delivery, transparent communication, and measurable business outcomes.",
  "Led by founders with web, Android, Flutter, UI/UX, and AI/ML experience.",
];

const INDUSTRIES = ["Startups", "Retail", "Education", "Healthcare", "Professional services", "Operations teams"];

const TECH_STACK = [
  "React",
  "Node.js",
  "Express",
  "MongoDB",
  "Tailwind CSS",
  "Flutter",
  "Android",
  "Java",
  "Kotlin",
  "Firebase",
  "Cloudinary",
  "Cloud deployment",
];

const SERVICE_REGIONS = businessProfile.serviceAreas;

const TESTIMONIALS = [
  {
    name: "James Okafor",
    role: "CEO, TechBridge Africa",
    stars: 5,
    quote:
      "Pronix Digital transformed our vision into a fully functional platform in record time. Their attention to detail and proactive communication made the entire process seamless. I couldn't recommend them more highly.",
  },
  {
    name: "Linda Muller",
    role: "Head of Operations, SwiftRetail GmbH",
    stars: 5,
    quote:
      "We hired Pronix to rebuild our e-commerce backend and the results exceeded every expectation. Page load times dropped by 60%, conversions went up, and the team was a pleasure to work with throughout.",
  },
  {
    name: "Aisha Rahman",
    role: "Founder, HealthTrack App",
    stars: 5,
    quote:
      "From our first discovery call to App Store launch, Pronix handled everything with professionalism and care. They built exactly what we needed and were transparent about every decision along the way.",
  },
];

const FOUNDERS = [
  {
    name: "Pawar Parth Umesh",
    role: "Founder & Full-Stack Developer",
    image: "/Parth.webp",
    objectPosition: "object-[center_17%]",
    shortDesc: "Computer Application Student (BCA-Hons With Research .) at MSU. Full-stack developer, Android developer, and AI/ML enthusiast.",
    linkedin: "https://www.linkedin.com/in/parth-pawar-143682307",
    email: "pawarparth233@gmail.com",
    phone: "+917990101983",
    portfolio: "",
    summary: "Dedicated Computer Application student (BCA-Hons.) with strong academic performance and diverse technical expertise. Full Stack Web Developer, Android Application Developer, Java Developer, Flutter Developer, and UI/UX Designer, with a growing interest in Artificial Intelligence and Machine Learning.",
    education: [
      { degree: "Bachelor of Computer Applications (BCA-Hons.)", school: "Maharaja Sayajirao University of Vadodara", year: "2023–Present", score: "8.09 CGPA (Till 6th Semester)" },
      { degree: "HSC (Commerce)", school: "Sanskar Bharti Vidhyalaya, Surat", year: "2023", score: "99.47 %tile" },
      { degree: "SSC", school: "Sanskar Bharti Vidhyalaya, Surat", year: "2021", score: "93.26 %tile" }
    ],
    skills: {
      "Programming Languages": ["C", "C++", "Python", "Java", "Kotlin", "DSA", "OOP"],
      "Web Development": ["HTML", "CSS", "JavaScript", "jQuery", "PHP", "React.js", "Node.js", "Express.js", "Bootstrap", "Tailwind CSS", "Git & GitHub"],
      "Databases": ["MySQL", "DBMS", "Firebase", "MongoDB", "Cloudinary"],
      "Frameworks & Tools": ["Spring Boot", "Jetpack Compose", "Android Studio"]
    },
    languages: ["Gujarati", "Hindi", "English", "Marathi"],
    certifications: [
      "Web Development Remedial Course – MSU (2023)",
      "Front-End Development – Udemy (2024)",
      "IoT Workshop – MSU (2024)",
      "Code Revolution: Modern Software Development – MSU (2025)",
      "IBM SkillsBuild (Agentic AI Architecture) – CSRBOX & IBM (2025)",
      "Unlocking Generative AI – MSU (2025)"
    ],
    experience: [
      { role: "Web App Development Intern", company: "Faculty of Science, MSU", period: "May–July 2025" },
      { role: "Web App Development Intern", company: "Prism I.T. Systems, Surat", period: "Oct–Dec 2025" },
      { role: "Web App Development Intern", company: "GB Innovation, Ahmedabad", period: "Mar 2026" },
      { role: "Full Stack Java Development Intern", company: "System Tron, Vadodara", period: "Mar 2026" },
      { role: "Android App Development Intern", company: "System Tron, Vadodara", period: "May 2026" },
      { role: "Web App Development Intern", company: "Niyaans Gallery, Surat", period: "May 2026" }
    ],
    activities: [
      "NCC Cadet (till A Certificate)",
      "Volunteer – Pathshala Vadodara NGO",
      "Council Member – IMS Vadodara"
    ],
    hobbies: ["Listening to music", "Watching movies", "Personal development"]
  },
  {
    name: "Ronit Kailash Kumar Dholwani",
    role: "Co-Founder & Mobile App Developer",
    image: "/Ronit.webp",
    shortDesc: "Computer Applications Student (BCA-Hons.) at MSU. Experienced Android and Flutter mobile developer.",
    linkedin: "https://www.linkedin.com/in/ronit-dholwani/",
    email: "ronitkailash1006@gmail.com",
    phone: "+917984806071",
    portfolio: "https://ronitdholwani.me/",
    summary: "Motivated BCA-Hons. student with strong academic performance and hands-on experience in Android and mobile app development. Successfully delivered freelance projects, applying structured problem-solving and OOP principles to real-world applications.",
    education: [
      { degree: "Bachelor of Computer Applications", school: "Maharaja Sayajirao University of Baroda", year: "2023-Present", score: "7.67 CGPA" },
      { degree: "12th Commerce (GSHSEB)", school: "Sadhu Vaswani Vidya Mandir, Vadodara", year: "2023", score: "85.48 Percentile" },
      { degree: "10th (GSEB)", school: "Sadhu Vaswani Vidya Mandir, Vadodara", year: "2021", score: "86.71 Percentile" }
    ],
    skills: {
      "Programming Languages": ["C", "C++", "Java", "Python"],
      "Mobile Development": ["Android (Java)", "Kotlin", "Flutter"],
      "Web & Databases": ["HTML", "CSS", "JavaScript", "DBMS", "SQL"],
      "Tools & Concepts": ["Android Studio", "Firebase (Basics)", "OOP", "Structured Problem Analysis"]
    },
    experience: [
      {
        role: "Mobile App Developer",
        company: "Hyunix Technologies",
        period: "2026 – Present",
        details: [
          "Developed 3 Android applications using pure Java for numerology-based calculations and reports.",
          "Implemented custom date and number analysis logic covering 50+ numerology rules.",
          "Designed clean, user-friendly interfaces, reducing manual calculation effort by ~80%."
        ]
      },
      {
        role: "Freelance Mobile App Developer",
        company: "Self-Employed",
        period: "2024 – Present",
        details: [
          "Developed 3 Android applications using pure Java for numerology-based calculations and reports.",
          "Implemented custom date and number analysis logic covering 50+ numerology rules.",
          "Designed clean, user-friendly interfaces, reducing manual calculation effort by ~80%."
        ]
      },
      {
        role: "Android App Developer Intern",
        company: "The Maharaja Sayajirao University of Baroda",
        period: "May 2025 – June 2025",
        details: [
          "Developed 3 Android applications using pure Java for numerology-based calculations and reports.",
          "Implemented custom date and number analysis logic covering 50+ numerology rules.",
          "Designed clean, user-friendly interfaces, reducing manual calculation effort by ~80%."
        ]
      },
      {
        role: "Technical Support Assistant – Networking",
        company: "Protech Computer Education",
        period: "2023 – 2024",
        details: [
          "Improved client social media profiles by 40%, boosting engagement and visibility.",
          "Designed 20+ social media posts and video content for brand presence.",
          "Edited and optimized 30+ recorded course videos, increasing viewer retention by 20%."
        ]
      }
    ],
    achievements: [
      "1st Position – SustainIT Open House, MSU Baroda (2024)",
      "1st Position – State Level Tech Fest VYOM, SVIT Vasad (2024)",
      "Certified in Graphical Design and Digital Marketing with A+ Grade"
    ]
  }
];

// --- Page ---------------------------------------------------------------------

export function AboutPage() {
  const { data: metricsData } = useMetrics({ isActive: true });
  const dbMetrics = metricsData?.items ?? [];



  const [selectedFounder, setSelectedFounder] = useState(null);
  const [activeImageLightbox, setActiveImageLightbox] = useState(null);
  const [isMobile, setIsMobile] = useState(false);

  const seoMetadata = useMemo(
    () =>
      resolveSeoMetadata({
        pathname: publicRoutes.about,
        title: "About Pronix Digital",
        description:
          "Pronix Digital is a software development agency for websites, mobile apps, custom software, SEO, and digital products in Vadodara, Surat, Gujarat, India, and worldwide remote markets.",
        entity: {
          title: "Pronix Digital",
          seoTitle: "About Pronix Digital | Software Development Agency in Vadodara, Surat, Gujarat, India",
          seoDescription:
            "Pronix Digital builds business websites, mobile apps, custom software, SEO campaigns, and digital products for startups and growing businesses.",
          summary:
            "Pronix Digital is a software development agency that builds business websites, mobile apps, custom software, SEO campaigns, and digital products for growing companies.",
          industry: INDUSTRIES,
          services: [
            "Business Websites",
            "Mobile Apps",
            "Custom Software",
            "SEO & Digital Marketing",
            "Graphic Design",
            "Brand Identity Design",
            "Video Editing",
          ],
          technologies: TECH_STACK,
          tags: [...INDUSTRIES, ...SERVICE_REGIONS],
        },
        faqItems: ABOUT_FAQ,
        teamMembers: FOUNDERS.map((founder) => ({
          name: founder.name,
          role: founder.role,
          description: founder.summary,
          url: founder.portfolio || founder.linkedin || `${businessProfile.website}${publicRoutes.about}`,
          sameAs: [founder.linkedin, founder.portfolio].filter(Boolean),
          email: founder.email,
          phone: founder.phone,
          knowsAbout: Object.values(founder.skills).flat().slice(0, 12),
          alumniOf: founder.education?.map((item) => item.school).filter(Boolean),
        })),
        breadcrumbs: [
          { name: "Pronix Digital", url: `${businessProfile.website}/` },
          { name: "About", url: `${businessProfile.website}${publicRoutes.about}` },
        ],
      }),
    [],
  );

  useSeoMetadata(seoMetadata);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        setSelectedFounder(null);
        setActiveImageLightbox(null);
      }
    };
    if (selectedFounder || activeImageLightbox) {
      window.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
      if (selectedFounder) {
        window.dispatchEvent(new CustomEvent("mobile-menu-open"));
      }
    } else {
      document.body.style.overflow = "";
      window.dispatchEvent(new CustomEvent("mobile-menu-close"));
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
      window.dispatchEvent(new CustomEvent("mobile-menu-close"));
    };
  }, [selectedFounder, activeImageLightbox]);



  // Map description based on label keywords to fit the existing visual subtitles
  const getDesc = (label) => {
    const lower = label.toLowerCase();
    if (lower.includes("project") || lower.includes("ship")) return "Crafted worldwide";
    if (lower.includes("partner") || lower.includes("client")) return "Long-term relationships";
    if (lower.includes("year") || lower.includes("experience") || lower.includes("build")) return "Company operational age";
    if (lower.includes("focus") || lower.includes("satisfact")) return "Stewardship and trust";
    return "Verified result";
  };

  const metrics = dbMetrics.length > 0
    ? dbMetrics.map((m) => ({
      value: m.value,
      label: m.label,
      desc: getDesc(m.label),
    }))
    : [
      { value: "20+", label: "Projects Delivered", desc: "Crafted worldwide" },
      { value: "15+", label: "Client Partnerships", desc: "Long-term relationships" },
      { value: "2+", label: "Years Experience", desc: "Company operational age" },
      { value: "100%", label: "Client Focused", desc: "Stewardship and trust" }
    ];

  return (
    <>
      <main>
        {/* -- Hero -- */}
        <section className="relative pt-36 pb-20 border-b border-border bg-background overflow-hidden bg-mesh">
          <AboutHeroDots />
          <FadeIn className="container text-center relative z-10">
            <span className="section-tag mb-4 block w-fit mx-auto">About Pronix Digital</span>
            <h1 className="font-display text-4xl sm:text-5xl md:text-6xl font-bold text-foreground tracking-tight text-balance leading-tight">
              We Build Software to Help Your <span className="italic text-primary font-normal">Business Grow</span>
            </h1>
            <p className="mt-6 text-xs sm:text-sm leading-relaxed text-muted-foreground max-w-3xl mx-auto">
              Pronix Digital is a software development agency that builds business websites, mobile apps, custom software, SEO campaigns, and digital products for growing companies in Vadodara, Surat, Gujarat, India, and worldwide remote markets.
            </p>
          </FadeIn>
        </section>

        {/* -- AI Search Snapshot -- */}
        <section className="py-16 md:py-20 bg-background relative overflow-hidden bg-mesh border-b border-border">
          <div className="container relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              <article className="lg:col-span-7 rounded-[24px] border border-border bg-card p-6 md:p-8 shadow-xl-soft">
                <span className="section-tag mb-4 inline-block">AI Search Snapshot</span>
                <h2 className="font-display text-2xl md:text-3xl font-bold tracking-tight mb-4 text-foreground text-balance">
                  Who is Pronix Digital?
                </h2>
                <p className="text-xs sm:text-sm leading-relaxed text-muted-foreground mb-6">
                  Pronix Digital is a software development agency focused on websites, mobile apps, custom software, SEO, and digital products for startups and growing businesses.
                </p>
                <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="rounded-2xl border border-border bg-background p-4">
                    <dt className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">Services</dt>
                    <dd className="mt-2 text-sm font-semibold text-foreground">Web, mobile, software, SEO, design, and video</dd>
                  </div>
                  <div className="rounded-2xl border border-border bg-background p-4">
                    <dt className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">Regions</dt>
                    <dd className="mt-2 text-sm font-semibold text-foreground">Vadodara, Surat, Gujarat, India, remote</dd>
                  </div>
                  <div className="rounded-2xl border border-border bg-background p-4">
                    <dt className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">Industries</dt>
                    <dd className="mt-2 text-sm font-semibold text-foreground">Startups, retail, education, healthcare, operations</dd>
                  </div>
                  <div className="rounded-2xl border border-border bg-background p-4">
                    <dt className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">Team focus</dt>
                    <dd className="mt-2 text-sm font-semibold text-foreground">Engineering, UI/UX, Android, Flutter, AI/ML</dd>
                  </div>
                </dl>
              </article>

              <aside className="lg:col-span-5 grid gap-4">
                <div className="rounded-[24px] border border-border bg-card p-6">
                  <h2 className="font-display text-xl font-bold tracking-tight mb-4">Answer-first summary</h2>
                  <ul className="space-y-3 text-xs leading-relaxed text-muted-foreground">
                    {AI_OVERVIEW_POINTS.map((point) => (
                      <li key={point} className="flex gap-2">
                        <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="rounded-[24px] border border-border bg-card p-6">
                  <h2 className="font-display text-xl font-bold tracking-tight mb-4">Topic clusters</h2>
                  <div className="flex flex-wrap gap-2">
                    {["Web Development", "Mobile Apps", "SEO", "Custom Software", "Branding", "Automation", "AI Solutions", "Digital Products"].map((item) => (
                      <span key={item} className="rounded-full border border-border bg-background px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-foreground">
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              </aside>
            </div>
          </div>
        </section>

        {/* -- Mission & Story -- */}
        <section className="py-20 md:py-28 bg-background relative overflow-hidden bg-mesh">
          <MissionDots />
          <div className="container relative z-10">
          <div className="grid grid-cols-1 items-center gap-10 md:grid-cols-2 lg:gap-16">
            {/* Left: Story */}
            <SlideIn from="left">
              <h2 className="font-display text-3xl md:text-4xl font-bold tracking-tight mb-6">
                Our Mission
              </h2>
              <p className="text-xs sm:text-sm leading-relaxed text-muted-foreground mb-5">
                At Pronix Digital, our mission is to empower businesses with direct digital
                solutions that drive real growth. We believe technology should be accessible,
                reliable, and easy to use—regardless of your company size.
              </p>
              <p className="text-xs sm:text-sm leading-relaxed text-muted-foreground mb-5">
                We started with a simple idea: that great software shouldn't be reserved for large enterprises with massive budgets. We build websites, apps, and tools that actually work for real people and growing businesses.
              </p>
              <p className="text-xs sm:text-sm leading-relaxed text-muted-foreground">
                Every project we take on is a chance to make a meaningful difference. Whether you're a startup launching your first product or an established business automating operations, we bring the same level of care, craft, and clear communication.
              </p>
            </SlideIn>

            {/* Right: Highlight card */}
            <SlideIn from="right">
              <div className="rounded-[20px] border border-border bg-card p-8 transition-colors hover:border-primary/20 hover:shadow-xl-soft duration-300">
                <div className="mb-6 flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Lightbulb className="h-5 w-5" />
                </div>
                <blockquote className="font-display text-lg font-bold leading-relaxed text-foreground mb-6">
                  "We don't just write code—we build partnerships. Your business growth is the only metric we care about."
                </blockquote>
                <p className="text-xs text-muted-foreground">
                  - Parth Pawar, Founder
                </p>
                <div className="mt-8 pt-8 border-t border-border grid grid-cols-2 gap-6">
                  <div>
                    <p className="font-display text-2xl font-bold text-primary">
                      <AnimatedCounter value={metrics[0]?.value || "20+"} />
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">{metrics[0]?.label || "Projects Completed"}</p>
                  </div>
                  <div>
                    <p className="font-display text-2xl font-bold text-primary">
                      <AnimatedCounter value={metrics[metrics.length - 1]?.value || "100%"} />
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">{metrics[metrics.length - 1]?.label || "Delivery Satisfaction"}</p>
                  </div>
                </div>
              </div>
            </SlideIn>
          </div>
        </div>
      </section>

      {/* -- Stats Bar -- */}
      <section className="py-12 bg-card/60 border-y border-border bg-mesh">
        <div className="container">
          <div className="grid grid-cols-2 gap-6 text-center md:grid-cols-4">
            {metrics.map(({ value, label, desc }, i) => (
              <FadeIn key={label || i} className="flex flex-col items-center">
                <div className="font-display text-2xl md:text-3xl font-bold text-primary mb-1">
                  <AnimatedCounter value={value} />
                </div>
                <div className="font-semibold text-xs text-foreground mb-0.5">{label}</div>
                <div className="text-[10px] text-muted-foreground">{desc}</div>
              </FadeIn>
            ))}
          </div>
          </div>
        </section>

        {/* -- AI-friendly facts -- */}
        <section className="py-16 bg-card/60 border-y border-border bg-mesh">
          <div className="container">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="rounded-[24px] border border-border bg-background p-6">
                <h2 className="font-display text-xl font-bold mb-3">Services</h2>
                <ul className="space-y-2 text-xs text-muted-foreground">
                  {[
                    "Business websites",
                    "Mobile apps",
                    "Custom software",
                    "SEO and digital marketing",
                    "Graphic design and branding",
                    "Video editing and motion graphics",
                  ].map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
              <div className="rounded-[24px] border border-border bg-background p-6">
                <h2 className="font-display text-xl font-bold mb-3">Industries</h2>
                <ul className="space-y-2 text-xs text-muted-foreground">
                  {INDUSTRIES.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
              <div className="rounded-[24px] border border-border bg-background p-6">
                <h2 className="font-display text-xl font-bold mb-3">Geography and tech</h2>
                <ul className="space-y-2 text-xs text-muted-foreground">
                  <li>Regions: {SERVICE_REGIONS.join(", ")}</li>
                  <li>Technologies: {TECH_STACK.slice(0, 6).join(", ")}.</li>
                  <li>Delivery style: remote-first with local market focus.</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        <section className="py-20 md:py-28 bg-background relative overflow-hidden bg-mesh">
        <ValuesDots />
        <div className="container relative z-10">
          <FadeIn className="text-center max-w-2xl mx-auto mb-16">
            <span className="section-tag mb-4 block w-fit mx-auto">Our Values</span>
            <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-balance">
              What We Stand For
            </h2>
            <p className="mt-4 text-xs sm:text-sm text-muted-foreground leading-relaxed max-w-md mx-auto">
              Our values shape how we work, how we communicate, and how we deliver results for every partner.
            </p>
          </FadeIn>

          <FadeInStagger className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {VALUES.map((v) => (
              <FadeInItem key={v.title} direction="scale">
                <div className="group h-full rounded-[20px] border border-border bg-card p-6 transition-all duration-300 hover:border-primary/45 hover:shadow-xl-soft">
                  <div className="mb-5 flex h-9 w-9 items-center justify-center rounded-xl bg-[#EEE7DD] text-primary transition-colors duration-300 group-hover:bg-primary group-hover:text-primary-foreground">
                    <v.icon className="h-4.5 w-4.5" />
                  </div>
                  <h3 className="font-display text-sm font-bold mb-2 text-foreground">{v.title}</h3>
                  <p className="text-xs leading-relaxed text-muted-foreground">{v.desc}</p>
                </div>
              </FadeInItem>
            ))}
          </FadeInStagger>
        </div>
        </section>

        {/* -- FAQ -- */}
        <section className="py-20 md:py-28 bg-background relative overflow-hidden bg-mesh">
          <div className="container relative z-10 max-w-4xl">
            <FadeIn className="text-center max-w-2xl mx-auto mb-12">
              <span className="section-tag mb-4 block w-fit mx-auto">FAQ</span>
              <h2 className="font-display text-3xl md:text-4xl font-bold tracking-tight text-balance">
                Common questions answered clearly
              </h2>
              <p className="mt-4 text-xs sm:text-sm text-muted-foreground leading-relaxed">
                These answers are written in a concise format so people and AI systems can quickly extract the business context.
              </p>
            </FadeIn>

            <div className="grid gap-4">
              {ABOUT_FAQ.map((faq) => (
                <details key={faq.question} className="group rounded-[20px] border border-border bg-card p-5 open:shadow-xl-soft">
                  <summary className="cursor-pointer list-none font-display text-base md:text-lg font-bold tracking-tight text-foreground">
                    {faq.question}
                  </summary>
                  <p className="mt-3 text-xs sm:text-sm leading-relaxed text-muted-foreground">
                    {faq.answer}
                  </p>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* -- Founders (Dark Walnut Theme) -- */}
        <section className="relative py-12 md:py-16 bg-dark-surface text-[#F6F2EC] min-h-[100dvh] flex flex-col justify-center overflow-hidden">
        {/* Engineering inspired SVG patterns */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute inset-0 bg-mesh opacity-20" />
          <GalleryBackground />
        </div>
        
        <div className="relative z-10 container">
          <FadeIn className="text-center max-w-lg mx-auto mb-12 shrink-0">
            <span className="inline-flex items-center gap-2 rounded-full border border-[#BFA27A]/20 bg-[#BFA27A]/5 px-3.5 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-[#BFA27A] mb-4">
              Founding Partners
            </span>
            <h2 className="font-display text-3xl md:text-4xl font-bold tracking-tight text-balance text-white">
              Meet the Founders
            </h2>
            <p className="mt-3 text-xs text-stone-400 leading-relaxed">
              Leading our studio with design focus, engineering rigor, and product stewardship.
            </p>
          </FadeIn>

          <FadeInStagger className="grid grid-cols-1 lg:grid-cols-2 gap-8 w-full">
            {FOUNDERS.map((founder) => (
              <FadeInItem key={founder.name} direction="scale">
                <div className="founder-card-container">
                  <div
                    onClick={() => setSelectedFounder(founder)}
                    className="founder-card group relative rounded-[24px] border border-[#4A4038] bg-dark-elevated p-6 transition-all duration-500 hover:border-[#BFA27A]/40 hover:shadow-[0_20px_50px_rgba(191,162,122,0.08)] text-left cursor-pointer flex flex-col md:flex-row items-center md:items-start gap-6 w-full h-full"
                  >
                    {/* Circular Avatar */}
                    <div
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveImageLightbox(founder.image);
                      }}
                      className="h-[130px] w-[130px] rounded-full border-2 border-[#BFA27A]/45 shadow-lg overflow-hidden shrink-0 bg-[#221B17] flex items-center justify-center cursor-zoom-in"
                    >
                      <img
                        src={optimizeImageUrl(founder.image, 260)}
                        alt={founder.name}
                        className={`h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105 ${founder.objectPosition || "object-[center_top]"}`}
                        loading="lazy"
                        width="260"
                        height="260"
                        decoding="async"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = "";
                        }}
                      />
                    </div>

                    {/* Content Details Area */}
                    <div className="flex-1 flex flex-col justify-between h-full space-y-4 text-center md:text-left">
                      <div className="space-y-2">
                        <div className="flex items-center justify-center md:justify-start gap-2">
                          <span className="h-1.5 w-1.5 rounded-full bg-[#BFA27A]" />
                          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#BFA27A]">
                            {founder.role}
                          </span>
                        </div>
                        <h3 className="font-display text-xl sm:text-2xl font-bold text-white tracking-tight transition-colors group-hover:text-[#BFA27A]">
                          {founder.name}
                        </h3>
                        <p className="text-xs text-stone-300 leading-relaxed font-medium">
                          {founder.shortDesc}
                        </p>
                        
                        {/* Expertise Tags */}
                        <div className="flex flex-wrap justify-center md:justify-start gap-1.5 pt-2">
                          {Object.values(founder.skills).flat().slice(0, 5).map((skill) => (
                            <span
                              key={skill}
                              className="text-[9px] font-semibold bg-[#2E2722] text-[#BFA27A] border border-[#4A4038] rounded-full px-2.5 py-0.5"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* CTA Buttons */}
                      <div className="flex flex-wrap justify-center md:justify-start gap-3 pt-2">
                        {founder.linkedin && (
                          <a
                            href={founder.linkedin}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="inline-flex items-center gap-1.5 text-xs font-semibold px-4 py-2 rounded-full bg-[#2E2722] text-[#BFA27A] border border-[#4A4038] hover:bg-[#BFA27A] hover:text-[#1C1612] hover:border-[#BFA27A] transition-all duration-300"
                          >
                            <Linkedin className="h-3.5 w-3.5" /> LinkedIn
                          </a>
                        )}
                        <a
                          href={founder.portfolio || `mailto:${founder.email}`}
                          target={founder.portfolio ? "_blank" : undefined}
                          rel={founder.portfolio ? "noopener noreferrer" : undefined}
                          onClick={(e) => e.stopPropagation()}
                          className="inline-flex items-center gap-1.5 text-xs font-semibold px-4 py-2 rounded-full bg-[#BFA27A]/10 text-white border border-[#BFA27A]/30 hover:bg-[#BFA27A]/20 hover:border-[#BFA27A]/60 transition-all duration-300"
                        >
                          {founder.portfolio ? "Portfolio" : "Contact"}
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </FadeInItem>
            ))}
          </FadeInStagger>

          {/* Center Quote under cards */}
          <FadeIn className="text-center mt-12">
            <p className="font-display italic text-xs md:text-sm text-stone-400 max-w-xl mx-auto leading-relaxed border-t border-[#4A4038]/30 pt-8">
              "Collaborative engineering and design craftsmanship built to power the next generation of digital platforms."
            </p>
          </FadeIn>
        </div>

        {/* Modal Popup for Founder Details */}
        <AnimatePresence>
          {selectedFounder && (
            <div className="fixed inset-0 z-50 flex items-end justify-center p-0 md:items-center md:p-4 bg-background/80 backdrop-blur-sm">
              {/* Backdrop Overlay */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setSelectedFounder(null)}
                className="absolute inset-0 cursor-pointer"
              />

              {/* Modal Card Content */}
              <motion.div
                initial={isMobile ? { y: "100%" } : { opacity: 0, scale: 0.95, y: 15 }}
                animate={isMobile ? { y: 0 } : { opacity: 1, scale: 1, y: 0 }}
                exit={isMobile ? { y: "100%" } : { opacity: 0, scale: 0.95, y: 15 }}
                transition={isMobile ? { type: "spring", damping: 25, stiffness: 220 } : { duration: 0.25, ease: "easeOut" }}
                className={cn(
                  "relative bg-dark-surface shadow-2xl z-10 text-[#F6F2EC] overflow-hidden",
                  isMobile
                    ? "w-full max-w-[92vw] h-[90dvh] max-h-[90dvh] rounded-t-[24px] border-t border-[#4A4038] flex flex-col p-6 pb-[calc(20px+env(safe-area-inset-bottom))] pt-[calc(20px+env(safe-area-inset-top))] space-y-6 overflow-y-auto scrollbar-none"
                    : "w-full max-w-4xl rounded-[24px] border border-[#4A4038] flex flex-col md:flex-row max-h-[90vh]"
                )}
              >
                {isMobile ? (
                  // Mobile Experience Redesign: Single vertical scroll container
                  <>
                    {/* Close Icon Button */}
                    <button
                      onClick={() => setSelectedFounder(null)}
                      className="absolute top-4 right-4 flex h-8 w-8 items-center justify-center rounded-full bg-[#3A312B] text-stone-400 hover:text-white transition-colors border border-[#4A4038] z-20"
                      aria-label="Close modal"
                    >
                      <X className="h-4 w-4" />
                    </button>

                    {/* Founder Image */}
                    <div className="flex justify-center mt-4">
                      <div className="h-32 w-32 rounded-2xl overflow-hidden border border-[#4A4038] shrink-0">
                        <img
                          src={optimizeImageUrl(selectedFounder.image, 260)}
                          alt={selectedFounder.name}
                          className={`h-full w-full object-cover ${selectedFounder.objectPosition || "object-[center_top]"}`}
                          width="260"
                          height="260"
                          decoding="async"
                        />
                      </div>
                    </div>

                    {/* Name & Role */}
                    <div className="text-center">
                      <h3 className="font-display text-2xl font-bold text-white">
                        {selectedFounder.name}
                      </h3>
                      <p className="text-xs font-semibold uppercase tracking-wider text-[#BFA27A] mt-1">
                        {selectedFounder.role}
                      </p>
                    </div>

                    {/* Contact Links */}
                    <div className="space-y-2.5 w-full">
                      {selectedFounder.linkedin && (
                        <a
                          href={selectedFounder.linkedin}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-3 text-xs text-stone-300 hover:text-[#BFA27A] bg-[#2E2722]/60 hover:bg-[#2E2722] border border-[#4A4038] rounded-xl p-3.5 transition-all duration-300 w-full"
                        >
                          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#3A312B] text-[#BFA27A] border border-[#4A4038] shrink-0">
                            <Linkedin className="h-4 w-4" />
                          </span>
                          <div className="flex flex-col min-w-0">
                            <span className="text-[10px] text-stone-400 font-bold uppercase tracking-wider">LinkedIn</span>
                            <span className="truncate text-stone-200">Profile page</span>
                          </div>
                        </a>
                      )}
                      
                      {selectedFounder.email && (
                        <a
                          href={`mailto:${selectedFounder.email}`}
                          className="flex items-center gap-3 text-xs text-stone-300 hover:text-[#BFA27A] bg-[#2E2722]/60 hover:bg-[#2E2722] border border-[#4A4038] rounded-xl p-3.5 transition-all duration-300 w-full"
                        >
                          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#3A312B] text-[#BFA27A] border border-[#4A4038] shrink-0">
                            <Mail className="h-4 w-4" />
                          </span>
                          <div className="flex flex-col min-w-0">
                            <span className="text-[10px] text-stone-400 font-bold uppercase tracking-wider">Email</span>
                            <span className="truncate text-stone-200">{selectedFounder.email}</span>
                          </div>
                        </a>
                      )}

                      {selectedFounder.phone && (
                        <a
                          href={`tel:${selectedFounder.phone}`}
                          className="flex items-center gap-3 text-xs text-stone-300 hover:text-[#BFA27A] bg-[#2E2722]/60 hover:bg-[#2E2722] border border-[#4A4038] rounded-xl p-3.5 transition-all duration-300 w-full"
                        >
                          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#3A312B] text-[#BFA27A] border border-[#4A4038] shrink-0">
                            <Phone className="h-4 w-4" />
                          </span>
                          <div className="flex flex-col min-w-0">
                            <span className="text-[10px] text-stone-400 font-bold uppercase tracking-wider">Phone</span>
                            <span className="truncate text-stone-200">{selectedFounder.phone}</span>
                          </div>
                        </a>
                      )}

                      {selectedFounder.portfolio && (
                        <a
                          href={selectedFounder.portfolio}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-3 text-xs text-stone-300 hover:text-[#BFA27A] bg-[#2E2722]/60 hover:bg-[#2E2722] border border-[#4A4038] rounded-xl p-3.5 transition-all duration-300 w-full"
                        >
                          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#3A312B] text-[#BFA27A] border border-[#4A4038] shrink-0">
                            <Globe className="h-4 w-4" />
                          </span>
                          <div className="flex flex-col min-w-0">
                            <span className="text-[10px] text-stone-400 font-bold uppercase tracking-wider">Portfolio</span>
                            <span className="truncate text-stone-200">Portfolio Link</span>
                          </div>
                        </a>
                      )}
                    </div>

                    {/* Professional Summary */}
                    <div className="space-y-2.5 pt-2">
                      <h4 className="text-[11px] font-bold uppercase tracking-wider text-[#BFA27A] flex items-center gap-1.5 border-b border-[#4A4038]/30 pb-2">
                        <User className="h-4.5 w-4.5" /> Professional Summary
                      </h4>
                      <p className="text-xs sm:text-sm text-stone-300 leading-relaxed">
                        {selectedFounder.summary}
                      </p>
                    </div>

                    {/* Work Experience */}
                    {selectedFounder.experience && selectedFounder.experience.length > 0 && (
                      <div className="space-y-3.5">
                        <h4 className="text-[11px] font-bold uppercase tracking-wider text-[#BFA27A] flex items-center gap-1.5 border-b border-[#4A4038]/30 pb-2">
                          <Briefcase className="h-4.5 w-4.5" /> Work Experience
                        </h4>
                        <div className="space-y-5">
                          {selectedFounder.experience.map((exp, idx) => (
                            <div key={idx} className="border-l-2 border-[#4A4038] pl-4 space-y-1.5">
                              <div className="flex flex-col sm:flex-row justify-between items-start gap-1">
                                <h5 className="text-xs sm:text-sm font-bold text-white">{exp.role}</h5>
                                <span className="text-[10px] text-stone-400 font-semibold">{exp.period}</span>
                              </div>
                              <p className="text-xs text-[#BFA27A] font-semibold">{exp.company}</p>
                              {exp.details && (
                                <ul className="list-disc pl-4 space-y-1 mt-1.5">
                                  {exp.details.map((detail, dIdx) => (
                                    <li key={dIdx} className="text-xs text-stone-300 leading-relaxed">{detail}</li>
                                  ))}
                                </ul>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Technical Skills */}
                    <div className="space-y-3.5">
                      <h4 className="text-[11px] font-bold uppercase tracking-wider text-[#BFA27A] flex items-center gap-1.5 border-b border-[#4A4038]/30 pb-2">
                        <Code className="h-4.5 w-4.5" /> Technical Skills
                      </h4>
                      <div className="space-y-3">
                        {Object.entries(selectedFounder.skills).map(([category, items]) => (
                          <div key={category} className="bg-[#261E1A]/40 rounded-xl p-4 border border-[#4A4038]">
                            <h5 className="text-[10px] font-bold uppercase tracking-wider text-[#BFA27A] mb-2">{category}</h5>
                            <div className="flex flex-wrap gap-1.5">
                              {items.map((skill) => (
                                <span
                                  key={skill}
                                  className="rounded bg-[#3A312B] px-2.5 py-1 text-[10px] font-semibold text-stone-200 border border-[#4A4038]"
                                >
                                  {skill}
                                </span>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Education */}
                    {selectedFounder.education && selectedFounder.education.length > 0 && (
                      <div className="space-y-3.5">
                        <h4 className="text-[11px] font-bold uppercase tracking-wider text-[#BFA27A] flex items-center gap-1.5 border-b border-[#4A4038]/30 pb-2">
                          <GraduationCap className="h-4.5 w-4.5" /> Education
                        </h4>
                        <div className="space-y-4">
                          {selectedFounder.education.map((edu, idx) => (
                            <div key={idx} className="border-l-2 border-[#4A4038] pl-4 space-y-1">
                              <div className="flex flex-col sm:flex-row justify-between items-start gap-1">
                                <h5 className="text-xs sm:text-sm font-bold text-white">{edu.degree}</h5>
                                <span className="text-[10px] text-stone-400 font-semibold">{edu.year}</span>
                              </div>
                              <p className="text-xs text-[#BFA27A] font-semibold">{edu.school}</p>
                              <p className="text-xs text-stone-300 font-medium">Marks: {edu.score}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Certifications / Achievements */}
                    {((selectedFounder.certifications && selectedFounder.certifications.length > 0) ||
                      (selectedFounder.achievements && selectedFounder.achievements.length > 0)) && (
                        <div className="space-y-2.5">
                          <h4 className="text-[11px] font-bold uppercase tracking-wider text-[#BFA27A] flex items-center gap-1.5 border-b border-[#4A4038]/30 pb-2">
                            <Award className="h-4.5 w-4.5" /> {selectedFounder.certifications ? 'Certifications' : 'Achievements'}
                          </h4>
                          <ul className="list-disc pl-4 space-y-1.5">
                            {(selectedFounder.certifications || selectedFounder.achievements).map((item, idx) => (
                              <li key={idx} className="text-xs text-stone-300 leading-relaxed">
                                {item}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                    {/* Hobbies / Languages / Activities */}
                    <div className="grid grid-cols-1 gap-4 pt-4 border-t border-[#4A4038] pb-4">
                      {selectedFounder.languages && (
                        <div className="space-y-1">
                          <h5 className="text-[10px] font-bold uppercase tracking-wider text-[#BFA27A] flex items-center gap-1.5">
                            <Languages className="h-4 w-4" /> Languages
                          </h5>
                          <p className="text-xs text-stone-300 font-medium">{selectedFounder.languages.join(" • ")}</p>
                        </div>
                      )}
                      {selectedFounder.activities && (
                        <div className="space-y-1">
                          <h5 className="text-[10px] font-bold uppercase tracking-wider text-[#BFA27A] flex items-center gap-1.5">
                            <BookOpen className="h-4 w-4" /> Activities
                          </h5>
                          <p className="text-xs text-stone-300 font-medium">{selectedFounder.activities.join(" • ")}</p>
                        </div>
                      )}
                      {selectedFounder.hobbies && (
                        <div className="space-y-1">
                          <h5 className="text-[10px] font-bold uppercase tracking-wider text-[#BFA27A] flex items-center gap-1.5">
                            <Heart className="h-4 w-4" /> Hobbies
                          </h5>
                          <p className="text-xs text-stone-300 font-medium">{selectedFounder.hobbies.join(" • ")}</p>
                        </div>
                      )}
                    </div>
                  </>
                ) : (
                  // Desktop & Tablet Experience: Keep split layout exactly as is
                  <>
                    {/* Close Icon Button */}
                    <button
                      onClick={() => setSelectedFounder(null)}
                      className="absolute top-4 right-4 flex h-8 w-8 items-center justify-center rounded-full bg-[#3A312B] text-stone-400 hover:text-white transition-colors border border-[#4A4038] z-20"
                      aria-label="Close modal"
                    >
                      <X className="h-4 w-4" />
                    </button>

                    {/* Left Sidebar Column */}
                    <div className="w-full md:w-[300px] bg-[#221B17] border-b md:border-b-0 md:border-r border-[#4A4038] p-8 flex flex-col items-center shrink-0">
                      {/* Portrait photo */}
                      <div className="h-28 w-28 rounded-2xl overflow-hidden border border-[#4A4038] mb-5">
                        <img
                          src={optimizeImageUrl(selectedFounder.image, 240)}
                          alt={selectedFounder.name}
                          className={`h-full w-full object-cover ${selectedFounder.objectPosition || "object-[center_top]"}`}
                          width="240"
                          height="240"
                          decoding="async"
                        />
                      </div>

                      <h3 className="font-display text-base md:text-lg font-bold text-white text-center">
                        {selectedFounder.name}
                      </h3>
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-[#BFA27A] text-center mt-1">
                        {selectedFounder.role}
                      </p>

                      {/* Direct Contact Links */}
                      <div className="w-full border-t border-[#4A4038] mt-6 pt-6 space-y-3.5">
                        <h4 className="text-[9px] font-bold uppercase tracking-wider text-stone-400 mb-2">Direct Links</h4>

                        {/* LinkedIn */}
                        {selectedFounder.linkedin && (
                          <a
                            href={selectedFounder.linkedin}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-3 text-xs text-stone-300 hover:text-[#BFA27A] transition-colors"
                          >
                            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#3A312B] text-[#BFA27A] border border-[#4A4038]">
                              <Linkedin className="h-4.5 w-4.5" />
                            </span>
                            <span className="truncate">LinkedIn Profile</span>
                          </a>
                        )}

                        {/* Email */}
                        {selectedFounder.email && (
                          <a
                            href={`mailto:${selectedFounder.email}`}
                            className="flex items-center gap-3 text-xs text-stone-300 hover:text-[#BFA27A] transition-colors"
                          >
                            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#3A312B] text-[#BFA27A] border border-[#4A4038]">
                              <Mail className="h-4.5 w-4.5" />
                            </span>
                            <span className="truncate">{selectedFounder.email}</span>
                          </a>
                        )}

                        {/* Phone */}
                        {selectedFounder.phone && (
                          <a
                            href={`tel:${selectedFounder.phone}`}
                            className="flex items-center gap-3 text-xs text-stone-300 hover:text-[#BFA27A] transition-colors"
                          >
                            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#3A312B] text-[#BFA27A] border border-[#4A4038]">
                              <Phone className="h-4.5 w-4.5" />
                            </span>
                            <span>{selectedFounder.phone}</span>
                          </a>
                        )}

                        {/* Portfolio */}
                        {selectedFounder.portfolio && (
                          <a
                            href={selectedFounder.portfolio}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-3 text-xs text-stone-300 hover:text-[#BFA27A] transition-colors"
                          >
                            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#3A312B] text-[#BFA27A] border border-[#4A4038]">
                              <Globe className="h-4.5 w-4.5" />
                            </span>
                            <span className="truncate">Portfolio Link</span>
                          </a>
                        )}
                      </div>
                    </div>

                    {/* Right Scrollable Content Column */}
                    <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6 text-left max-h-[50vh] md:max-h-[none]">
                      {/* Summary */}
                      <div className="space-y-2">
                        <h4 className="text-[10px] font-bold uppercase tracking-wider text-[#BFA27A] flex items-center gap-1.5">
                          <User className="h-4 w-4" /> Professional Summary
                        </h4>
                        <p className="text-xs text-stone-300 leading-relaxed">
                          {selectedFounder.summary}
                        </p>
                      </div>

                      {/* Experience */}
                      {selectedFounder.experience && selectedFounder.experience.length > 0 && (
                        <div className="space-y-3">
                          <h4 className="text-[10px] font-bold uppercase tracking-wider text-[#BFA27A] flex items-center gap-1.5">
                            <Briefcase className="h-4 w-4" /> Work Experience
                          </h4>
                          <div className="space-y-4">
                            {selectedFounder.experience.map((exp, idx) => (
                              <div key={idx} className="border-l border-[#4A4038] pl-3 space-y-1">
                                <div className="flex justify-between items-start gap-4">
                                  <h5 className="text-xs font-bold text-white">{exp.role}</h5>
                                  <span className="text-[9px] text-stone-400 shrink-0 font-semibold">{exp.period}</span>
                                </div>
                                <p className="text-[11px] text-[#BFA27A]">{exp.company}</p>
                                {exp.details && (
                                  <ul className="list-disc pl-3.5 space-y-0.5 mt-1">
                                    {exp.details.map((detail, dIdx) => (
                                      <li key={dIdx} className="text-[10px] text-stone-300 leading-relaxed">{detail}</li>
                                    ))}
                                  </ul>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Education */}
                      {selectedFounder.education && selectedFounder.education.length > 0 && (
                        <div className="space-y-3">
                          <h4 className="text-[10px] font-bold uppercase tracking-wider text-[#BFA27A] flex items-center gap-1.5">
                            <GraduationCap className="h-4 w-4" /> Education
                          </h4>
                          <div className="space-y-3">
                            {selectedFounder.education.map((edu, idx) => (
                              <div key={idx} className="border-l border-[#4A4038] pl-3 space-y-0.5">
                                <div className="flex justify-between items-start gap-4">
                                  <h5 className="text-xs font-bold text-white">{edu.degree}</h5>
                                  <span className="text-[9px] text-stone-400 shrink-0 font-semibold">{edu.year}</span>
                                </div>
                                <p className="text-[11px] text-[#BFA27A]">{edu.school}</p>
                                <p className="text-[10px] text-stone-300 font-medium">Marks: {edu.score}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Technical Skills */}
                      <div className="space-y-3">
                        <h4 className="text-[10px] font-bold uppercase tracking-wider text-[#BFA27A] flex items-center gap-1.5">
                          <Code className="h-4 w-4" /> Technical Skills
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {Object.entries(selectedFounder.skills).map(([category, items]) => (
                            <div key={category} className="bg-[#261E1A]/40 rounded-xl p-3 border border-[#4A4038]">
                              <h5 className="text-[9px] font-bold uppercase tracking-wider text-[#BFA27A] mb-1.5">{category}</h5>
                              <div className="flex flex-wrap gap-1">
                                {items.map((skill) => (
                                  <span
                                    key={skill}
                                    className="rounded bg-[#3A312B] px-2 py-0.5 text-[9px] font-semibold text-stone-200"
                                  >
                                    {skill}
                                  </span>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Certifications / Achievements */}
                      {((selectedFounder.certifications && selectedFounder.certifications.length > 0) ||
                        (selectedFounder.achievements && selectedFounder.achievements.length > 0)) && (
                          <div className="space-y-2">
                            <h4 className="text-[10px] font-bold uppercase tracking-wider text-[#BFA27A] flex items-center gap-1.5">
                              <Award className="h-4 w-4" /> {selectedFounder.certifications ? 'Certifications' : 'Achievements'}
                            </h4>
                            <ul className="list-disc pl-3.5 space-y-1">
                              {(selectedFounder.certifications || selectedFounder.achievements).map((item, idx) => (
                                <li key={idx} className="text-[10px] text-stone-300 leading-relaxed">
                                  {item}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                      {/* Hobbies / Languages / Activities */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-[#4A4038]">
                        {selectedFounder.languages && (
                          <div className="space-y-1">
                            <h5 className="text-[9px] font-bold uppercase tracking-wider text-[#BFA27A] flex items-center gap-1.5">
                              <Languages className="h-3.5 w-3.5" /> Languages
                            </h5>
                            <p className="text-[10px] text-stone-300 font-medium">{selectedFounder.languages.join(" • ")}</p>
                          </div>
                        )}
                        {selectedFounder.activities && (
                          <div className="space-y-1">
                            <h5 className="text-[9px] font-bold uppercase tracking-wider text-[#BFA27A] flex items-center gap-1.5">
                              <BookOpen className="h-3.5 w-3.5" /> Activities
                            </h5>
                            <p className="text-[10px] text-stone-300 font-medium">{selectedFounder.activities.join(" • ")}</p>
                          </div>
                        )}
                        {selectedFounder.hobbies && (
                          <div className="space-y-1">
                            <h5 className="text-[9px] font-bold uppercase tracking-wider text-[#BFA27A] flex items-center gap-1.5">
                              <Heart className="h-3.5 w-3.5" /> Hobbies
                            </h5>
                            <p className="text-[10px] text-stone-300 font-medium">{selectedFounder.hobbies.join(" • ")}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </>
                )}
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Lightbox Modal for Founder Image */}
        <AnimatePresence>
          {activeImageLightbox && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setActiveImageLightbox(null)}
                className="absolute inset-0 cursor-zoom-out"
              />

              {/* Lightbox Content */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.25 }}
                className="relative max-w-full max-h-[85vh] z-10 overflow-hidden rounded-xl border border-stone-800 bg-black flex items-center justify-center"
              >
                {/* Close Button */}
                <button
                  onClick={() => setActiveImageLightbox(null)}
                  className="absolute top-3 right-3 flex h-8 w-8 items-center justify-center rounded-full bg-black/70 text-stone-300 hover:text-white transition-colors border border-stone-800"
                  aria-label="Close preview"
                >
                  <X className="h-4 w-4" />
                </button>

                <img
                  src={optimizeImageUrl(activeImageLightbox, 1200)}
                  alt="Founder Preview"
                  className="max-w-full max-h-[80vh] object-contain bg-white rounded-lg"
                  width="1200"
                  height="1200"
                  decoding="async"
                />
              </motion.div>
            </div>
          )}
        </AnimatePresence>
        </section>
      </main>

      {/* -- CTA -- */}
      <section className="py-20 md:py-28 bg-background relative overflow-hidden">
        <div className="container">
          <FadeIn className="relative overflow-hidden rounded-[20px] border border-[#4A4038] bg-dark-surface text-[#F6F2EC] text-center p-10 md:p-16">
            <DarkWarmAccentBackground />
            <div className="relative z-10 flex flex-col items-center">
              <span className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#BFA27A]/20 bg-[#BFA27A]/5 px-3.5 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-[#BFA27A] mx-auto w-fit">
                Get Started
              </span>
            <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-5 tracking-tight text-balance">
              Ready to build something <span className="italic text-[#BFA27A] font-normal">exceptional?</span>
            </h2>
            <p className="text-xs sm:text-sm text-stone-300 max-w-lg mx-auto mb-10 leading-relaxed">
              Let's start a project. Tell us about your timelines, goals, and constraints. You'll get a direct, practical recommendation from our partners.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button
                size="lg"
                className="h-11 rounded-full bg-primary hover:bg-[#5A3728] text-primary-foreground font-medium px-8 border-none shadow-none text-sm w-full sm:w-auto animate-none"
                asChild
              >
                <Link to={publicRoutes.contact}>Start a Conversation</Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="h-11 rounded-full border-[#4A4038] bg-transparent text-white hover:bg-[#4A4038] font-medium px-8 text-sm w-full sm:w-auto"
                asChild
              >
                <Link to={publicRoutes.portfolio}>
                  View Our Work <ArrowRight className="ml-1 h-3.5 w-3.5" />
                </Link>
              </Button>
            </div>
          </div>
        </FadeIn>
        </div>
      </section>
    </>
  );
}
