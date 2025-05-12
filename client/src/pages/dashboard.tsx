import { useState } from "react";
import { Link } from "wouter";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { 
  ArrowLeft, 
  ArrowRight, 
  Database, 
  FormInput,
  GitBranch, 
  Shield,
  LayoutDashboard,
  Users,
  FileText,
  ArrowUpRight,
  Clock,
  CheckCircle,
  AlertCircle,
  TableProperties
} from "lucide-react";

// Mock data for charts and statistics
const activityData = [
  { name: "Mon", users: 5, schemas: 2, forms: 1, workflows: 0 },
  { name: "Tue", users: 7, schemas: 3, forms: 4, workflows: 1 },
  { name: "Wed", users: 10, schemas: 1, forms: 2, workflows: 3 },
  { name: "Thu", users: 12, schemas: 4, forms: 6, workflows: 2 },
  { name: "Fri", users: 15, schemas: 2, forms: 3, workflows: 5 },
  { name: "Sat", users: 8, schemas: 1, forms: 1, workflows: 0 },
  { name: "Sun", users: 6, schemas: 0, forms: 0, workflows: 0 }
];

const resourceData = [
  { name: "Users", value: 45, color: "#8884d8" },
  { name: "Schemas", value: 12, color: "#82ca9d" },
  { name: "Forms", value: 18, color: "#ffc658" },
  { name: "Workflows", value: 11, color: "#ff8042" },
  { name: "Roles", value: 5, color: "#0088fe" }
];

const workflowStatusData = [
  { name: "Completed", value: 85, color: "#4ade80" },
  { name: "Failed", value: 10, color: "#f87171" },
  { name: "Pending", value: 5, color: "#fbbf24" }
];

const recentActivities = [
  { 
    id: "1", 
    type: "schema", 
    action: "created", 
    name: "Products", 
    user: "admin", 
    time: "10 minutes ago" 
  },
  { 
    id: "2", 
    type: "form", 
    action: "updated", 
    name: "User Registration", 
    user: "editor1", 
    time: "30 minutes ago" 
  },
  { 
    id: "3", 
    type: "workflow", 
    action: "executed", 
    name: "New User Onboarding", 
    user: "system", 
    time: "1 hour ago" 
  },
  { 
    id: "4", 
    type: "role", 
    action: "created", 
    name: "Content Manager", 
    user: "admin", 
    time: "3 hours ago" 
  },
  { 
    id: "5", 
    type: "user", 
    action: "created", 
    name: "johnsmith", 
    user: "admin", 
    time: "5 hours ago" 
  }
];

const getActivityIcon = (type: string) => {
  switch (type) {
    case "schema":
      return <Database className="h-4 w-4 text-blue-500" />;
    case "form":
      return <FormInput className="h-4 w-4 text-green-500" />;
    case "workflow":
      return <GitBranch className="h-4 w-4 text-orange-500" />;
    case "role":
      return <Shield className="h-4 w-4 text-purple-500" />;
    case "user":
      return <Users className="h-4 w-4 text-indigo-500" />;
    default:
      return <FileText className="h-4 w-4 text-gray-500" />;
  }
};

