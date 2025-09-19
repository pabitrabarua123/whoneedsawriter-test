import TeamSwitcher from "./components/team-switcher";
import { UserNav } from "./components/user-nav";
import { useUser } from "@/hooks/useUser";
import { User } from "@prisma/client";

const DashboardHeader = () => {
   const { user, isLoading } = useUser();
    
    // Calculate total credits
    const totalCredits = ((user as User)?.freeCredits || 0) + ((user as User)?.monthyBalance || 0) + ((user as User)?.lifetimeBalance || 0);

    return (
        <div className="border-b" style={{backgroundColor: '#080a0f80', height: '80px', position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000, backdropFilter: 'blur(8px)'}}>
        <div className="flex h-[100%] items-center px-4">
          <TeamSwitcher />
          <div className="ml-auto flex items-center space-x-4">
            {/* Credits Section */}
            <div className="flex items-center bg-[#151923] rounded-full px-4 py-2 mr-4 border border-[#ffffff14]">
              <span className="text-[#a9b1c3] text-sm mr-2">Credits:</span>
              <span className="text-white font-medium text-sm mr-2">
                {isLoading ? "..." : totalCredits.toFixed(1)}
              </span>
              <button className="ml-3 bg-[transparent] text-[#eef2f7] hover:bg-[#13161b] border border-[#ffffff14] text-xs font-medium px-3 py-2 rounded-full transition-colors" style={{boxShadow: '0 10px 30px rgba(0,0,0,.35)'}}>
                Buy More
              </button>
            </div>
            <div data-tour="user-nav">
              <UserNav />
            </div>
          </div>
        </div>
      </div>
    )
}

export default DashboardHeader;