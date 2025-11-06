import { Home, Calendar, FileText, TrendingUp, MessageSquare, ClipboardCheck, Activity } from "lucide-react";
import { useLocation, Link } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

const mainNavItems = [
  { title: "Dashboard", url: "/client", icon: Home },
  { title: "Moji Planovi", url: "/my-plans", icon: Calendar },
  { title: "Upitnici", url: "/forms", icon: FileText },
  { title: "Napredak", url: "/my-progress", icon: TrendingUp },
  { title: "Poruke", url: "/messages", icon: MessageSquare },
];

const quickActions = [
  { title: "NAQ Upitnik", url: "/naq", icon: ClipboardCheck },
  { title: "Mikronutritivna Analiza", url: "/micronutrient", icon: Activity },
];

export function ClientSidebar() {
  const location = useLocation();
  
  const isActive = (path: string) => location.pathname === path;

  return (
    <Sidebar collapsible="icon">
      <SidebarContent>
        {/* Main Navigation */}
        <SidebarGroup>
          <SidebarGroupLabel>MAIN</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainNavItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <Link 
                      to={item.url}
                      className={`${
                        isActive(item.url) 
                          ? 'bg-primary/10 text-primary neon-glow-text neon-border font-medium' 
                          : 'text-muted-foreground hover:bg-muted/50'
                      } transition-all duration-200`}
                    >
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Quick Actions */}
        <SidebarGroup>
          <SidebarGroupLabel>QUICK ACTIONS</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {quickActions.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <Link 
                      to={item.url}
                      className={`${
                        isActive(item.url) 
                          ? 'bg-primary/10 text-primary neon-glow-text neon-border font-medium' 
                          : 'text-muted-foreground hover:bg-muted/50'
                      } transition-all duration-200`}
                    >
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
