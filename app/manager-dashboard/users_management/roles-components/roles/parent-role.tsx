"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../../../../components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../../../../components/ui/table";
import { Badge } from "../../../../../components/ui/badge";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../../../../components/ui/tabs";
import { Users, DollarSign, Calendar, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";

import { useTuitions } from "../../../../../src/hooks/useTuition";
import { useParents } from "../../../../../src/hooks/useParent";

interface User {
  user_id: number;
  username: string;
  roles: string[];
  full_name: string;
  email: string;
}

interface ParentRoleProps {
  user: User;
}

// Hàm định dạng số thành tiền VND
const formatVND = (amount: number): string => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount);
};

export function ParentRole({ user }: ParentRoleProps) {
  const { tuitions, fetchTuitionsByParentId, loading: tuitionLoading } = useTuitions();
  const { children, fetchParentChildren, loading: parentLoading, error: parentError } = useParents();

  const [loading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadInitialData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const parentId = user.user_id;
      await Promise.all([fetchParentChildren(parentId), fetchTuitionsByParentId(parentId)]);
    } catch (err: any) {
      console.error("Failed to load parent data:", err);
      setError("Không thể tải dữ liệu. Vui lòng thử lại sau.");
    } finally {
      setIsLoading(false);
    }
  }, [user.user_id, fetchParentChildren, fetchTuitionsByParentId]);

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  const totalOwed = tuitions.filter((t) => t.status !== "paid").reduce((sum, t) => sum + t.amount, 0);
  const overdueCount = tuitions.filter((t) => t.status === "overdue").length;
  const isLoading = loading || tuitionLoading || parentLoading;

  const cardsData = [
    { title: "Total Owed", value: formatVND(totalOwed), icon: DollarSign, color: "yellow" },
    { title: "Overdue Payments", value: overdueCount, icon: AlertCircle, color: "purple" },
    { title: "Children", value: children.length, icon: Users, color: "blue" },
    { title: "Total Tuitions", value: tuitions.length, icon: Calendar, color: "green" },
  ];

  return (
    <div className="space-y-6">
      {/* Error Message */}
      {error || parentError ? (
        <div className="bg-red-100 text-red-700 p-3 rounded-lg border border-red-300">
          {error || parentError}
        </div>
      ) : null}

      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cardsData.map((card, idx) => (
          <motion.div key={idx} whileHover={{ scale: 1.02 }} transition={{ duration: 0.2 }}>
            <Card className={`bg-background border-2 border-${card.color}-200 shadow-sm flex flex-col min-h-[120px]`}>
              <CardHeader className="flex items-center justify-between pb-2">
                <div className="flex items-center gap-2">
                  <card.icon className={`h-5 w-5 text-${card.color}-600`} />
                  <CardTitle className="text-sm font-medium text-foreground">{card.title}</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="flex justify-center items-center flex-1">
                {isLoading ? (
                  <div className={`h-8 w-24 bg-gray-200 animate-pulse rounded`}></div>
                ) : (
                  <div className={`text-3xl font-bold ${card.color === "red" ? "text-red-500" : "text-foreground"}`}>
                    {card.value}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Tabs */}
      <Tabs defaultValue="children" className="w-full">
        <TabsList className="grid w-full grid-cols-2 bg-background border-b-2 border-gray-200">
          <TabsTrigger
            value="children"
            className="cursor-pointer data-[state=active]:bg-gray-100 data-[state=active]:border-b-2 data-[state=active]:border-blue-500 data-[state=active]:text-foreground text-muted-foreground hover:text-foreground"
          >
            Children
          </TabsTrigger>
          <TabsTrigger
            value="tuitions"
            className="cursor-pointer data-[state=active]:bg-gray-100 data-[state=active]:border-b-2 data-[state=active]:border-blue-500 data-[state=active]:text-foreground text-muted-foreground hover:text-foreground"
          >
            Tuitions
          </TabsTrigger>
        </TabsList>

        {/* Children Tab */}
        <TabsContent value="children" className="space-y-4">
          <Card className="bg-background border-2 border-gray-200 shadow-sm">
            <CardHeader>
              <CardTitle className="text-center text-foreground">{user.full_name}'s Children</CardTitle>
              <CardDescription className="text-center text-muted-foreground">
                Information about {user.full_name}'s children
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-2">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="h-6 w-full bg-gray-200 animate-pulse rounded"></div>
                  ))}
                </div>
              ) : children.length === 0 ? (
                <div className="text-muted-foreground">No children found.</div>
              ) : (
                <div className="w-full overflow-x-auto">
                  <Table className="min-w-[800px]">
                    <TableHeader>
                      <TableRow className="border-gray-200">
                        <TableHead className="text-foreground min-w-[150px]">Student Name</TableHead>
                        <TableHead className="text-foreground min-w-[200px]">Email</TableHead>
                        <TableHead className="text-foreground min-w-[100px]">Gender</TableHead>
                        <TableHead className="text-foreground min-w-[120px]">Date of Birth</TableHead>
                        <TableHead className="text-foreground min-w-[130px]">Phone Number</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {children.map((child, index) => (
                        <TableRow key={index} className="border-gray-200">
                          <TableCell className="font-medium text-foreground">{child.name}</TableCell>
                          <TableCell className="text-foreground">{child.email}</TableCell>
                          <TableCell className="text-foreground">{child.gender}</TableCell>
                          <TableCell className="text-foreground">{child.date_of_birth}</TableCell>
                          <TableCell className="text-foreground">{child.phone_number}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tuitions Tab */}
        <TabsContent value="tuitions" className="space-y-4">
          <Card className="bg-background border-2 border-gray-200 shadow-sm">
            <CardHeader>
              <CardTitle className="text-center text-foreground">Tuition Information</CardTitle>
              <CardDescription className="text-center text-muted-foreground">
                Payment history and upcoming dues
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-2">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="h-6 w-full bg-gray-200 animate-pulse rounded"></div>
                  ))}
                </div>
              ) : tuitions.length === 0 ? (
                <div className="text-muted-foreground">No tuition records found.</div>
              ) : (
                <div className="w-full overflow-x-auto">
                  <Table className="min-w-[900px]">
                    <TableHeader>
                      <TableRow className="border-gray-200">
                        <TableHead className="text-foreground min-w-[60px]">ID</TableHead>
                        <TableHead className="text-foreground min-w-[150px]">Student</TableHead>
                        <TableHead className="text-foreground min-w-[180px]">Amount</TableHead>
                        <TableHead className="text-foreground min-w-[120px]">Term</TableHead>
                        <TableHead className="text-foreground min-w-[100px]">Status</TableHead>
                        <TableHead className="text-foreground min-w-[120px]">Due Date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {tuitions.map((tuition) => (
                        <TableRow key={tuition.id} className="border-gray-200">
                          <TableCell className="text-foreground">{tuition.id}</TableCell>
                          <TableCell className="text-foreground">{tuition.student}</TableCell>
                          <TableCell className="font-semibold text-foreground">{formatVND(tuition.amount)}</TableCell>
                          <TableCell className="text-foreground">{tuition.term}</TableCell>
                          <TableCell>
                            <Badge
                              className={
                                tuition.status === "paid"
                                  ? "bg-green-500 text-white"
                                  : tuition.status === "overdue"
                                  ? "bg-red-500 text-white"
                                  : "bg-yellow-500 text-white"
                              }
                            >
                              {tuition.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-foreground">{tuition.due_date}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
