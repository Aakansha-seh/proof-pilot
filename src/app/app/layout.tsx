import { Sidebar } from "@/components/app/sidebar";
import { Header } from "@/components/app/header";
import { MobileNav } from "@/components/app/mobile-nav";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <Header />
        <main className="flex-1 px-5 pb-24 pt-6 md:px-8 md:pb-8">{children}</main>
        <MobileNav />
      </div>
    </div>
  );
}
