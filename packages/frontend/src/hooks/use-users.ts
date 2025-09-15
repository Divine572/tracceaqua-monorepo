import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { UsersResponse, User } from "@/lib/admin";

interface UseUserOptions {
  searchTerm: string;
  roleFilter: string;
  statusFilter: string;
}

export function useUsers({
  searchTerm,
  roleFilter,
  statusFilter,
}: UseUserOptions) {
  const { data: users = [], isLoading } = useQuery({
    queryKey: ["users", searchTerm, roleFilter, statusFilter],
    queryFn: async (): Promise<User[]> => {
      const response = await axios.get<UsersResponse>("/api/admin/users", {
        params: {
          search: searchTerm !== "all" ? searchTerm : undefined,
          role: roleFilter !== "all" ? roleFilter : undefined,
          status: statusFilter !== "all" ? statusFilter : undefined,
        },
      });
      console.log(response.data);
      return response.data.data;
      //   const userRecords = response.data.data;

      //   console.log(userRecords);

      //   return userRecords.filter((user) => {
      //     const matchesSearch =
      //       !searchTerm ||
      //       user.profile.firstName
      //         .toLowerCase()
      //         .includes(searchTerm.toLowerCase()) ||
      //       user.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
      //       user.profile.lastName
      //         .toLowerCase()
      //         .includes(searchTerm.toLowerCase());

      //     const matchesRole = roleFilter === "all" || user.role === roleFilter;

      //     const matchesStatus =
      //       statusFilter === "all" || user.status === statusFilter;

      //     return matchesSearch && matchesRole && matchesStatus;
      //   });
    },
    refetchOnWindowFocus: false,
  });

  return { users, isLoading };
}
