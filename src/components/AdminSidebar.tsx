import { useState } from "react"
import { 
  LayoutDashboard, 
  Users, 
  CheckCircle, 
  MessageSquare, 
  Apple, 
  Dumbbell, 
  FileText, 
  Target,
  ChevronDown,
  ChevronRight
} from "lucide-react"
import { NavLink, useLocation } from "react-router-dom"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"

const mainItems = [
  { title: "Dashboard", url: "/admin", icon: LayoutDashboard },
  { title: "Klijenti", url: "/admin/clients", icon: Users },
  { title: "Check Ins", url: "/admin/checkins", icon: CheckCircle },
  { title: "Poruke", url: "/admin/messages", icon: MessageSquare },
]

const manageItems = [
  { title: "Prehrana", url: "/admin/nutrition", icon: Apple },
  { title: "Kategorije Namirnica", url: "/admin/food-categories", icon: Apple },
  { title: "Trening", url: "/admin/training", icon: Dumbbell },
  { title: "Upitnici", url: "/admin/forms", icon: FileText },
  { title: "Navike", url: "/admin/habits", icon: Target },
]

export function AdminSidebar() {
  const { state } = useSidebar()
  const collapsed = state === 'collapsed'
  const location = useLocation()
  const currentPath = location.pathname
  
  const [manageOpen, setManageOpen] = useState(
    manageItems.some(item => currentPath.startsWith(item.url))
  )

  const isActive = (path: string) => {
    if (path === "/admin") {
      return currentPath === "/admin"
    }
    return currentPath.startsWith(path)
  }

  const getNavCls = (active: boolean) =>
    active 
      ? "bg-primary/10 text-primary font-medium" 
      : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"

  return (
    <Sidebar className="border-r">
      <SidebarContent>
        {/* Main Navigation */}
        <SidebarGroup>
          <SidebarGroupLabel>Main</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.url} className={getNavCls(isActive(item.url))}>
                      <item.icon className="mr-2 h-4 w-4" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Manage Section */}
        <SidebarGroup>
          <Collapsible open={manageOpen} onOpenChange={setManageOpen}>
            <SidebarGroupLabel asChild>
              <CollapsibleTrigger className="flex w-full items-center justify-between p-2 hover:bg-muted/50 rounded-md">
                Manage
                {!collapsed && (
                  manageOpen ? 
                    <ChevronDown className="h-4 w-4" /> : 
                    <ChevronRight className="h-4 w-4" />
                )}
              </CollapsibleTrigger>
            </SidebarGroupLabel>
            <CollapsibleContent>
              <SidebarGroupContent>
                <SidebarMenu>
                  {manageItems.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton asChild>
                        <NavLink to={item.url} className={getNavCls(isActive(item.url))}>
                          <item.icon className="mr-2 h-4 w-4" />
                          {!collapsed && <span>{item.title}</span>}
                        </NavLink>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </CollapsibleContent>
          </Collapsible>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}