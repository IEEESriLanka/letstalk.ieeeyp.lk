export type TeamMember = {
  name: string;
  role: string;
  track: string;
  initials: string;
  imageUrl?: string | null;
  imagePosition?: string | null;
  linkedinUrl?: string | null;
  email?: string | null;
};

export type YearTeam = { year: string; members: TeamMember[] };

export function getYearTeams(team: NonNullable<SiteContent["teamPage"]>): YearTeam[] {
  const definedYearly = team.yearlyTeams ?? [];
  const hasCurrentYear = definedYearly.some((y) => y.year === "2026");
  const baseTeams: YearTeam[] = hasCurrentYear
    ? [...definedYearly]
    : [{ year: "2026", members: team.currentMembers }, ...definedYearly];

  const existingYears = new Set(baseTeams.map((y) => y.year));
  const extraPast = team.pastTeams
    .filter((past) => !existingYears.has(past.year))
    .map((past) => ({
      year: past.year,
      members: past.members.map((name) => ({
        name,
        role: "Committee member",
        track: "",
        initials: name
          .split(/\s+/)
          .map((part) => part[0])
          .join("")
          .slice(0, 2),
      })),
    }));

  return [...baseTeams, ...extraPast];
}

export type SiteContent = {
  hero: {
    eyebrow: string;
    title: string;
    highlightedTitle: string;
    description: string;
    backgroundImages?: string[];
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
  videoLinks?: Array<{ url: string; title: string }>;
  partnerLogos?: Array<{ name: string; logoUrl: string }>;
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
      imagePosition?: string | null;
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
    backgroundImages: [],
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
    currentMembers: [
      {
        name: "Nishara Fernando",
        role: "Chairperson",
        track: "Strategy",
        initials: "NF",
        imageUrl: "/team/2026/01-nishara-fernando.jpeg",
        imagePosition: "center 20%",
        linkedinUrl: "https://www.linkedin.com/in/nishara-fernando-526921265/",
        email: "nishara.fernando@ieee.org",
      },
      {
        name: "Minesi Rajapaksha",
        role: "Secretary",
        track: "Programs",
        initials: "MR",
        imageUrl: "/team/2026/02-minesi-rajapaksha.jpeg",
        imagePosition: "center 15%",
        linkedinUrl: "https://www.linkedin.com/in/minesi-rajapaksha-a9a631303/",
        email: "minesi@ieee.org",
      },
      {
        name: "Themiya Nanayakkara",
        role: "Finance VC",
        track: "Sessions",
        initials: "TN",
        imageUrl: "/team/2026/03-themiya-nanayakkara.jpg",
        imagePosition: "center 15%",
        linkedinUrl: "https://www.linkedin.com/in/themiya-nanayakkara-7b1759290/",
        email: "theminana03@gmail.com",
      },
      {
        name: "Pramod Naranpanawa",
        role: "Public Visibility VC",
        track: "Logistics",
        initials: "PN",
        imageUrl: "/team/2026/04-pramod-naranpanawa.jpg",
        imagePosition: "center 15%",
        linkedinUrl: "https://www.linkedin.com/in/pramod-naranpanawa-1394772a4/",
        email: "pramodnaranpanawa2001@gmail.com",
      },
      {
        name: "Branavan Kuganeshan",
        role: "Program VC",
        track: "Industry",
        initials: "BK",
        imageUrl: "/team/2026/05-branavan-kuganeshan.jpg",
        imagePosition: "center 15%",
        linkedinUrl: "https://www.linkedin.com/in/branavan-kuganesan-548244307/",
        email: "branavan09@gmail.com",
      },
      {
        name: "Ruwanya Athukorala",
        role: "Coordinator",
        track: "Outreach",
        initials: "RA",
        imageUrl: "/team/2026/06-ruwanya-athukorala.jpg",
        imagePosition: "center 15%",
        linkedinUrl: "https://www.linkedin.com/in/ruwanya-athukorala/",
      },
      {
        name: "Vilochana Vidumini",
        role: "Coordinator",
        track: "Brand",
        initials: "VV",
        imageUrl: "/team/2026/07-vilochana-vidumini.jpg",
        imagePosition: "center 18%",
        linkedinUrl: "https://www.linkedin.com/in/vilochana-vidumini-73846026a/",
      },
      {
        name: "Chamodya Perera",
        role: "Coordinator",
        track: "Editorial",
        initials: "CP",
        imageUrl: "/team/2026/08-chamodya-perera.jpeg",
        imagePosition: "center 15%",
        linkedinUrl: "https://www.linkedin.com/in/chamodyaperera/",
      },
      {
        name: "Nandun Senaratne",
        role: "Coordinator",
        track: "Design",
        initials: "NS",
        imageUrl: "/team/2026/09-nandun-senaratne.jpeg",
        imagePosition: "center 15%",
        linkedinUrl: "https://www.linkedin.com/in/nandunsenaratne/",
      },
      {
        name: "Vihanga Janith",
        role: "Coordinator",
        track: "Digital",
        initials: "VJ",
        imageUrl: "/team/2026/10-vihanga-janith.jpg",
        imagePosition: "center 15%",
        linkedinUrl: "https://www.linkedin.com/in/vihanga-kulathilake/",
      },
      {
        name: "Rumeth Sathnidu",
        role: "Coordinator",
        track: "Budgeting",
        initials: "RS",
        imageUrl: "/team/2026/11-rumeth-sathnidu.png",
        imagePosition: "center 15%",
        linkedinUrl: "https://www.linkedin.com/in/rumethsathnidu/",
      },
      {
        name: "Hirumal Marasinghe",
        role: "Coordinator",
        track: "People",
        initials: "HM",
        imageUrl: "/team/2026/12-hirumal-marasinghe.png",
        imagePosition: "center 18%",
        linkedinUrl: "https://www.linkedin.com/in/hirumal-marasinghe-111a7135a/",
      },
      {
        name: "Chanupa Niduwara",
        role: "Coordinator",
        track: "Platforms",
        initials: "CN",
        imageUrl: "/team/2026/13-chanupa-niduwara.jpg",
        imagePosition: "center 14%",
        linkedinUrl: "https://www.linkedin.com/in/chanupa-niduwara/",
      },
      {
        name: "Manusha Jayawardhana",
        role: "Coordinator",
        track: "Operations",
        initials: "MJ",
        imageUrl: "/team/2026/14-manusha-jayawardhana.png",
        imagePosition: "center 20%",
        linkedinUrl: "https://www.linkedin.com/in/manusha-jayawardhana-471a5b25a/",
      },
      {
        name: "Vinal De Silva",
        role: "Coordinator",
        track: "Operations",
        initials: "VS",
        imageUrl: "/team/2026/15-vinal-de-silva.jpg",
        imagePosition: "center 14%",
        linkedinUrl: "https://www.linkedin.com/in/vinal-de-silva-510b04359/",
      },
    ],
    yearlyTeams: [
      {
        year: "2025",
        members: [
          {
            name: "Sanduni Ranawaka",
            role: "Chairperson",
            track: "",
            initials: "SR",
            imageUrl: "/team/2025/01-sanduni-ranawaka.png",
            imagePosition: "center 18%",
            linkedinUrl: "https://www.linkedin.com/in/sanduni-ranawaka-98a591205/",
            email: "sanduni.ranawake@gmail.com",
          },
          {
            name: "Nishara Fernando",
            role: "Secretary",
            track: "",
            initials: "NF",
            imageUrl: "/team/2025/02-nishara-fernando.jpg",
            imagePosition: "center 18%",
            linkedinUrl: "https://www.linkedin.com/in/nishara-fernando-526921265/",
            email: "nishara.fernando@ieee.org",
          },
          {
            name: "Sachini Thakshila",
            role: "Finance VC",
            track: "",
            initials: "ST",
            imageUrl: "/team/2025/03-shachini-thakshila.jpg",
            imagePosition: "center 16%",
            linkedinUrl: "https://www.linkedin.com/in/shachini-thakshila/",
          },
          {
            name: "Nuwanadun Kalhara",
            role: "Public Visibility VC",
            track: "",
            initials: "NK",
            imageUrl: "/team/2025/04-nuwandun-kalhara.jpg",
            imagePosition: "center 15%",
            linkedinUrl: "https://www.linkedin.com/in/nuwanandun-kalhara-71858a2a6/",
            email: "kalharanuwan8@gmail.com",
          },
          {
            name: "Vayoni Gamage",
            role: "Program VC",
            track: "",
            initials: "VG",
            imageUrl: "/team/2025/05-vayoni-gamage.jpg",
            imagePosition: "center 15%",
            linkedinUrl: "https://www.linkedin.com/in/vayoni-gamage/",
            email: "vayonithathsarani2770@gmail.com",
          },
          {
            name: "Minesi Rajapaksha",
            role: "Coordinator",
            track: "",
            initials: "MR",
            imageUrl: "/team/2025/06-minesi-rajapaksha.jpg",
            imagePosition: "center 18%",
            linkedinUrl: "https://www.linkedin.com/in/minesi-rajapaksha-a9a631303/",
          },
          {
            name: "Atheesha Shanthakumar",
            role: "Coordinator",
            track: "",
            initials: "AS",
            imageUrl: "/team/2025/07-atheesha-shanthakumar.png",
            imagePosition: "center 15%",
            linkedinUrl: "https://www.linkedin.com/in/atheesha-shanthakumar-89303538a/",
          },
          {
            name: "Dahamya Ranasinghe",
            role: "Coordinator",
            track: "",
            initials: "DR",
            imageUrl: "/team/2025/08-dahamya-ranasinghe.jpg",
            imagePosition: "center 18%",
            linkedinUrl: "https://www.linkedin.com/in/dahamya-ranasinghe-1985a3311/",
          },
          {
            name: "Hashan Maduwantha",
            role: "Coordinator",
            track: "",
            initials: "HM",
            imageUrl: "/team/2025/09-hashan-maduwantha.png",
            imagePosition: "center 15%",
            linkedinUrl: "https://www.linkedin.com/in/hashan-maduwantha/",
          },
          {
            name: "Sharen Jeevendran",
            role: "Coordinator",
            track: "",
            initials: "SJ",
            imageUrl: "/team/2025/10-sharaen-jeevendran.jpg",
            imagePosition: "center 18%",
          },
          {
            name: "Vindya Nayana Kanthi",
            role: "Coordinator",
            track: "",
            initials: "VN",
            imageUrl: "/team/2025/11-vindya-nayanakanthi.jpg",
            imagePosition: "center 18%",
            linkedinUrl: "https://www.linkedin.com/in/vindya-nayana/",
          },
          {
            name: "Amritha Balendran",
            role: "Coordinator",
            track: "",
            initials: "AB",
            imageUrl: "/team/2025/12-amirtha-balendran.jpg",
            imagePosition: "center 15%",
            linkedinUrl: "https://www.linkedin.com/in/amirtha-balendran/",
          },
          {
            name: "Thumindu Senarathna",
            role: "Coordinator",
            track: "",
            initials: "TS",
            imageUrl: "/team/2025/13-thumindu-senaratna.jpg",
            imagePosition: "center 15%",
            linkedinUrl: "https://www.linkedin.com/in/thumindu-senaratna-76ba4928/",
          },
          {
            name: "Janith Chamikara",
            role: "Coordinator",
            track: "",
            initials: "JC",
            imageUrl: "/team/2025/14-janith-chamikara.jpg",
            imagePosition: "center 15%",
            linkedinUrl: "https://www.linkedin.com/in/janith-chamikara/",
          },
          {
            name: "Samudra de Silva",
            role: "Coordinator",
            track: "",
            initials: "SS",
            imageUrl: "/team/2025/15-samudra-de-silva.jpg",
            imagePosition: "center 15%",
            linkedinUrl: "https://www.linkedin.com/in/samudradesilva/",
          },
        ],
      },
      {
        year: "2024",
        members: [
          {
            name: "Charuka Atapattu",
            role: "Chairperson",
            track: "",
            initials: "CA",
            imageUrl: "/team/2024/01-charuka-atapattu.jpg",
            imagePosition: "center 15%",
            linkedinUrl: "https://www.linkedin.com/in/charukaatapattu/",
          },
          {
            name: "Yashodha Athapattu",
            role: "Secretary",
            track: "",
            initials: "YA",
            imageUrl: "/team/2024/02-yashodha-athapattu.png",
            imagePosition: "center 18%",
            linkedinUrl: "https://www.linkedin.com/in/yashodha-athapattu-883228235/",
          },
          {
            name: "Nabeelah Faumi",
            role: "Finance VC",
            track: "",
            initials: "NF",
            imageUrl: "/team/2024/03-nabeelah-faumi.jpg",
            imagePosition: "center 18%",
            linkedinUrl: "https://www.linkedin.com/in/nabeelah-ahamed-faumi/",
          },
          {
            name: "Sanduni Ranawaka",
            role: "Public Visibility VC",
            track: "",
            initials: "SR",
            imageUrl: "/team/2024/04-sanduni-ranawaka.jpg",
            imagePosition: "center 18%",
            linkedinUrl: "https://www.linkedin.com/in/sanduni-ranawaka-98a591205/",
            email: "sanduni.ranawake@gmail.com",
          },
          {
            name: "Prabhasa Dharmarathne",
            role: "Program VC",
            track: "",
            initials: "PD",
            imageUrl: "/team/2024/05-prabhasa-dharmarathne.jpg",
            imagePosition: "center 15%",
            linkedinUrl: "https://www.linkedin.com/in/prabhasa-dharmarathne-905705138/",
          },
          {
            name: "Dewni Samarakoon",
            role: "Coordinator",
            track: "",
            initials: "DS",
            imageUrl: "/team/2024/06-dewni-samarakoon.jpeg",
            imagePosition: "center 18%",
            linkedinUrl: "https://www.linkedin.com/in/dewni-samarakoon/",
          },
          {
            name: "Nishara Fernando",
            role: "Coordinator",
            track: "",
            initials: "NF",
            imageUrl: "/team/2024/07-nishara-fernando.jpg",
            imagePosition: "center 18%",
            linkedinUrl: "https://www.linkedin.com/in/nishara-fernando-526921265/",
          },
          {
            name: "Kavinadi Nivedya",
            role: "Coordinator",
            track: "",
            initials: "KN",
            imageUrl: "/team/2024/08-kavinadi-nivedya.jpg",
            imagePosition: "center 22%",
            linkedinUrl: "https://www.linkedin.com/in/kavinadi-nivedya-660571292/",
          },
          {
            name: "Senuda Weliwatta",
            role: "Coordinator",
            track: "",
            initials: "SW",
            imageUrl: "/team/2024/09-senuda-weliwatta.jpg",
            imagePosition: "center 15%",
            linkedinUrl: "https://www.linkedin.com/in/senuda-weliwatta/",
          },
          {
            name: "Vayoni Gamage",
            role: "Coordinator",
            track: "",
            initials: "VG",
            imageUrl: "/team/2024/10-vayoni-gamage.jpg",
            imagePosition: "center 15%",
            linkedinUrl: "https://www.linkedin.com/in/vayoni-gamage/",
          },
          {
            name: "Nuwanadun Kalhara",
            role: "Coordinator",
            track: "",
            initials: "NK",
            imageUrl: "/team/2024/11-nuwanandun-kalhara.jpg",
            imagePosition: "center 22%",
            linkedinUrl: "https://www.linkedin.com/in/nuwanandun-kalhara-71858a2a6/",
          },
          {
            name: "Abhishek Sandeepa",
            role: "Coordinator",
            track: "",
            initials: "AS",
            imageUrl: "/team/2024/12-abhishek-sandeepa.jpg",
            imagePosition: "center 20%",
          },
          {
            name: "Yashoda Kawindi",
            role: "Coordinator",
            track: "",
            initials: "YK",
            imageUrl: "/team/2024/13-yashoda-kawindi.jpg",
            imagePosition: "center 15%",
            linkedinUrl: "https://www.linkedin.com/in/yashoda-kawindi-1178b3271/",
          },
          {
            name: "Hiruni Senevirathne",
            role: "Coordinator",
            track: "",
            initials: "HS",
            imageUrl: "/team/2024/14-hiruni-senevirathne.jpeg",
            imagePosition: "center 20%",
          },
          {
            name: "Dumindu Udara",
            role: "Coordinator",
            track: "",
            initials: "DU",
            imageUrl: "/team/2024/15-dumindu-udara.png",
            imagePosition: "center 18%",
            linkedinUrl: "https://www.linkedin.com/in/dumindu-udara/",
          },
        ],
      },
    ],
    pastTeams: [
      {
        year: "2025",
        theme: "Expanded workshops and industry conversations",
        members: [
          "Sanduni Ranawaka",
          "Nishara Fernando",
          "Sachini Thakshila",
          "Nuwanadun Kalhara",
          "Vayoni Gamage",
          "Minesi Rajapaksha",
          "Atheesha Shanthakumar",
          "Dahamya Ranasinghe",
          "Hashan Maduwantha",
          "Sharen Jeevendran",
          "Vindya Nayana Kanthi",
          "Amritha Balendran",
          "Thumindu Senarathna",
          "Janith Chamikara",
          "Samudra de Silva",
        ],
      },
      {
        year: "2024",
        theme: "Strengthened partnerships and student branch reach",
        members: [
          "Charuka Atapattu",
          "Yashodha Athapattu",
          "Nabeelah Faumi",
          "Sanduni Ranawaka",
          "Prabhasa Dharmarathne",
          "Dewni Samarakoon",
          "Nishara Fernando",
          "Kavinadi Nivedya",
          "Senuda Weliwatta",
          "Vayoni Gamage",
          "Nuwanadun Kalhara",
          "Abhishek Sandeepa",
          "Yashoda Kawindi",
          "Hiruni Senevirathne",
          "Dumindu Udara",
        ],
      },
      {
        year: "2023",
        theme: "Built the foundation for a national learning platform",
        members: [
          "Past Member 16",
          "Past Member 17",
          "Past Member 18",
          "Past Member 19",
          "Past Member 20",
          "Past Member 21",
        ],
      },
    ],
    workAreas: [
      "Program planning",
      "Speaker coordination",
      "Partner engagement",
      "Brand and media",
    ],
  },
};
