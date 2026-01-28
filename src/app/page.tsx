import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";

export default async function Home() {
  const { user } = await getSession();

  // Not logged in - redirect to login
  if (!user) {
    redirect("/login");
  }

  // Redirect based on role
  switch (user.role) {
    case "admin":
      redirect("/admin");
    case "professional":
      redirect("/professional");
    case "patient":
      redirect("/patient");
    default:
      redirect("/login");
  }
}
