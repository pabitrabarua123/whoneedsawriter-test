import React from "react";
import { Flex, HStack, Stack, Text } from "@chakra-ui/react";
import { Routes } from "../../../data/routes";
import { AccountMenu } from "@/components/AccountMenu/AccountMenu";
import { useSession } from "next-auth/react";
import { useMobile } from "@/hooks/useMobile";
import { MenuLabel, SidebarMenuItems } from "./SidebarMenuItems";
import { DarkModeSwitch } from "@/components/DarkModeSwitch/DarkModeSwitch";
import { useColorModeValues } from "@/hooks/useColorModeValues";
import { usePathname } from "next/navigation";

export const sidebarWidth = "80px";

type SideBarProps = {
  currentPage: Routes;
};

export const SideBar: React.FC<SideBarProps> = ({ currentPage }) => {
  const isMobile = useMobile();
  const { borderColor } = useColorModeValues();
  const pathname = usePathname();
  const { data: session } = useSession();

  const [loadingRoute, setLoadingRoute] = React.useState<Routes | string>("");

  // Clear loading state when pathname changes
  React.useEffect(() => {
    setLoadingRoute("");
  }, [pathname]);

  return (
    <Flex
      h="100vh"
      minW={sidebarWidth}
      maxW={sidebarWidth}
      flexDirection="column"
      position="fixed"
      top="0"
      bottom="auto"
      left="0"
      marginInlineStart={"0 !important"}
      zIndex="9999"
    >
      <SidebarMenuItems
        currentPage={currentPage}
        loadingRoute={loadingRoute}
        onMenuItemClick={setLoadingRoute}
      />
    </Flex>
  );
};
