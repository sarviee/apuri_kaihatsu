
"use client";

import { Badge } from "@/components/ui/badge";
import { Link } from "@/navigation";
import { usePathname } from "@/navigation";
import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";

interface NavLinkProps {
  href: string;
  Icon: React.ElementType;
  name: string;
  badge?: number;
}

const NavLink: React.FC<NavLinkProps> = ({ href, Icon, name, badge }) => {
  const pathname = usePathname();
  const { data: session } = useSession();
  const { data: notificationCount } = useQuery<number>({
    queryKey: ["FormsCount", name],
    queryFn: async () => {
      if (href !== "/forms") return 0;
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/form/count`,
        {
          headers: {
            Authorization: `Bearer ${session?.sessionToken}`,
            "Content-Type": "application/json",
          },
        }
      );
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message);
      }
      const count = await res.json();
      return count.form_count;
    },
    enabled: !!session?.sessionToken,
  });

  return (
    <Link
      href={href}
      className={`flex items-center gap-3 rounded-lg text-[#5a8dde] px-4 py-2 transition-all duration-100 ease-in-out 
        hover:bg-gradient-to-r hover:from-[#4B70F5] hover:to-[#3DC2EC] hover:text-white 
        ${pathname.startsWith(href) ? "bg-[#4B70F5] text-white" : "text-white-700"}`}
    >
      <Icon className={`h-5 w-5 ${pathname.startsWith(href) ? "text-white" : "text-white-700"} hover:text-white`} />
      <span className={`text-lg font-medium ${pathname.startsWith(href) ? "text-white" : "text-white-700"}`}>
        {name}
      </span>
      {!!notificationCount && (
        <Badge className="ml-auto flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-red-500 text-white font-bold">
          {notificationCount}
        </Badge>
      )}
    </Link>
);
};

export default NavLink;