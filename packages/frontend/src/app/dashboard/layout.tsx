import { Header } from "@/components/dashboard/Header";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div>
      <Header />
      <>{children}</>
    </div>
  );
}
