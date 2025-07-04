"use client"

import * as React from "react"
import {
  Activity,
  Building2,
  Users,
  FileText,
  Settings,
  GalleryVerticalEnd,
  Pill,
  UserPlus,
  TrendingUp,
  Shield,
  Calendar,
} from "lucide-react"
import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"

import { NavMain } from "@/components/nav-main"
import { NavProjects } from "@/components/nav-projects"
import { NavUser } from "@/components/nav-user"
import { TeamSwitcher } from "@/components/team-switcher"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"

// Function to generate navigation based on organization type
const getNavigationData = (organizationType?: "pharmacy" | "gp_clinic" | "hospital" | "aged_care") => {
  // Base navigation items that all organization types have
  const baseNavItems = [
    {
      title: "Dashboard",
      url: "/",
      icon: TrendingUp,
      isActive: true,
      items: [
        {
          title: "Overview",
          url: "/",
        },
        {
          title: "Analytics",
          url: "/analytics",
        },
        {
          title: "Reports",
          url: "/reports",
        },
      ],
    },
    {
      title: "Patients",
      url: "/patients",
      icon: Users,
      items: [
        {
          title: "All Patients",
          url: "/patients",
        },
        {
          title: "Add Patient",
          url: "/patients/new",
        },
        {
          title: "Patient Groups",
          url: "/patients/groups",
        },
        {
          title: "Assessments",
          url: "/patients/assessments",
        },
      ],
    },
  ];

  // Medications section - only for pharmacies
  const medicationsSection = {
    title: "Medications",
    url: "/medications",
    icon: Pill,
    items: [
      {
        title: "Active Medications",
        url: "/medications/active",
      },
      {
        title: "Medication Library",
        url: "/medications/library",
      },
      {
        title: "Prescriptions",
        url: "/medications/prescriptions",
      },
      {
        title: "Interactions",
        url: "/medications/interactions",
      },
    ],
  };

  // Common sections for all organization types
  const commonSections = [
    {
      title: "Compliance",
      url: "/compliance",
      icon: Activity,
      items: [
        {
          title: "Adherence Tracking",
          url: "/compliance/adherence",
        },
        {
          title: "Missed Doses",
          url: "/compliance/missed",
        },
        {
          title: "Follow-ups",
          url: "/compliance/followups",
        },
      ],
    },
    {
      title: "Organization",
      url: "#",
      icon: Building2,
      items: [
        {
          title: "Overview",
          url: "/organization",
        },
        {
          title: "Team Members",
          url: "/organization/members",
        },
        {
          title: "Partnerships",
          url: "/organization/partnerships",
        },
        {
          title: "Settings",
          url: "/organization/settings",
        },
      ],
    },
    {
      title: "Settings",
      url: "/settings",
      icon: Settings,
      items: [
        {
          title: "Profile",
          url: "/settings/profile",
        },
        {
          title: "Notifications",
          url: "/settings/notifications",
        },
        {
          title: "Security",
          url: "/settings/security",
        },
        {
          title: "Integrations",
          url: "/settings/integrations",
        },
      ],
    },
  ];

  // Build navigation array based on organization type
  const navMain = [...baseNavItems];
  
  // Only add medications section for pharmacy organizations
  if (organizationType === "pharmacy") {
    navMain.push(medicationsSection);
  }
  
  navMain.push(...commonSections);

  // Projects also vary by organization type
  const getProjects = () => {
    const baseProjects = [
      {
        name: "Patient Onboarding",
        url: "/projects/onboarding",
        icon: UserPlus,
      },
      {
        name: "Compliance Monitoring",
        url: "/projects/monitoring",
        icon: Shield,
      },
      {
        name: "Scheduled Tasks",
        url: "/projects/tasks",
        icon: Calendar,
      },
    ];

    // Add medication-related projects only for pharmacies
    if (organizationType === "pharmacy") {
      baseProjects.unshift({
        name: "Medication Reviews",
        url: "/projects/reviews",
        icon: FileText,
      });
    }

    return baseProjects;
  };

  return {
    user: {
      name: "Healthcare Professional",
      email: "user@pillflow.com",
      avatar: "/avatars/user.jpg",
    },
    teams: [
      {
        name: "PillFlow Health",
        logo: GalleryVerticalEnd,
        plan: "Professional",
      },
      {
        name: "Regional Clinic",
        logo: Building2,
        plan: "Enterprise",
      },
      {
        name: "Community Pharmacy",
        logo: Pill,
        plan: "Standard",
      },
    ],
    navMain,
    projects: getProjects(),
  };
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  // Get current user's organization to determine navigation access
  const organization = useQuery(api.users.getOrganization);
  
  // Generate navigation data based on organization type
  const data = getNavigationData(organization?.type);
  
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavProjects projects={data.projects} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
