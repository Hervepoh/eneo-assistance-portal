import { useState } from "react";
import { useLocation, Link } from "react-router-dom";
import {
  AlertCircle,
  CheckCircle,
  Clock,
  EllipsisIcon,
  FileText,
  Home,
  IdCard,
  Loader,
  Lock,
  LogOut,
  MoonStarIcon,
  Plus,
  Settings,
  Shield,
  SunIcon,
} from "lucide-react";
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarGroupContent,
  SidebarGroup,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import Logo from "@/components/logo";
import { useAuthContext } from "@/context/auth-provider";
import LogoutDialog from "./LogoutDialog";
import { useTheme } from "@/context/theme-provider";

const Asidebar = () => {
  const { theme, setTheme } = useTheme();
  const { isLoading, user } = useAuthContext();

  const { open } = useSidebar();
  const [isOpen, setIsOpen] = useState(false);

  const location = useLocation(); // 👈 récupère le path actuel

  const items = [
    {
      title: "Tableau de board",
      url: "/home",
      icon: Home,
    },
    {
      title: "Nouvelle demande",
      url: "/request",
      icon: Plus,
    },
    {
      title: "Mes demandes",
      url: "/my-requests",
      icon: FileText,
    },
    {
      title: "À valider (N+1)",
      url: "/requests-to-validate-suph",
      icon: CheckCircle,
    },
    {
      title: "À vérifier",
      url: "/requests-to-verify",
      icon: AlertCircle,
    },
    {
      title: "À valider (DEC)",
      url: "/requests-to-validate-dec",
      icon: CheckCircle,
    },
    {
      title: "À valider (BAO)",
      url: "/requests-to-validate-bao",
      icon: CheckCircle,
    },
     {
      title: "En cours",
      url: "/requests-in-process",
      icon: Clock,
    },
    {
      title: "Sessions",
      url: "/sessions",
      icon: IdCard,
    },
     {
      title: "Sécurité",
      url: "/security",
      icon: Lock,
    },
    {
      title: "Administration",
      url: "/admin",
      icon: Shield,
    },

    {
      title: "Settings",
      url: "#",
      icon: Settings,
    },
  ];
  return (
    <>
      <Sidebar collapsible="icon">
        <SidebarHeader className="!pt-0 bg-gray-900 text-white dark:bg-slate-900/95 dark:border-b dark:border-slate-800">
          <div className="flex h-[60px] items-center">
            <Logo fontSize="18px" size="30px" url="/home" />
            {open && (
              <Link
                to="/home"
                className="hidden md:flex ml-2 text-xl tracking-[-0.16px] text-white dark:text-slate-100 font-bold mb-0 transition-colors"
              >
                AssistanceApp
              </Link>
            )}
          </div>
        </SidebarHeader>
        <SidebarContent className="bg-gray-900 text-white dark:bg-slate-900/95 dark:border-r dark:border-slate-800">
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                {items.map((item) => {
                  const isActive =
                    location.pathname === item.url ||
                    (item.url !== "/home" &&  item.url !== "/request" && location.pathname.startsWith(item.url)); // ✅ comparaison dynamique
                  return (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton asChild>
                        {/* <a href={item.url} className="!text-[15px]">
                        <item.icon className="w-5 h-5" />
                        <span>{item.title}</span>
                      </a> */}
                        <a
                          key={item.url}
                          href={item.url}
                          className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-all duration-200 ${isActive
                            ? 'bg-blue-600 text-white dark:bg-blue-600/90 dark:text-white shadow-lg dark:shadow-blue-900/20 border-l-4 border-l-blue-400'
                            : 'text-gray-300 hover:bg-gray-800 hover:text-white dark:text-slate-300 dark:hover:bg-slate-800/70 dark:hover:text-slate-100'
                            }`}
                        >
                          <item.icon className={`w-5 h-5 transition-colors ${isActive ? 'text-blue-100' : 'text-gray-400 dark:text-slate-400'}`} />
                          <span className="font-medium">{item.title}</span>
                        </a>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  )
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter className="bg-gray-900 text-white dark:bg-slate-900/95 dark:border-t dark:border-slate-800">
          <SidebarMenu>
            <SidebarMenuItem>
              {isLoading ? (
                <Loader
                  size="24px"
                  className="place-self-center self-center animate-spin text-blue-500"
                />
              ) : (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <SidebarMenuButton
                      size="lg"
                      className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground hover:bg-slate-800/70 dark:hover:bg-slate-800/50 transition-colors"
                    >
                      <Avatar className="h-8 w-8 rounded-full">
                        <AvatarFallback className="rounded-full border border-gray-500 dark:border-slate-600 bg-blue-600 dark:bg-blue-600/90 text-white">
                          {user?.name?.split(" ")?.[0]?.charAt(0)}
                          {user?.name?.split(" ")?.[1]?.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="grid flex-1 text-left text-sm leading-tight">
                        <span className="truncate font-semibold text-white dark:text-slate-100">
                          {user?.name}
                        </span>
                        <span className="truncate text-xs text-gray-300 dark:text-slate-400">{user?.email}</span>
                      </div>
                      <EllipsisIcon className="ml-auto size-4 text-gray-400 dark:text-slate-500" />
                    </SidebarMenuButton>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg dark:bg-slate-800 dark:border-slate-700 shadow-xl"
                    side={"bottom"}
                    align="start"
                    sideOffset={4}
                  >
                    <DropdownMenuGroup>
                      <DropdownMenuItem
                        onClick={() =>
                          setTheme(theme === "light" ? "dark" : "light")
                        }
                        className="flex items-center gap-3 px-3 py-2 hover:bg-slate-700 dark:hover:bg-slate-700/70 transition-colors cursor-pointer"
                      >
                        {theme === "dark" ? (
                          <SunIcon className="w-4 h-4 text-yellow-500" />
                        ) : (
                          <MoonStarIcon className="w-4 h-4 text-blue-500" />
                        )}
                        <span className="font-medium">
                          {theme === "dark" ? "Mode clair" : "Mode sombre"}
                        </span>
                      </DropdownMenuItem>
                    </DropdownMenuGroup>
                    <DropdownMenuSeparator className="dark:bg-slate-700" />
                    <DropdownMenuItem 
                      onClick={() => setIsOpen(true)}
                      className="flex items-center gap-3 px-3 py-2 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 transition-colors cursor-pointer"
                    >
                      <LogOut className="w-4 h-4" />
                      <span className="font-medium">Se déconnecter</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
        <SidebarRail />
      </Sidebar>

      <LogoutDialog isOpen={isOpen} setIsOpen={setIsOpen} />
    </>
  );
};

export default Asidebar;
