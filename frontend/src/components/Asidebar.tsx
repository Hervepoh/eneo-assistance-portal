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
  User,
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
        <SidebarHeader className="!pt-0 bg-gray-900 text-white dark:bg-background">
          <div className="flex h-[60px] items-center">
            <Logo fontSize="18px" size="30px" url="/home" />
            {open && (
              <Link
                to="/home"
                className="hidden md:flex ml-2 text-xl tracking-[-0.16px] text-white dark:text-[#fcfdffef] font-bold mb-0"
              >
                AssistanceApp
              </Link>
            )}
          </div>
        </SidebarHeader>
        <SidebarContent className="bg-gray-900 text-white dark:bg-background">
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
                          className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${isActive
                            ? 'bg-blue-600 text-white'
                            : 'text-gray-300 hover:bg-gray-800 hover:text-black'
                            }`}
                        >
                          <item.icon className="w-5 h-5" />
                          <span>{item.title}</span>
                        </a>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  )
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter className="bg-gray-900 text-white dark:bg-background">
          <SidebarMenu>
            <SidebarMenuItem>
              {isLoading ? (
                <Loader
                  size="24px"
                  className="place-self-center self-center animate-spin"
                />
              ) : (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <SidebarMenuButton
                      size="lg"
                      className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                    >
                      <Avatar className="h-8 w-8 rounded-full">
                        <AvatarFallback className="rounded-full border border-gray-500">
                          {user?.name?.split(" ")?.[0]?.charAt(0)}
                          {user?.name?.split(" ")?.[1]?.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="grid flex-1 text-left text-sm leading-tight">
                        <span className="truncate font-semibold">
                          {user?.name}
                        </span>
                        <span className="truncate text-xs">{user?.email}</span>
                      </div>
                      <EllipsisIcon className="ml-auto size-4" />
                    </SidebarMenuButton>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
                    side={"bottom"}
                    align="start"
                    sideOffset={4}
                  >
                    <DropdownMenuGroup>
                      <DropdownMenuItem
                        onClick={() =>
                          setTheme(theme === "light" ? "dark" : "light")
                        }
                      >
                        {theme === "dark" ? <MoonStarIcon /> : <SunIcon />}
                        Toggle theme
                      </DropdownMenuItem>
                    </DropdownMenuGroup>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => setIsOpen(true)}>
                      <LogOut />
                      Log out
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
