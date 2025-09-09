import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import SideNav from "@/components/dashboard/SideNav";
import TopNav from "@/components/dashboard/TopNav";

export const metadata = {
    title: "webgenie | dashboard",
    description: "dashboard",
};

export default async function DashboardLayout({ children }) {
    const session = await getServerSession(authOptions);

    return (
        <div className="flex h-screen bg-gray-950">
            <SideNav />
            <div className="flex-1 flex flex-col">
                <TopNav user={session?.user} />
                <main className="flex-1 overflow-y-auto p-6 text-gray-300">
                    {children}
                </main>
            </div>
        </div>
    );
}
