export type TeamMember = {
  name: string;
  role: string;
  track: string;
  initials: string;
  imageUrl?: string | null;
  linkedinUrl?: string | null;
  email?: string | null;
};

export type YearTeam = { year: string; members: TeamMember[] };

export function getYearTeams(team: NonNullable<SiteContent["teamPage"]>): YearTeam[] {
  return team.yearlyTeams ?? [
    { year: "2026", members: team.currentMembers },
    ...team.pastTeams.map((past) => ({
      year: past.year,
      members: past.members.map((name) => ({
        name, role: "Committee member", track: "", initials: name.split(/\s+/).map((part) => part[0]).join("").slice(0, 2),
      })),
    })),
  ];
}

export type SiteContent = {
  hero: {
    eyebrow: string;
    title: string;
    highlightedTitle: string;
    description: string;
    stats: Array<{ value: string; label: string }>;
  };
  about: {
    eyebrow: string;
    title: string;
    highlightedWords: string;
    accentWords: string;
    copy: string;
    quote: string;
    quoteBy: string;
    storyCards?: Array<{ title: string; copy: string }>;
    values?: Array<{ title: string; copy: string }>;
    milestones?: string[];
    pillars: Array<{
      icon: "lightbulb" | "mic" | "brain" | "network";
      title: string;
      copy: string;
      accent?: boolean;
    }>;
  };
  events: Array<{
    tag: string;
    title: string;
    description: string;
    icon: "mic" | "brain" | "lightbulb";
    badge: string;
    featured?: boolean;
    dateLabel: string;
    imageUrl?: string | null;
    registrationUrl?: string | null;
  }>;
  journeyTracks: Array<{
    title: string;
    subtitle: string;
    description: string;
    badge: string;
    icon: "mic" | "graduation" | "sparkles" | "brain" | "users";
  }>;
  gallery: Array<{
    image: "gallery-1" | "gallery-2" | "gallery-3" | "gallery-4";
    alt: string;
    caption: string;
    span?: string;
    imageUrl?: string | null;
  }>;
  awards: {
    title: string;
    awardName: string;
    program: string;
    description: string;
    label: string;
  };
  partners: string[];
  connected: {
    title: string;
    copy: string;
    primaryCta: string;
    secondaryCta: string;
  };
  contact: {
    email: string;
    whatsappLabel: string;
    organization: string;
    copy: string;
  };
  teamPage?: {
    yearlyTeams?: YearTeam[];
    eyebrow: string;
    title: string;
    highlightedTitle: string;
    description: string;
    currentMembers: Array<{
      name: string;
      role: string;
      track: string;
      initials: string;
      imageUrl?: string | null;
      linkedinUrl?: string | null;
      email?: string | null;
    }>;
    pastTeams: Array<{ year: string; theme: string; members: string[] }>;
    workAreas: string[];
  };
};

export type ContactMessage = {
  id: string;
  name: string;
  email: string;
  topic: string;
  message: string;
  createdAt: string;
};

