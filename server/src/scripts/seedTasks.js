import { Task } from "../models/Task.model.js";
import { logger } from "../utils/logger.js";

const DEFAULT_TASKS = [
  // WEEK 1: Apex CRM Development
  {
    title: "Check website and perform baseline audits",
    description: "Audit current website responsiveness and list technical issues.",
    date: "2026-08-10",
    startTime: "08:40 PM",
    endTime: "09:05 PM",
    assignedTo: "Parth",
    category: "Technical",
    priority: "High",
    status: "Completed",
    source: "seed",
    createdBy: "System",
    completedBy: "Parth",
    completedAt: new Date("2026-08-10T21:02:00Z"),
    history: [{ action: "Task created", details: "Seeded work plan", performedBy: "System", timestamp: new Date("2026-08-10T20:00:00Z") }]
  },
  {
    title: "Finalize company bio",
    description: "Review and format the new company bio text in the main profile.",
    date: "2026-08-10",
    startTime: "09:05 PM",
    endTime: "09:30 PM",
    assignedTo: "Parth",
    category: "Non-Technical",
    priority: "Medium",
    status: "Completed",
    source: "seed",
    createdBy: "System",
    completedBy: "Parth",
    completedAt: new Date("2026-08-10T21:25:00Z"),
    history: [{ action: "Task created", details: "Seeded work plan", performedBy: "System", timestamp: new Date("2026-08-10T20:00:00Z") }]
  },
  {
    title: "Prepare project screenshots",
    description: "Collect high-quality screenshots from Apex CRM for portfolio showcasing.",
    date: "2026-08-10",
    startTime: "08:40 PM",
    endTime: "09:05 PM",
    assignedTo: "Ronit",
    category: "Technical",
    priority: "Medium",
    status: "Completed",
    source: "seed",
    createdBy: "System",
    completedBy: "Ronit",
    completedAt: new Date("2026-08-10T20:55:00Z"),
    history: [{ action: "Task created", details: "Seeded work plan", performedBy: "System", timestamp: new Date("2026-08-10T20:00:00Z") }]
  },
  {
    title: "Create Instagram creative",
    description: "Design social media banner for the new tool release.",
    date: "2026-08-10",
    startTime: "09:05 PM",
    endTime: "09:30 PM",
    assignedTo: "Ronit",
    category: "Content",
    priority: "High",
    status: "Completed",
    source: "seed",
    createdBy: "System",
    completedBy: "Ronit",
    completedAt: new Date("2026-08-10T21:28:00Z"),
    history: [{ action: "Task created", details: "Seeded work plan", performedBy: "System", timestamp: new Date("2026-08-10T20:00:00Z") }]
  },
  {
    title: "Setup backend router for CRM client sync",
    description: "Code new client synchronization route controllers in Express.",
    date: "2026-08-11",
    startTime: "10:00 AM",
    endTime: "11:00 AM",
    assignedTo: "Parth",
    category: "Development",
    priority: "High",
    status: "Completed",
    source: "seed",
    createdBy: "System",
    completedBy: "Parth",
    completedAt: new Date("2026-08-11T10:50:00Z")
  },
  {
    title: "Design CRM dashboard layout prototype",
    description: "Map wireframes for role permissions and charts in Figma.",
    date: "2026-08-11",
    startTime: "10:00 AM",
    endTime: "11:30 AM",
    assignedTo: "Ronit",
    category: "Design",
    priority: "Medium",
    status: "Completed",
    source: "seed",
    createdBy: "System",
    completedBy: "Ronit",
    completedAt: new Date("2026-08-11T11:15:00Z")
  },
  {
    title: "Check Pronix website",
    description: "Verify landing page responsiveness.",
    date: "2026-08-12",
    startTime: "08:40 PM",
    endTime: "09:05 PM",
    assignedTo: "Parth",
    category: "Technical",
    priority: "High",
    status: "Pending",
    source: "seed",
    createdBy: "System"
  },
  {
    title: "Finalize company bio",
    description: "Refining leadership info text.",
    date: "2026-08-12",
    startTime: "09:05 PM",
    endTime: "09:30 PM",
    assignedTo: "Parth",
    category: "Non-Technical",
    priority: "Medium",
    status: "Pending",
    source: "seed",
    createdBy: "System"
  },
  {
    title: "Check GitHub organization",
    description: "Inspect repositories, pull requests, and deploy hooks.",
    date: "2026-08-12",
    startTime: "08:40 PM",
    endTime: "09:05 PM",
    assignedTo: "Ronit",
    category: "Technical",
    priority: "Medium",
    status: "Pending",
    source: "seed",
    createdBy: "System"
  },
  {
    title: "Prepare Instagram creative",
    description: "Export the graphic assets for the launch announcement.",
    date: "2026-08-12",
    startTime: "09:05 PM",
    endTime: "09:30 PM",
    assignedTo: "Ronit",
    category: "Content",
    priority: "High",
    status: "Pending",
    source: "seed",
    createdBy: "System"
  },
  {
    title: "Research five potential businesses",
    description: "Identify businesses in Vadodara area needing CRM platforms.",
    date: "2026-08-12",
    startTime: "09:30 PM",
    endTime: "10:15 PM",
    assignedTo: "Both",
    category: "Business Development",
    priority: "Medium",
    status: "Pending",
    source: "seed",
    createdBy: "System"
  },
  {
    title: "Implement client feedback loop dashboard",
    description: "Write client comment widget components.",
    date: "2026-08-13",
    startTime: "02:00 PM",
    endTime: "04:00 PM",
    assignedTo: "Parth",
    category: "Development",
    priority: "Medium",
    status: "Pending",
    source: "seed",
    createdBy: "System"
  },
  {
    title: "Audit client communication log system",
    description: "Verify that CRM notes are correctly emailed to clients.",
    date: "2026-08-13",
    startTime: "02:30 PM",
    endTime: "04:00 PM",
    assignedTo: "Ronit",
    category: "Testing",
    priority: "Low",
    status: "Pending",
    source: "seed",
    createdBy: "System"
  },
  {
    title: "Finalize Apex CRM beta release",
    description: "Pack build files and deploy to staging.",
    date: "2026-08-14",
    startTime: "03:00 PM",
    endTime: "05:00 PM",
    assignedTo: "Parth",
    category: "Development",
    priority: "High",
    status: "Pending",
    source: "seed",
    createdBy: "System"
  },
  {
    title: "Write user manual for Apex CRM",
    description: "Write markdown file guide explaining client communication features.",
    date: "2026-08-14",
    startTime: "03:00 PM",
    endTime: "04:30 PM",
    assignedTo: "Ronit",
    category: "Administration",
    priority: "Medium",
    status: "Pending",
    source: "seed",
    createdBy: "System"
  },
  {
    title: "Research RAG, AI assistants, document search and automation",
    description: "Learn new vector retrieval models.",
    date: "2026-08-15",
    startTime: "08:40 PM",
    endTime: "09:05 PM",
    assignedTo: "Parth",
    category: "Technical",
    priority: "High",
    status: "Pending",
    source: "seed",
    createdBy: "System"
  },
  {
    title: "Create AI demonstration",
    description: "Setup basic frontend prototype.",
    date: "2026-08-15",
    startTime: "08:40 PM",
    endTime: "09:05 PM",
    assignedTo: "Ronit",
    category: "Technical",
    priority: "Medium",
    status: "Pending",
    source: "seed",
    createdBy: "System"
  },
  {
    title: "Write 'AI isn't just a chatbot' post",
    description: "Draft text on LinkedIn.",
    date: "2026-08-15",
    startTime: "09:05 PM",
    endTime: "09:30 PM",
    assignedTo: "Parth",
    category: "Content",
    priority: "High",
    status: "Pending",
    source: "seed",
    createdBy: "System"
  },
  {
    title: "Create AI Reel",
    description: "Record short video explaining agentic AI tools.",
    date: "2026-08-15",
    startTime: "09:05 PM",
    endTime: "09:30 PM",
    assignedTo: "Ronit",
    category: "Content",
    priority: "High",
    status: "Pending",
    source: "seed",
    createdBy: "System"
  },
  {
    title: "Weekly review and ship release v1.1.0",
    description: "Co-host client demo showing weekly achievements.",
    date: "2026-08-16",
    startTime: "06:00 PM",
    endTime: "07:30 PM",
    assignedTo: "Both",
    category: "Meeting",
    priority: "High",
    status: "Pending",
    source: "seed",
    createdBy: "System"
  },

  // WEEK 2: Nova SaaS Frontend
  {
    title: "Initialize Nova SaaS fintech components",
    description: "Build layouts for fintech client account metrics.",
    date: "2026-08-17",
    startTime: "10:00 AM",
    endTime: "12:00 PM",
    assignedTo: "Parth",
    category: "Development",
    priority: "Medium",
    status: "Pending",
    source: "seed",
    createdBy: "System"
  },
  {
    title: "Design layout theme for fintech charts",
    description: "Setup custom chart color palettes in CSS.",
    date: "2026-08-17",
    startTime: "10:30 AM",
    endTime: "12:00 PM",
    assignedTo: "Ronit",
    category: "Design",
    priority: "Medium",
    status: "Pending",
    source: "seed",
    createdBy: "System"
  },
  {
    title: "Integrate financial charts data structure",
    description: "Format backend API returns to match ChartJS input formats.",
    date: "2026-08-18",
    startTime: "01:00 PM",
    endTime: "03:00 PM",
    assignedTo: "Parth",
    category: "Development",
    priority: "High",
    status: "Pending",
    source: "seed",
    createdBy: "System"
  },
  {
    title: "Draft copy for fintech marketing funnel",
    description: "Write email sequences and landing page headers.",
    date: "2026-08-18",
    startTime: "02:00 PM",
    endTime: "03:30 PM",
    assignedTo: "Ronit",
    category: "Marketing",
    priority: "Low",
    status: "Pending",
    source: "seed",
    createdBy: "System"
  },
  {
    title: "Optimize sub-second transition caching",
    description: "Setup server response cache-headers for rapid navigation.",
    date: "2026-08-19",
    startTime: "04:00 PM",
    endTime: "05:30 PM",
    assignedTo: "Parth",
    category: "Technical",
    priority: "High",
    status: "Pending",
    source: "seed",
    createdBy: "System"
  },
  {
    title: "Test layout responsiveness on tablet screen",
    description: "Perform manual audits across tablet devices.",
    date: "2026-08-19",
    startTime: "04:00 PM",
    endTime: "05:00 PM",
    assignedTo: "Ronit",
    category: "Testing",
    priority: "Medium",
    status: "Pending",
    source: "seed",
    createdBy: "System"
  },
  {
    title: "Draft Blog 1 - Why Custom CRMs Win Over Off-the-Shelf",
    description: "Write technical explanation and publish date.",
    date: "2026-08-20",
    startTime: "09:00 AM",
    endTime: "11:00 AM",
    assignedTo: "Parth",
    category: "Content",
    priority: "Medium",
    status: "Pending",
    source: "seed",
    createdBy: "System"
  },
  {
    title: "Setup promotional email newsletter for CRM launch",
    description: "Design newsletter HTML templates.",
    date: "2026-08-20",
    startTime: "10:00 AM",
    endTime: "11:30 AM",
    assignedTo: "Ronit",
    category: "Marketing",
    priority: "Medium",
    status: "Pending",
    source: "seed",
    createdBy: "System"
  },

  // WEEK 3: FitFlow Mobile App
  {
    title: "Setup user authentication flows in mobile backend",
    description: "Integrate session validation routes.",
    date: "2026-08-24",
    startTime: "09:30 AM",
    endTime: "11:30 AM",
    assignedTo: "Parth",
    category: "Development",
    priority: "High",
    status: "Pending",
    source: "seed",
    createdBy: "System"
  },
  {
    title: "Integrate video player module in mobile app",
    description: "Code native video streaming layout.",
    date: "2026-08-24",
    startTime: "09:30 AM",
    endTime: "12:00 PM",
    assignedTo: "Ronit",
    category: "Development",
    priority: "High",
    status: "Pending",
    source: "seed",
    createdBy: "System"
  },
  {
    title: "Draft Blog 2 - Designing Scalable Design Systems in React",
    description: "Explain tokens, props, and design uniformity.",
    date: "2026-08-26",
    startTime: "10:00 AM",
    endTime: "12:00 PM",
    assignedTo: "Parth",
    category: "Content",
    priority: "Medium",
    status: "Pending",
    source: "seed",
    createdBy: "System"
  },

  // WEEK 4: Stellar Web Platform
  {
    title: "Implement Role-Based Access Control on backend",
    description: "Secure routing using admin permissions.",
    date: "2026-09-01",
    startTime: "02:00 PM",
    endTime: "04:00 PM",
    assignedTo: "Parth",
    category: "Development",
    priority: "High",
    status: "Pending",
    source: "seed",
    createdBy: "System"
  },
  {
    title: "Assemble admin sidebar with dynamic permissions",
    description: "Setup menu visibility configurations.",
    date: "2026-09-01",
    startTime: "02:00 PM",
    endTime: "03:30 PM",
    assignedTo: "Ronit",
    category: "Development",
    priority: "High",
    status: "Pending",
    source: "seed",
    createdBy: "System"
  },
  {
    title: "Draft Blog 3 - The Weekly Shipping Cadence",
    description: "Write details on agile shipping benefits.",
    date: "2026-09-03",
    startTime: "09:00 AM",
    endTime: "11:00 AM",
    assignedTo: "Parth",
    category: "Content",
    priority: "Medium",
    status: "Pending",
    source: "seed",
    createdBy: "System"
  },

  // WEEK 5: RAG & AI Systems Integration
  {
    title: "Initialize Google Gemini AI script for database search",
    description: "Code initial model configuration files.",
    date: "2026-09-07",
    startTime: "10:00 AM",
    endTime: "12:00 PM",
    assignedTo: "Parth",
    category: "AI",
    priority: "High",
    status: "Pending",
    source: "seed",
    createdBy: "System"
  },
  {
    title: "Setup landing funnels for AI products",
    description: "Map user funnel pages.",
    date: "2026-09-07",
    startTime: "10:30 AM",
    endTime: "12:00 PM",
    assignedTo: "Ronit",
    category: "Marketing",
    priority: "Medium",
    status: "Pending",
    source: "seed",
    createdBy: "System"
  },
  {
    title: "Draft Blog 4 - Modern API Design with Node.js and Express",
    description: "Outline schema validations and jwt.",
    date: "2026-09-09",
    startTime: "09:00 AM",
    endTime: "11:00 AM",
    assignedTo: "Parth",
    category: "Content",
    priority: "Medium",
    status: "Pending",
    source: "seed",
    createdBy: "System"
  },

  // WEEK 6: SEO, Client Handover, Final Reviews
  {
    title: "Audit SEO indexing of main website pages",
    description: "Audit crawl reports in search console.",
    date: "2026-09-14",
    startTime: "10:00 AM",
    endTime: "12:00 PM",
    assignedTo: "Parth",
    category: "SEO",
    priority: "High",
    status: "Pending",
    source: "seed",
    createdBy: "System"
  },
  {
    title: "Review client analytics traffic report",
    description: "Prepare traffic dashboard data.",
    date: "2026-09-14",
    startTime: "10:00 AM",
    endTime: "11:30 AM",
    assignedTo: "Ronit",
    category: "Marketing",
    priority: "Medium",
    status: "Pending",
    source: "seed",
    createdBy: "System"
  },
  {
    title: "Host client demo call for all Q3 delivery releases",
    description: "Run final live platform demo showcase.",
    date: "2026-09-20",
    startTime: "04:00 PM",
    endTime: "06:00 PM",
    assignedTo: "Both",
    category: "Meeting",
    priority: "Urgent",
    status: "Pending",
    source: "seed",
    createdBy: "System"
  }
];

export async function seedDefaultTasks() {
  try {
    const count = await Task.countDocuments({ isDeleted: false });
    if (count > 0) {
      logger.info(`Tasks collection already contains ${count} tasks. Skipping seeding.`);
      return;
    }

    logger.info("Seeding Pronix Digital default execution plan tasks...");
    
    // Add default history entries for each task
    const tasksToInsert = DEFAULT_TASKS.map((t) => {
      if (!t.history) {
        t.history = [
          {
            action: "Task created",
            details: "Seeded default work plan",
            performedBy: "System",
            timestamp: new Date(),
          },
        ];
      }
      return t;
    });

    await Task.insertMany(tasksToInsert);
    logger.info(`Successfully seeded ${tasksToInsert.length} tasks!`);
  } catch (error) {
    logger.error("Failed to seed default tasks:", error);
  }
}
