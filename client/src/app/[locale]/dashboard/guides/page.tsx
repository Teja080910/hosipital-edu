"use client";

import { PageTransition } from "@/components/page-transition";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import { BookOpen, ChevronRight, Shield, ShieldCheck, UserRound } from "lucide-react";
import { useTranslations } from "next-intl";

const userGuides = [
  {
    title: "Getting Started",
    icon: BookOpen,
    items: [
      "Create your account and set up your profile",
      "Choose your exam (ENARM, MIR, USMLE)",
      "Set your study preferences and goals",
      "Explore the dashboard overview",
    ],
  },
  {
    title: "Study Features",
    icon: UserRound,
    items: [
      "Answer practice questions with detailed explanations",
      "Review flashcards using spaced repetition",
      "Take timed mock exams to simulate real test conditions",
      "Track your progress with detailed analytics",
      "Watch curated video lessons",
      "Enroll in structured courses",
    ],
  },
  {
    title: "Progress Tracking",
    icon: UserRound,
    items: [
      "View your accuracy and study streak on the dashboard",
      "Analyze performance by specialty and topic",
      "Review weekly activity and study time",
      "Identify weak areas for focused study",
    ],
  },
  {
    title: "Subscription & Billing",
    icon: UserRound,
    items: [
      "Choose a plan that fits your needs (monthly, quarterly, annual)",
      "Manage your subscription from settings",
      "View payment history and invoices",
      "Cancel or upgrade your plan anytime",
    ],
  },
];

const adminGuides = [
  {
    title: "Content Management",
    icon: Shield,
    items: [
      "Create and manage courses with lessons and quizzes",
      "Add, edit, and organize question bank by specialty and topic",
      "Upload video content and manage the video library",
      "Oversee flashcard decks and their assignment",
    ],
  },
  {
    title: "User Management",
    icon: Shield,
    items: [
      "View and manage all registered users",
      "Assign roles (user, admin)",
      "Monitor user activity and engagement",
      "Handle support requests",
    ],
  },
  {
    title: "System Administration",
    icon: Shield,
    items: [
      "Manage article/blog content for the landing page",
      "Configure subscription plans and pricing",
      "Review and manage certificates issued",
      "View analytics dashboard for platform metrics",
    ],
  },
  {
    title: "Translations & Localization",
    icon: Shield,
    items: [
      "Add and edit translation keys in the admin panel",
      "Auto-translate missing locale entries",
      "Export translations for backup",
      "Ensure content is available in all supported languages",
    ],
  },
];

const superAdminGuides = [
  {
    title: "Platform Administration",
    icon: ShieldCheck,
    items: [
      "Full access to all admin features",
      "Promote or demote admin users",
      "Configure system-wide settings",
      "View comprehensive platform analytics",
    ],
  },
  {
    title: "Security & Compliance",
    icon: ShieldCheck,
    items: [
      "Monitor user authentication and session activity",
      "Oversee role assignments and access control",
      "Review system audit logs",
      "Manage API keys and integrations",
    ],
  },
  {
    title: "Server & Infrastructure",
    icon: ShieldCheck,
    items: [
      "Monitor server health and performance metrics",
      "Manage file uploads and CDN configuration",
      "Review error logs and system alerts",
      "Coordinate deployment and updates",
    ],
  },
  {
    title: "Advanced Configuration",
    icon: ShieldCheck,
    items: [
      "Configure email templates and notification settings",
      "Manage Stripe integration and payment workflows",
      "Set up AI-powered features and auto-translation",
      "Customize landing page and marketing content",
    ],
  },
];

export default function GuidesPage() {
  const t = useTranslations("guides");
  const c = useTranslations("common");
  const { user } = useAuth();
  const role = user?.role || "user";

  return (
    <PageTransition>
      <div className="space-y-6 max-w-4xl">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Guides</h1>
          <p className="text-muted-foreground">
            Role-based guides to help you make the most of the platform
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-sm px-3 py-1 capitalize">
            {role.replace("_", " ")}
          </Badge>
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">
            {role === "user"
              ? "Learner guides"
              : role === "admin"
                ? "Admin guides"
                : "Super admin guides"}
          </span>
        </div>

        {(role === "user" || role === "admin" || role === "super_admin") && (
          <>
            <div className="grid gap-4 md:grid-cols-2">
              {userGuides.map((section) => (
                <Card key={section.title}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <section.icon className="h-4 w-4" />
                      </div>
                      <CardTitle className="text-lg">{section.title}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {section.items.map((item) => (
                        <li key={item} className="text-sm text-muted-foreground flex items-start gap-2">
                          <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary/60" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </div>
          </>
        )}

        {(role === "admin" || role === "super_admin") && (
          <>
            <div className="pt-4">
              <h2 className="text-xl font-bold tracking-tight flex items-center gap-2">
                <Shield className="h-5 w-5 text-orange-500" />
                Admin Guides
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                Tools and workflows for platform administrators
              </p>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              {adminGuides.map((section) => (
                <Card key={section.title}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-500/10 text-orange-500">
                        <section.icon className="h-4 w-4" />
                      </div>
                      <CardTitle className="text-lg">{section.title}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {section.items.map((item) => (
                        <li key={item} className="text-sm text-muted-foreground flex items-start gap-2">
                          <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-orange-500/60" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </div>
          </>
        )}

        {role === "super_admin" && (
          <>
            <div className="pt-4">
              <h2 className="text-xl font-bold tracking-tight flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-red-500" />
                Super Admin Guides
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                Advanced system-level administration and configuration
              </p>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              {superAdminGuides.map((section) => (
                <Card key={section.title}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-500/10 text-red-500">
                        <section.icon className="h-4 w-4" />
                      </div>
                      <CardTitle className="text-lg">{section.title}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {section.items.map((item) => (
                        <li key={item} className="text-sm text-muted-foreground flex items-start gap-2">
                          <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-red-500/60" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </div>
          </>
        )}
      </div>
    </PageTransition>
  );
}