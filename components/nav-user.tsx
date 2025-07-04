"use client"

import {
  Bell,
  ChevronsUpDown,
  Settings,
  LogOut,
  User,
  Building2,
} from "lucide-react"
import { useAuthActions } from "@convex-dev/auth/react"
import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import { useRouter } from "next/navigation"

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"

export function NavUser({
  user,
}: {
  user: {
    name: string
    email: string
    avatar: string
  }
}) {
  const { isMobile } = useSidebar()
  const { signOut } = useAuthActions()
  const userProfile = useQuery(api.users.getCurrentUserProfile)
  const router = useRouter()

  const handleSignOut = async () => {
    try {
      await signOut()
      router.push("/signin")
    } catch (error) {
      console.error("Sign out error:", error)
    }
  }

  const displayName = userProfile 
    ? `${userProfile.firstName} ${userProfile.lastName}`
    : user.name || "Healthcare Professional"

  const getProfessionalTypeDisplay = (type?: string) => {
    switch (type) {
      case "pharmacist": return "Pharmacist";
      case "general_practitioner": return "General Practitioner";
      case "nurse": return "Nurse";
      case "administration": return "Administration";
      case "aged_care_worker": return "Aged Care Worker";
      case "specialist": return "Specialist";
      default: return "Healthcare Professional";
    }
  };

  const professionalType = userProfile?.healthcareProfessionalType 
    ? getProfessionalTypeDisplay(userProfile.healthcareProfessionalType)
    : "Healthcare Professional";

  const initials = displayName
    .split(" ")
    .map(n => n[0])
    .join("")
    .toUpperCase()

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <Avatar className="h-8 w-8 rounded-lg">
                <AvatarImage src={user.avatar} alt={displayName} />
                <AvatarFallback className="rounded-lg">{initials}</AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{displayName}</span>
                <span className="truncate text-xs text-muted-foreground">
                  {professionalType}
                </span>
              </div>
              <ChevronsUpDown className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <Avatar className="h-8 w-8 rounded-lg">
                  <AvatarImage src={user.avatar} alt={displayName} />
                  <AvatarFallback className="rounded-lg">{initials}</AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">{displayName}</span>
                  <span className="truncate text-xs text-muted-foreground">
                    {professionalType}
                  </span>
                  {userProfile?.aphraRegistrationNumber && (
                    <span className="truncate text-xs text-muted-foreground">
                      APHRA: {userProfile.aphraRegistrationNumber}
                    </span>
                  )}
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem onClick={() => router.push("/settings/profile")}>
                <User />
                Profile Settings
              </DropdownMenuItem>
              {userProfile?.organizationId && (
                <DropdownMenuItem onClick={() => router.push("/organization")}>
                  <Building2 />
                  Organization
                </DropdownMenuItem>
              )}
              <DropdownMenuItem onClick={() => router.push("/settings/notifications")}>
                <Bell />
                Notifications
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem onClick={() => router.push("/settings")}>
                <Settings />
                Settings
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleSignOut}>
              <LogOut />
              Sign Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
