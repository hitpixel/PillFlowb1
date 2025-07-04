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

// PillFlow-specific data.
const data = {
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
  navMain: [
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
    {
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
    },
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
  ],
  projects: [
    {
      name: "Medication Reviews",
      url: "/projects/reviews",
      icon: FileText,
    },
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
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
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
