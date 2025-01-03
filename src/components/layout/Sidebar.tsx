import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  ChevronRight,
  StethoscopeIcon,
  Brain,
  Heart,
  Activity,
  Bandage,
  ImageIcon,
  MenuIcon,
} from "lucide-react";

interface SidebarProps {
  currentTab: string;
  onTabChange: (tab: string) => void;
}

export function Sidebar({ currentTab, onTabChange }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(true);

  const menuItems = [
    { id: "image-analysis", label: "Image Analysis", icon: ImageIcon },
    { id: "symptoms", label: "Symptom Checker", icon: StethoscopeIcon },
    { id: "mental", label: "Mental Well-being", icon: Brain },
    { id: "health", label: "Health Recommendations", icon: Activity },
    { id: "first-aid", label: "First Aid", icon: Bandage },
    { id: "vitals", label: "Vitals Monitor", icon: Heart },
  ];

  return (
    <div
      className={cn(
        "h-screen bg-gray-900/95 text-white transition-all duration-300 ease-in-out relative z-50",
        collapsed ? "w-16 sm:w-20" : "w-64"
      )}
    >
      <Button
        variant="ghost"
        size="icon"
        className={cn(
          "absolute -right-3 top-6 bg-gray-900 text-white rounded-full hover:bg-gray-800 z-50",
          "sm:-right-4"
        )}
        onClick={() => setCollapsed(!collapsed)}
      >
        <ChevronRight className={cn("h-4 w-4 transition-all", collapsed ? "rotate-180" : "")} />
      </Button>

      <div className="p-2 sm:p-4">
        <Button
          variant="ghost"
          size="icon"
          className="mb-6 w-full hover:bg-gray-800"
        >
          <MenuIcon className="h-5 w-5 sm:h-6 sm:w-6" />
        </Button>

        <nav className="space-y-1 sm:space-y-2">
          {menuItems.map((item) => (
            <Button
              key={item.id}
              variant="ghost"
              className={cn(
                "w-full justify-start gap-2 hover:bg-gray-800 transition-all animate-fade-in text-sm sm:text-base",
                currentTab === item.id ? "bg-gray-800" : "hover:bg-gray-800/50",
                collapsed ? "px-2" : "px-4",
                "h-10 sm:h-12"
              )}
              onClick={() => onTabChange(item.id)}
            >
              <item.icon className={cn("h-4 w-4 sm:h-5 sm:w-5", collapsed ? "mr-0" : "mr-2")} />
              {!collapsed && <span className="truncate">{item.label}</span>}
            </Button>
          ))}
        </nav>
      </div>
    </div>
  );
}