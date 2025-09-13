import { UserData } from "@/lib/types";
import { toast } from "sonner";

export const registerUser = async (
  userData: UserData,
) => {
  try {
    const response = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userData),
    });

    if (!response.ok)
      throw new Error("Failed to register user. Please try again");

    const responseData = await response.json();
    const data = responseData.data;
    console.log(data);
    // return data.user;
  } catch (error) {
    toast.error("Failed to register user. Please try again");
  }
};
