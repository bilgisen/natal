import { ReactNode } from "react";
import { BirthDataProvider } from "@/components/providers/BirthDataProvider";
import DashboardTopNav from "./_components/navbar";
import DashboardSideBar from "./_components/sidebar";
import Chatbot from "./_components/chatbot";

export default async function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <BirthDataProvider>
      <div className="flex h-screen overflow-hidden w-full">
        <DashboardSideBar />
        <main className="flex-1 overflow-y-auto">
          <DashboardTopNav>{children}</DashboardTopNav>
        </main>
        <Chatbot />
      </div>
    </BirthDataProvider>
  );
}
