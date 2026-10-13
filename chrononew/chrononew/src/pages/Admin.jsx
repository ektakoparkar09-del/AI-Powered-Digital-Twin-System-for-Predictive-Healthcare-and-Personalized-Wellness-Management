const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import React from "react";
import { useQuery } from "@tanstack/react-query";

import { useAuth } from "@/lib/AuthContext";
import { Shield, Users, FileText, Brain, Activity, BarChart3 } from "lucide-react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { getScoreColor } from "@/lib/healthUtils";
import { format } from "date-fns";
import { Navigate } from "react-router-dom";

export default function Admin() {
  const { user } = useAuth();

  const { data: users } = useQuery({
    queryKey: ["admin-users"],
    queryFn: () => db.entities.User.list(),
    enabled: user?.role === "admin",
  });

  const { data: profiles } = useQuery({
    queryKey: ["admin-profiles"],
    queryFn: () => db.entities.HealthProfile.list("-created_date", 50),
    enabled: user?.role === "admin",
  });

  const { data: snapshots } = useQuery({
    queryKey: ["admin-snapshots"],
    queryFn: () => db.entities.HealthSnapshot.list("-created_date", 50),
    enabled: user?.role === "admin",
  });

  if (user?.role !== "admin") {
    return <Navigate to="/" replace />;
  }

  const totalUsers = users?.length || 0;
  const totalProfiles = profiles?.length || 0;
  const totalSnapshots = snapshots?.length || 0;
  const avgScore = profiles?.length
    ? Math.round(profiles.reduce((sum, p) => sum + (p.health_score || 0), 0) / profiles.length)
    : 0;

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl md:text-3xl font-bold font-heading flex items-center gap-3">
          <Shield className="w-7 h-7 text-primary" /> Admin Panel
        </h1>
        <p className="text-sm text-muted-foreground mt-1">System overview and user management</p>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { icon: Users, label: "Total Users", value: totalUsers, color: "gradient-primary" },
          { icon: FileText, label: "Health Profiles", value: totalProfiles, color: "bg-emerald-500" },
          { icon: Activity, label: "Health Snapshots", value: totalSnapshots, color: "bg-purple-500" },
          { icon: Brain, label: "Avg Health Score", value: avgScore, color: "bg-orange-500" },
        ].map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="glass-card rounded-2xl p-5"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-muted-foreground">{s.label}</p>
                <p className="text-2xl font-bold font-display mt-1">{s.value}</p>
              </div>
              <div className={`w-10 h-10 rounded-xl ${s.color} flex items-center justify-center`}>
                <s.icon className="w-5 h-5 text-white" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Users Table */}
      <Card className="glass-card border-border/50">
        <CardHeader>
          <CardTitle className="text-base font-heading flex items-center gap-2">
            <Users className="w-4 h-4 text-primary" /> Registered Users
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Joined</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(users || []).map(u => (
                <TableRow key={u.id}>
                  <TableCell className="font-medium">{u.full_name || "N/A"}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{u.email}</TableCell>
                  <TableCell><Badge variant={u.role === "admin" ? "default" : "secondary"}>{u.role}</Badge></TableCell>
                  <TableCell className="text-sm text-muted-foreground">{u.created_date ? format(new Date(u.created_date), "MMM d, yyyy") : "N/A"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Profiles Table */}
      <Card className="glass-card border-border/50">
        <CardHeader>
          <CardTitle className="text-base font-heading flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-primary" /> Health Profiles Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Age</TableHead>
                <TableHead>Gender</TableHead>
                <TableHead>BMI</TableHead>
                <TableHead>Health Score</TableHead>
                <TableHead>Heart Risk</TableHead>
                <TableHead>Diabetes Risk</TableHead>
                <TableHead>Updated</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(profiles || []).map(p => {
                const sInfo = getScoreColor(p.health_score || 0);
                return (
                  <TableRow key={p.id}>
                    <TableCell>{p.age}</TableCell>
                    <TableCell className="capitalize">{p.gender}</TableCell>
                    <TableCell>{p.bmi}</TableCell>
                    <TableCell><Badge className={`${sInfo.bg} text-white`}>{p.health_score}</Badge></TableCell>
                    <TableCell>{p.heart_disease_risk}%</TableCell>
                    <TableCell>{p.diabetes_risk}%</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{p.updated_date ? format(new Date(p.updated_date), "MMM d") : "N/A"}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}