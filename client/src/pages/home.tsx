import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useIsMobile } from "@/hooks/use-mobile";
import { LayoutDashboard, Database, FormInput, GitBranch, Shield, TableProperties } from "lucide-react";

export default function Home() {
  const isMobile = useIsMobile();

  const modules = [
    {
      title: "Dashboard",
      description: "Overview and analytics of your application",
      icon: <LayoutDashboard className="h-6 w-6" />,
      href: "/dashboard"
    },
    {
      title: "Schema Designer",
      description: "Create and manage your data models",
      icon: <Database className="h-6 w-6" />,
      href: "/schema"
    },
    {
      title: "Form Builder",
      description: "Build custom forms for data entry",
      icon: <FormInput className="h-6 w-6" />,
      href: "/forms"
    },
    {
      title: "Workflow Builder",
      description: "Automate processes and data flows",
      icon: <GitBranch className="h-6 w-6" />,
      href: "/workflows"
    },
    {
      title: "Access Control",
      description: "Manage roles and permissions",
      icon: <Shield className="h-6 w-6" />,
      href: "/roles"
    },
    {
      title: "Data Explorer",
      description: "Browse and manage your data",
      icon: <TableProperties className="h-6 w-6" />,
      href: "/data"
    }
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold tracking-tight">NocoStudio</h1>
        <p className="text-lg text-muted-foreground mt-2">
          Build powerful applications without writing code
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
        {modules.map((module) => (
          <Card key={module.title} className="flex flex-col">
            <CardHeader>
              <div className="flex items-center gap-2">
                {module.icon}
                <CardTitle>{module.title}</CardTitle>
              </div>
              <CardDescription>{module.description}</CardDescription>
            </CardHeader>
            <CardFooter className="mt-auto">
              <Button asChild className="w-full">
                <Link href={module.href}>Open {module.title}</Link>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}