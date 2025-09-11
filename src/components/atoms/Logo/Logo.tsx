import { Flex } from "@chakra-ui/react";
import { TbRocket } from "react-icons/tb";
import { Box } from "@chakra-ui/react";
import Image from "next/image";
import Link from "next/link";

export const Logo = () => {
  return (
    <Link href="/">
      <Box
        w="120px"
        h="80px"
        borderRadius="5px"
        display="flex"
        alignItems="center"
        justifyContent="center"
        cursor="pointer"
        _hover={{ opacity: 0.8 }}
        transition="opacity 0.2s"
      >
        <Image
          src="/logo.png"
          alt="Logo"
          width="120"
          height="80"
        />
      </Box>
    </Link>
  );
};

export const LogoLight = () => {
  return (
    <Link href="/">
      <Box
        w="120px"
        h="80px"
        borderRadius="5px"
        display="flex"
        alignItems="center"
        justifyContent="center"
        cursor="pointer"
        _hover={{ opacity: 0.8 }}
        transition="opacity 0.2s"
      >
        <Image
          src="/logo-light.png"
          alt="Logo"
          width="120"
          height="80"
        />
      </Box>
    </Link>
  );
};

export const LogoSmall = () => {
  return (
    <Flex
      w="18px"
      h="18px"
      bgColor="brand.500"
      borderRadius="4px"
      alignItems="center"
      justifyContent="center"
      color="white"
    >
      <TbRocket size="14px" />
    </Flex>
  );
};
