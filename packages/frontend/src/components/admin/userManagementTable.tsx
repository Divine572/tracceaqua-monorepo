"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { useQuery } from "@tanstack/react-query";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { UserRole, UserStatus, type User } from "@/lib/types";
import { formatAddress, formatDate, getUserRoleColor } from "@/lib/utils";
import { Search, Filter, MoreHorizontal, UserCheck, UserX } from "lucide-react";
import Cookies from "universal-cookie";
import { useUsers } from "@/hooks/use-users";

// Mock data - replace with actual API call
const mockUsers: User[] = [
  {
    id: "1",
    address: "0x1234567890123456789012345678901234567890",
    email: "john.doe@example.com",
    name: "John Doe",
    role: UserRole.CONSUMER,
    status: UserStatus.ACTIVE,
    createdAt: new Date("2024-01-15"),
    updatedAt: new Date("2024-01-15"),
  },
  {
    id: "2",
    address: "0x2345678901234567890123456789012345678901",
    email: "jane.researcher@university.edu",
    name: "Jane Smith",
    role: UserRole.RESEARCHER,
    status: UserStatus.ACTIVE,
    createdAt: new Date("2024-01-10"),
    updatedAt: new Date("2024-01-10"),
  },
  {
    id: "3",
    address: "0x2345678901234567890123456789012345678943",
    email: "pending.user@company.com",
    name: "Pending User",
    role: UserRole.FARMER,
    status: UserStatus.PENDING,
    createdAt: new Date("2024-01-20"),
    updatedAt: new Date("2024-01-20"),
  },
];

export function UserManagementTable() {
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const { users, isLoading } = useUsers({searchTerm, roleFilter, statusFilter});

  const cookie = new Cookies();

  const userToken = cookie.get("user-token");

  // useEffect(() => {
  //   const getUsers = async () => {
  //     try {
  //       const response = await axios.get("/api/admin/users", {
  //         headers: {
  //           Authorization: `Bearer ${userToken}`,
  //         },
  //       });
  //       const data = response.data();
  //       console.log(data);
  //     } catch (error) {
  //       console.error(error);
  //     }
  //   };

  //   getUsers();
  // });

  // const { data: users = [], isLoading } = useQuery({
  //   queryKey: ["users", searchTerm, roleFilter, statusFilter],
  //   queryFn: async () => {
  //     // TODO: Replace with actual API call
  //     return mockUsers.filter((user) => {
  //       const matchesSearch =
  //         !searchTerm ||
  //         user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
  //         user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
  //         user.address?.toLowerCase().includes(searchTerm.toLowerCase());

  //       const matchesRole = roleFilter === "all" || user.role === roleFilter;
  //       const matchesStatus =
  //         statusFilter === "all" || user.status === statusFilter;

  //       return matchesSearch && matchesRole && matchesStatus;
  //     });
  //   },
  // });

  console.log(users)

  const handleApproveUser = async (userId: string) => {
    // TODO: Implement user approval API call
    console.log("Approving user:", userId);
  };

  const handleSuspendUser = async (userId: string) => {
    // TODO: Implement user suspension API call
    console.log("Suspending user:", userId);
  };

  const getStatusBadge = (status: UserStatus) => {
    const variants = {
      [UserStatus.ACTIVE]: "default",
      [UserStatus.PENDING]: "secondary",
      [UserStatus.SUSPENDED]: "destructive",
      [UserStatus.REJECTED]: "destructive",
      [UserStatus.BANNED]: "destructive",
    } as const;

    return <Badge variant={variants[status]}>{status}</Badge>;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>User Management</CardTitle>
        <CardDescription>
          Manage user accounts, roles, and permissions across the platform.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Filter by role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Roles</SelectItem>
              {Object.values(UserRole).map((role) => (
                <SelectItem key={role} value={role}>
                  {role}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              {Object.values(UserStatus).map((status) => (
                <SelectItem key={status} value={status}>
                  {status}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Users Table */}
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Join Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8">
                    Loading users...
                  </TableCell>
                </TableRow>
              ) : users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8">
                    No users found matching your criteria.
                  </TableCell>
                </TableRow>
              ) : (
                users.map((user) => {
                  const userInitials =
                    user.profile.firstName + user.profile.lastName
                      ? user.profile.firstName
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .toUpperCase()
                      : user.email?.[0]?.toUpperCase() || "??";

                  return (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <Avatar className="h-8 w-8">
                            {/* <AvatarImage
                              src={user.image!}
                              alt={user.name || ""}
                            /> */}
                            <AvatarFallback className="text-xs">
                              {userInitials}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">
                              {user.profile.firstName || "Anonymous"}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {user.email || formatAddress(user.address || "")}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getUserRoleColor(user.role)}>
                          {user.role}
                        </Badge>
                      </TableCell>
                      <TableCell>{getStatusBadge(user.status)}</TableCell>
                      <TableCell>{formatDate(user.createdAt)}</TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          {user.status === UserStatus.PENDING && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleApproveUser(user.id)}
                            >
                              <UserCheck className="h-4 w-4 mr-1" />
                              Approve
                            </Button>
                          )}
                          {user.status === UserStatus.ACTIVE && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleSuspendUser(user.id)}
                            >
                              <UserX className="h-4 w-4 mr-1" />
                              Suspend
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
