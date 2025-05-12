import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Home,
  Database,
  FileCog,
  Users,
  FileText,
  LayoutDashboard,
  GitBranch,
  UserCircle,
  LogOut,
  Menu,
} from "lucide-react";

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
}

export function Navigation() {
  const [location] = useLocation();
  const { user, logout } = useAuth();
  const isMobile = useIsMobile();
  const [sheetOpen, setSheetOpen] = useState(false);

  // Navigation items for authenticated users
  const navItems: NavItem[] = [
    { label: "Home", href: "/", icon: <Home className="h-5 w-5" /> },
    { label: "Schema Designer", href: "/schema", icon: <Database className="h-5 w-5" /> },
    { label: "Form Builder", href: "/forms", icon: <FileText className="h-5 w-5" /> },
    { label: "Workflow Builder", href: "/workflows", icon: <GitBranch className="h-5 w-5" /> },
    { label: "Role Manager", href: "/roles", icon: <Users className="h-5 w-5" /> },
    { label: "Data Explorer", href: "/data", icon: <FileCog className="h-5 w-5" /> },
    { label: "Dashboard", href: "/dashboard", icon: <LayoutDashboard className="h-5 w-5" /> },
  ];

  // Helper function to check if a nav item is active
  const isActive = (href: string) => {
    if (href === "/" && location === "/") return true;
    if (href !== "/" && location.startsWith(href)) return true;
    return false;
  };

  // Desktop navigation
  const DesktopNav = () => (
    <div className="hidden md:flex items-center space-x-1">
      {navItems.map((item) => (
        <Button
          key={item.href}
          variant={isActive(item.href) ? "default" : "ghost"}
          size="sm"
          asChild
        >
          <Link href={item.href}>
            <span className="flex items-center gap-1">
              {item.icon}
              {item.label}
            </span>
          </Link>
        </Button>
      ))}
    </div>
  );

  // Mobile navigation using Sheet
  const MobileNav = () => (
    <div className="md:hidden">
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon">
            <Menu />
          </Button>
        </SheetTrigger>
        <SheetContent side="left">
          <SheetHeader className="text-left">
            <SheetTitle>NocoStudio</SheetTitle>
          </SheetHeader>
          <div className="flex flex-col space-y-2 mt-8">
            {navItems.map((item) => (
              <Button
                key={item.href}
                variant={isActive(item.href) ? "default" : "ghost"}
                size="sm"
                className="justify-start"
                asChild
                onClick={() => setSheetOpen(false)}
              >
                <Link href={item.href}>
                  <span className="flex items-center gap-2">
                    {item.icon}
                    {item.label}
                  </span>
                </Link>
              </Button>
            ))}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );

  // User menu for both desktop and mobile
  const UserMenu = () => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <UserCircle className="h-5 w-5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {user ? (
          <>
            <DropdownMenuLabel>
              <div className="flex flex-col">
                <span className="font-medium">{user.username}</span>
                <span className="text-xs text-gray-500">{user.email}</span>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/profile">Profile Settings</Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={logout}>
              <LogOut className="h-4 w-4 mr-2" />
              <span>Logout</span>
            </DropdownMenuItem>
          </>
        ) : (
          <>
            <DropdownMenuItem asChild>
              <Link href="/auth/login">Login</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/auth/register">Register</Link>
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-2">
          {isMobile && <MobileNav />}
          <Link href="/" className="flex items-center space-x-2">
            <span className="font-bold text-lg">NocoStudio</span>
          </Link>
          {!isMobile && user && <DesktopNav />}
        </div>
        <div className="flex items-center space-x-2">
          <UserMenu />
        </div>
      </div>
    </header>
  );
}