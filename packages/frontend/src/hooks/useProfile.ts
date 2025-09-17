import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { User, UserProfile } from "@/lib/types";

interface UserResponse {
    success: true,
    data: User
}

export function useProfile() {
  const { data: userProfile = {}, isLoading } = useQuery({
    queryKey: ["userProfile"],
    queryFn: async (): Promise<UserProfile> => {
      const response = await axios.get<UserResponse>("/api/auth/me");
      const userData = response.data.data
      return userData.profile!;
    },
    refetchOnWindowFocus: false,
  });

  return { userProfile, isLoading };
}
