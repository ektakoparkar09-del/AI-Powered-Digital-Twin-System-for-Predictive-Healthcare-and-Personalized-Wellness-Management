// Centralized navigation config shared by Sidebar and MobileNav.
import {
  LayoutDashboard, User, Dna, Brain, Activity, Heart, MessageSquare,
  FileText, BarChart3, Shield, Moon, Droplets, Smile, Pill,
  Salad, Dumbbell, FlaskConical, LineChart, GitBranch, Users, Trophy, Bell
} from "lucide-react";

export const navSections = [
  {
    title: "Main",
    items: [
      { icon: LayoutDashboard, label: "Dashboard", path: "/" },
      { icon: User, label: "Health Profile", path: "/profile" },
      { icon: Dna, label: "Digital Twin", path: "/digital-twin" },
      { icon: Brain, label: "AI Predictions", path: "/predictions" },
      { icon: Activity, label: "Health Score", path: "/health-score" },
      { icon: Heart, label: "Forecasting", path: "/forecasting" },
    ],
  },
  {
    title: "AI",
    items: [
      { icon: MessageSquare, label: "AI Health Coach", path: "/assistant" },
      { icon: FlaskConical, label: "Health Simulator", path: "/simulator" },
    ],
  },
  {
    title: "Tracking",
    items: [
      { icon: Moon, label: "Sleep", path: "/sleep" },
      { icon: Droplets, label: "Water", path: "/water" },
      { icon: Smile, label: "Mental Wellness", path: "/wellness" },
      { icon: Pill, label: "Medications", path: "/medications" },
    ],
  },
  {
    title: "Planning",
    items: [
      { icon: Salad, label: "Diet Planner", path: "/diet-planner" },
      { icon: Dumbbell, label: "Exercise Planner", path: "/exercise-planner" },
    ],
  },
  {
    title: "Insights",
    items: [
      { icon: LineChart, label: "Health Trends", path: "/trends" },
      { icon: GitBranch, label: "Timeline", path: "/timeline" },
      { icon: Users, label: "Family History", path: "/family-history" },
      { icon: Trophy, label: "Achievements", path: "/achievements" },
      { icon: Bell, label: "Notifications", path: "/notifications" },
      { icon: FileText, label: "Reports", path: "/reports" },
      { icon: BarChart3, label: "Analytics", path: "/analytics" },
    ],
  },
];

export const adminItem = { icon: Shield, label: "Admin Panel", path: "/admin" };

export const allNavItems = navSections.flatMap((s) => s.items);