export const defaultSiteContent: SiteContent = {
  hero: {
    eyebrow: "IEEE Young Professionals Sri Lanka",
    title: "Where Future Professionals Meet",
    highlightedTitle: "Industry Leaders",
    description:
      "From inspiring leadership talks to hands-on workshops, IEEE LETs talk brings students and industry together to learn, collaborate, and create what's next. Experience real stories, real leaders, and real opportunities that shape the next generation of professionals with us.",
    stats: [
      { value: "50+", label: "Events" },
      { value: "4000+", label: "Participants" },
      { value: "30+", label: "Industry Leaders" },
    ],
  },
  about: {
    eyebrow: "About LETs talk",
    title: "Empowering Careers Through",
    highlightedWords: "Conversations, Learning",
    accentWords: "Leadership",
    copy: "IEEE LETs Talk is the flagship professional development initiative of IEEE Young Professionals Sri Lanka. Since 2017, it has connected students, graduates, and young professionals with industry experts through leadership talks, technical workshops, networking experiences, and career-focused learning opportunities that bridge the gap between academia and industry.",
    quote:
      "Bridging the gap between academia and industry by turning passion and curiosity into career-defining professional opportunities.",
    quoteBy: "IEEE Young Professionals Sri Lanka",
    storyCards: [
      {
        title: "Our Purpose",
        copy: "To help future professionals discover direction, sharpen skills, and learn from real industry journeys.",
      },
      {
        title: "Our Audience",
        copy: "Students, graduates, young professionals, volunteers, and partners who believe learning grows stronger through community.",
      },
      {
        title: "Our Format",
        copy: "Leadership talks, technical workshops, networking experiences, and career conversations that make professional growth practical.",
      },
      {
        title: "Our Standard",
        copy: "Experiences that are useful, welcoming, professionally organized, and aligned with IEEE's mission of advancing technology for humanity.",
      },
    ],
    values: [
      {
        title: "Industry Connection",
        copy: "We create room for students, graduates, young professionals, and experienced leaders to meet through meaningful learning experiences.",
      },
      {
        title: "Practical Learning",
        copy: "Our sessions turn professional advice, technical knowledge, and career guidance into usable next steps.",
      },
      {
        title: "Leadership Growth",
        copy: "LETs Talk helps future professionals build the confidence, clarity, and networks needed to lead well.",
      },
      {
        title: "Community Impact",
        copy: "We work with IEEE communities and industry partners to make career development more accessible across Sri Lanka.",
      },
    ],
    milestones: [
      "Launched as a national professional development initiative",
      "Expanded into leadership talks, workshops, and career-focused tracks",
      "Connected students and young professionals with industry experts",
      "Recognized for collaborative impact through IEEE Sri Lanka Section awards",
    ],
    pillars: [
      {
        icon: "lightbulb",
        title: "Industry Insights",
        copy: "Learn directly from founders, CEOs, technology leaders, and experienced professionals who share real-world knowledge and practical career advice.",
        accent: true,
      },
      {
        icon: "mic",
        title: "Leadership Talks",
        copy: "Gain valuable perspectives through Road to Ignite sessions featuring inspiring conversations on leadership, entrepreneurship, innovation, and personal growth.",
      },
      {
        icon: "brain",
        title: "Hands-on Workshops",
        copy: "Build practical skills through interactive workshops designed with industry experts across software engineering, project management, business analysis, data science, cybersecurity, and more.",
      },
      {
        icon: "network",
        title: "Professional Network",
        copy: "Connect with students, graduates, industry professionals, ecosystem partners, and the wider IEEE community while building meaningful professional relationships.",
      },
    ],
  },
  events: [
    {
      tag: "Leadership Talk",
      title: "Road to Ignite - Session 12",
      description:
        "Inspiring conversations featuring experienced leaders exploring leadership, innovation, and career trajectories.",
      icon: "mic",
      badge: "Session 12",
      featured: true,
      dateLabel: "Coming Soon",
    },
    {
      tag: "Hands-on Workshop",
      title: "Data Science Workshop",
      description:
        "Interactive, practical session on data analysis, machine learning pipelines, and industry applications.",
      icon: "brain",
      badge: "Technical Series",
      dateLabel: "Coming Soon",
    },
    {
      tag: "Special Edition",
      title: "InsightX - Beyond the Model",
      description:
        "Deep dive into advanced predictive concepts, architecture design, and translating models into business value.",
      icon: "lightbulb",
      badge: "Industry Insights",
      dateLabel: "Coming Soon",
    },
  ],
  journeyTracks: [
    {
      title: "Road to Ignite",
      subtitle: "Leadership talk series",
      description:
        "Inspiring conversations on leadership, entrepreneurship, innovation, and personal growth with prominent leaders.",
      badge: "Flagship Talk Series",
      icon: "mic",
    },
    {
      title: "Upskill",
      subtitle: "Career & skills accelerator",
      description:
        "Dedicated tracks focusing on high-demand technical capabilities, interview mastery, and professional development.",
      badge: "Skill Acceleration",
      icon: "graduation",
    },
    {
      title: "Creative Sri Lanka",
      subtitle: "Innovation & creative tech",
      description:
        "Spotlighting creativity, design thinking, product innovation, and multi-disciplinary leadership.",
      badge: "Creative Series",
      icon: "sparkles",
    },
    {
      title: "Workshop Series",
      subtitle: "Hands-on engineering tracks",
      description:
        "Interactive masterclasses covering software engineering, PM, business analysis, data science, cybersecurity, and beyond.",
      badge: "Interactive Labs",
      icon: "brain",
    },
    {
      title: "YPSL Summit",
      subtitle: "IEEE Young Professionals Sri Lanka",
      description:
        "Annual premier convention gathering young engineers, researchers, mentors, and industry pioneers under one roof.",
      badge: "National Summit",
      icon: "users",
    },
  ],
  gallery: [
    {
      image: "gallery-1",
      alt: "Keynote speaker addressing an audience at an IEEE LETs Talk session",
      caption: "Inspiring conversations with industry leaders",
      span: "sm:col-span-2 sm:row-span-2",
    },
    {
      image: "gallery-2",
      alt: "Mentor guiding students during a hands-on engineering workshop",
      caption: "Hands-on interactive workshops",
    },
    {
      image: "gallery-3",
      alt: "Young professionals networking during a conference break",
      caption: "Empowering network & collaboration",
    },
    {
      image: "gallery-4",
      alt: "Panel of speakers on stage during an IEEE LETs Talk discussion",
      caption: "Cross-disciplinary knowledge exchange",
      span: "sm:col-span-2",
    },
  ],
  awards: {
    title: "Recognized for Creating Real Industry Impact.",
    awardName: "Best Industry Collaborative Project Award",
    program:
      "IEEE Sri Lanka Section Awards - Vision to Value - The Business Analysis Experience Program",
    description:
      "The recognition celebrates our success in bridging the gap between academia and industry through practical, experience-driven learning, meaningful industry collaboration, and career-focused skill development.",
    label: "Award Winner",
  },
  partners: [
    "IEEE Sri Lanka Section",
    "IEEE Young Professionals",
    "IEEE Computer Society",
    "IEEE Power & Energy",
    "IEEE WIE Affinity",
    "Industry Tech Partners",
  ],
  connected: {
    title: "Stay Connected with LETs Talk.",
    copy: "Be the first to hear about upcoming leadership talks, workshops, networking events, and exclusive opportunities. Join our WhatsApp Channel and stay connected with the LETs Talk community.",
    primaryCta: "Join Our WhatsApp Channel",
    secondaryCta: "Explore Events",
  },
  contact: {
    email: "contact@ieeeyp.lk",
    whatsappLabel: "Official WhatsApp Channel",
    organization: "IEEE Young Professionals Sri Lanka",
    copy: "Reach out to propose a session topic, collaborate as an industry partner, or connect with the IEEE Young Professionals Sri Lanka team.",
  },
  teamPage: {
    eyebrow: "Meet the team",
    title: "The people behind",
    highlightedTitle: "IEEE LETs Talk",
    description:
      "A volunteer-led organizing team building speaker sessions, workshops, partnerships, and community experiences for future professionals across Sri Lanka.",
    currentMembers: Array.from({ length: 16 }, (_, index) => ({
      name: `Team Member ${String(index + 1).padStart(2, "0")}`,
      role:
        [
          "Project Lead",
          "Program Co-Lead",
          "Program Co-Lead",
          "Operations Lead",
          "Partnerships Lead",
          "Speaker Relations",
          "Marketing Lead",
          "Content Lead",
          "Creative Lead",
          "Social Media Lead",
          "Finance Lead",
          "Volunteer Lead",
          "Registration Lead",
          "Technical Lead",
          "Documentation Lead",
          "Experience Lead",
        ][index] ?? "Committee Member",
      track:
        [
          "Strategy",
          "Programs",
          "Sessions",
          "Logistics",
          "Industry",
          "Outreach",
          "Brand",
          "Editorial",
          "Design",
          "Digital",
          "Budgeting",
          "People",
          "Audience",
          "Platforms",
          "Reports",
          "Community",
        ][index] ?? "Team",
      initials: String(index + 1).padStart(2, "0"),
    })),
    pastTeams: [
      {
        year: "2025",
        theme: "Expanded workshops and industry conversations",
        members: ["Past Member 01", "Past Member 02", "Past Member 03", "Past Member 04", "Past Member 05", "Past Member 06"],
      },
      {
        year: "2024",
        theme: "Strengthened partnerships and student branch reach",
        members: ["Past Member 07", "Past Member 08", "Past Member 09", "Past Member 10", "Past Member 11", "Past Member 12"],
      },
      {
        year: "2023",
        theme: "Built the foundation for a national learning platform",
        members: ["Past Member 13", "Past Member 14", "Past Member 15", "Past Member 16", "Past Member 17", "Past Member 18"],
      },
    ],
    workAreas: ["Program planning", "Speaker coordination", "Partner engagement", "Brand and media"],
  },
};
