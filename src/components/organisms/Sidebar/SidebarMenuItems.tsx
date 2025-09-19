import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Link as NextJsChakraLink } from "@chakra-ui/next-js";
import {
  Box,
  Flex,
  chakra,
  Text,
  Link as ChakraLink,
  Spinner,
  useColorModeValue,
  Button,
  Badge,
} from "@chakra-ui/react";
import {
  TbUsers,
  TbHeartHandshake,
  TbBrandHipchat,
  TbStar,
  TbRocket,
  TbChecklist,
  TbKey,
  TbWand,
  TbHistory,
  TbUser,
} from "react-icons/tb";
import { FaFolderOpen } from "react-icons/fa6";
import { MdEditSquare } from "react-icons/md";
import { RiEditBoxFill } from "react-icons/ri";
import { RiEdit2Fill } from "react-icons/ri";
import { Routes } from "../../../data/routes";
import { brandName, cannyUrl } from "@/config";
import { Logo, LogoLight } from "@/components/atoms/Logo/Logo";
import { useRouter } from "next/navigation";

type MenuItemProps = {
  route?: Routes | string;
  loadingRoute: Routes | string;
  currentPage: Routes;
  children: any;
  isExternal?: boolean;
  onClick: (route: Routes | string) => void;
};

export const MenuItem: React.FC<MenuItemProps> = ({
  route,
  loadingRoute,
  currentPage,
  children,
  isExternal = false,
  onClick,
  ...props
}) => {
  const menuItemColor = useColorModeValue("blackAlpha.900", "whiteAlpha.900");
  const menuItemBgColor = useColorModeValue("blackAlpha.100", "whiteAlpha.100");
  const spinnerColor = useColorModeValue("blackAlpha.300", "whiteAlpha.300");

  const isActive = currentPage === route;
  const href = route && route.startsWith("http") ? route : `${route}`;
  
  const handleClick = (e: React.MouseEvent) => {
    if (route && !isActive && !isExternal && href.startsWith("/")) {
      onClick(route);
    }
    if (!route) {
      e.preventDefault();
      e.stopPropagation();
      return false;
    }
  };

  return (
    <chakra.div
      w="100%"
      _hover={{
        bgColor: menuItemBgColor,
      }}
      transition="background-color 0.2s ease-in-out"
      color={isActive ? "brand.600" : menuItemColor}
      bgColor={"transparent"}
      cursor="pointer"
      fontWeight={isActive ? "bold" : "normal"}
      borderTopWidth="0"
      borderRadius="8px"
      mb={["0", "0", "0", "4px"]}
      display="flex"
      flexDir="row"
      alignItems="center"
      justifyContent="left"
      as={!route ? "button" : "div"}
      sx={{
        ".Canny_BadgeContainer": {
          top: "16px",
          right: "8px",
        },
        ".Canny_Badge": {
          bgColor: "primary.500",
          overflow: "visible",
          border: "none",
          padding: 0,
          w: "6px",
          h: "6px",
        },
        ".Canny_Badge:after": {
          content: '""',
          zIndex: -1,
          w: "16px",
          h: "16px",
          top: "-5px",
          left: "-5px",
          position: "absolute",
          display: "block",
          boxSizing: "border-box",
          borderRadius: "45px",
          backgroundColor: "#b366b3",
          animation:
            "pulse-ring 1.25s cubic-bezier(0.215, 0.61, 0.355, 1) infinite",
        },
        div: {
          fontWeight: isActive ? "semibold" : "normal",
        },
      }}
      {...props}
    >
      {route && (
        <Link
          href={href}
          target={isExternal ? "_blank" : "_self"}
          passHref
          legacyBehavior
        >
          <ChakraLink
            _hover={{ textDecoration: "none" }}
            alignItems="center"
            boxSize="border-box"
            display="flex"
            flexDir="row"
            flexGrow={1}
            justifyContent="flex-start"
            m="0 16px"
            h="40px"
            fontWeight={isActive ? "bold" : "normal"}
            position="relative"
            target={isExternal ? "_blank" : "_self"}
            sx={{
              svg: {
                stroke: isActive ? "brand.600" : menuItemColor,
              },
            }}
            onClick={handleClick}
          >
            {children}
          </ChakraLink>
        </Link>
      )}
      {!route && (
        <Flex
          display="flex"
          flexGrow={1}
          alignItems="center"
          justifyContent="flex-start"
          flexDir="row"
          _hover={{ textDecoration: "none" }}
          m="0 16px"
          h="40px"
          sx={{
            svg: {
              stroke: "blackAlpha.800",
            },
          }}
        >
          {children}
        </Flex>
      )}
      {loadingRoute === route && (
        <Spinner size="xs" color={spinnerColor} mr="16px" />
      )}
    </chakra.div>
  );
};

type MenuLabelProps = {
  children: any;
};

export const MenuLabel: React.FC<MenuLabelProps> = ({ children }) => (
  <Box display="inline-block" fontWeight="500" fontSize="14px" ml="4px">
    {children}
  </Box>
);