export default function Dashboard() {
  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center mb-6">
        <Button variant="outline" size="sm" asChild className="mr-4">
          <Link href="/">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Link>
        </Button>
        <h1 className="text-3xl font-bold">Dashboard</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Users</p>
                <h3 className="text-2xl font-bold mt-1">45</h3>
              </div>
              <div className="p-2 bg-primary/10 rounded-full">
                <Users className="h-5 w-5 text-primary" />
              </div>
            </div>
            <div className="flex items-center mt-4 text-sm">
              <ArrowUpRight className="h-3 w-3 text-green-500 mr-1" />
              <span className="text-green-500 font-medium">12%</span>
              <span className="text-muted-foreground ml-1">from last month</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Schemas</p>
                <h3 className="text-2xl font-bold mt-1">12</h3>
              </div>
              <div className="p-2 bg-primary/10 rounded-full">
                <Database className="h-5 w-5 text-primary" />
              </div>
            </div>
            <div className="flex items-center mt-4 text-sm">
              <ArrowUpRight className="h-3 w-3 text-green-500 mr-1" />
              <span className="text-green-500 font-medium">8%</span>
              <span className="text-muted-foreground ml-1">from last month</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Forms</p>
                <h3 className="text-2xl font-bold mt-1">18</h3>
              </div>
              <div className="p-2 bg-primary/10 rounded-full">
                <FormInput className="h-5 w-5 text-primary" />
              </div>
            </div>
            <div className="flex items-center mt-4 text-sm">
              <ArrowUpRight className="h-3 w-3 text-green-500 mr-1" />
              <span className="text-green-500 font-medium">15%</span>
              <span className="text-muted-foreground ml-1">from last month</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Workflows</p>
                <h3 className="text-2xl font-bold mt-1">11</h3>
              </div>
              <div className="p-2 bg-primary/10 rounded-full">
                <GitBranch className="h-5 w-5 text-primary" />
              </div>
            </div>
            <div className="flex items-center mt-4 text-sm">
              <ArrowUpRight className="h-3 w-3 text-green-500 mr-1" />
              <span className="text-green-500 font-medium">20%</span>
              <span className="text-muted-foreground ml-1">from last month</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Activity This Week</CardTitle>
            <CardDescription>
              Usage statistics by day
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={activityData}
                  margin={{
                    top: 10,
                    right: 30,
                    left: 0,
                    bottom: 0,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="users"
                    stackId="1"
                    stroke="#8884d8"
                    fill="#8884d8"
                  />
                  <Area
                    type="monotone"
                    dataKey="schemas"
                    stackId="1"
                    stroke="#82ca9d"
                    fill="#82ca9d"
                  />
                  <Area
                    type="monotone"
                    dataKey="forms"
                    stackId="1"
                    stroke="#ffc658"
                    fill="#ffc658"
                  />
                  <Area
                    type="monotone"
                    dataKey="workflows"
                    stackId="1"
                    stroke="#ff8042"
                    fill="#ff8042"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Resources Distribution</CardTitle>
            <CardDescription>
              Distribution of system resources
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={resourceData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {resourceData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value, name) => [`${value}`, name]}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Workflow Status</CardTitle>
            <CardDescription>
              Execution success rate
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={workflowStatusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label
                  >
                    {workflowStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value, name) => [`${value}%`, name]}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Recent Activities</CardTitle>
            <CardDescription>
              Latest actions in the system
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivities.map((activity) => (
                <div key={activity.id} className="flex items-start">
                  <div className="mr-4">
                    {getActivityIcon(activity.type)}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <p className="font-medium">
                        <span className="text-muted-foreground">{activity.user}</span> {activity.action} {activity.type} "{activity.name}"
                      </p>
                      <span className="text-xs text-muted-foreground">
                        {activity.time}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
          <CardFooter className="justify-end">
            <Button variant="outline" size="sm">
              View All Activities
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardFooter>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 mt-6">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>
              Shortcuts to common actions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Button asChild className="h-auto flex flex-col p-4 gap-2 items-center justify-center">
                <Link href="/schema">
                  <Database className="h-8 w-8 mb-2" />
                  <span>Create Schema</span>
                </Link>
              </Button>
              <Button asChild className="h-auto flex flex-col p-4 gap-2 items-center justify-center">
                <Link href="/forms">
                  <FormInput className="h-8 w-8 mb-2" />
                  <span>Build Form</span>
                </Link>
              </Button>
              <Button asChild className="h-auto flex flex-col p-4 gap-2 items-center justify-center">
                <Link href="/workflows">
                  <GitBranch className="h-8 w-8 mb-2" />
                  <span>Create Workflow</span>
                </Link>
              </Button>
              <Button asChild className="h-auto flex flex-col p-4 gap-2 items-center justify-center">
                <Link href="/data">
                  <TableProperties className="h-8 w-8 mb-2" />
                  <span>Explore Data</span>
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}