type MenuProps = {
  currentPage: Routes;
  loadingRoute: Routes | string;
  onMenuItemClick: (route: Routes | string) => void;
};

export const SidebarMenuItems: React.FC<MenuProps> = ({
  currentPage,
  loadingRoute,
  onMenuItemClick,
}) => {
  const textColor = "#7f8aa3";
  const LogoComponent = useColorModeValue(LogoLight, Logo);
  const router = useRouter();

  // Prefetch routes on component mount
  useEffect(() => {
    const routesToPrefetch = [
      Routes.dashboard,
      Routes.articlegenerator,
      Routes.batch,
      Routes.account,
      Routes.apiKeys,
    ];
    
    routesToPrefetch.forEach(route => {
      router.prefetch(route);
    });
  }, [router]);

  return (
    <Box p="0" width="100%" bg="linear-gradient(180deg, #151923, #111622)" minH="100vh" color="white" borderRight="1px solid #ffffff14">
      <Flex alignItems="flex-start" flexDirection="column" p="16px 8px" gap="24px" h="100%">
        {/* AI Button */}
        <Flex w="100%" justifyContent="center">
          <Button
            color="white"
            fontWeight="bold"
            fontSize="16px"
            h="48px"
            w="48px"
            borderRadius="12px"
            mb="8px"
            p="6px"
          >
            <Image src="/logo-icon.png" alt="Logo" width={36} height={36} />
          </Button>
        </Flex>

        {/* Navigation Items */}
        <Flex flexDirection="column" gap="20px" w="100%" alignItems="center">
          {/* Generator */}
          <Flex flexDirection="column" alignItems="center" gap="4px" cursor="pointer" _hover={{ opacity: 0.8 }}>
            <Flex
              w="44px"
              h="44px"
              bg="transparent"
              borderRadius="12px"
              alignItems="center"
              justifyContent="center"
              border="1px solid #ffffff14"
              onClick={() => router.push(Routes.articlegenerator)}
            >
              <RiEdit2Fill size="16px" color="#fbbf24" />
            </Flex>
            <Text color={textColor} fontSize="11px" fontWeight="500" textAlign="center" onClick={() => router.push(Routes.articlegenerator)}>
              Generator
            </Text>
          </Flex>

          {/* Keywords */}
          <Flex flexDirection="column" alignItems="center" gap="4px" cursor="pointer" _hover={{ opacity: 0.8 }}>
           <Flex
              w="44px"
              h="44px"
              bg="transparent"
              border="1px solid #ffffff14"
              borderRadius="12px"
              alignItems="center"
              justifyContent="center"
            >
              <TbKey size="16px" color="#fbbf24" />
            </Flex>
            <Text color={textColor} fontSize="11px" fontWeight="500" textAlign="center">
              Keywords
            </Text>
          </Flex>

          {/* History */}
          <Flex flexDirection="column" alignItems="center" gap="4px" cursor="pointer" _hover={{ opacity: 0.8 }}>
            <Flex
              w="44px"
              h="44px"
              bg="transparent"
              border="1px solid #ffffff14"
              borderRadius="12px"
              alignItems="center"
              justifyContent="center"
            >
              <FaFolderOpen size="16px" color="#fbbf24" />
            </Flex>
            <Text color={textColor} fontSize="11px" fontWeight="500" textAlign="center">
              History
            </Text>
          </Flex>
        </Flex>

        {/* Spacer */}
        <Box flex="1" />

        {/* Account Section - Bottom Aligned */}
        <Flex flexDirection="column" gap="20px" w="100%" alignItems="center" mt="auto">
          {/* Account */}
          <Flex flexDirection="column" alignItems="center" gap="4px" cursor="pointer" _hover={{ opacity: 0.8 }} position="relative">
            <Flex
              w="44px"
              h="44px"
              bg="transparent"
              border="1px solid #ffffff14"
              borderRadius="50%"
              alignItems="center"
              justifyContent="center"
              position="relative"
            >
              <TbUser size="16px" color="#60a5fa" />
              <Badge
                position="absolute"
                top="90%"
                left="50%"
                transform="translate(-50%, -50%)"
                bgGradient="linear(to-r, blue.500, purple.500)"
                color="white"
                fontSize="8px"
                fontWeight="bold"
                borderRadius="3px"
                px="4px"
                py="1px"
              >
                PRO
              </Badge>
            </Flex>
            <Text color={textColor} fontSize="11px" fontWeight="500" textAlign="center">
              Account
            </Text>
          </Flex>

          {/* Upgrade */}
          <Flex flexDirection="column" alignItems="center" gap="4px" cursor="pointer" _hover={{ opacity: 0.8 }}>
            <Flex
              w="44px"
              h="44px"
              bgGradient="linear(to-r, blue.500, purple.500)"
              borderRadius="12px"
              alignItems="center"
              justifyContent="center"
            >
              <TbRocket size="16px" color="white" />
            </Flex>
            <Text color={textColor} fontSize="11px" fontWeight="500" textAlign="center">
              Upgrade
        </Text>
          </Flex>
        </Flex>
      </Flex>
    </Box>
  );
};
