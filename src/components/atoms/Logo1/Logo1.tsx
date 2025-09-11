import { Flex, Link } from "@chakra-ui/react";
import { TbRocket } from "react-icons/tb";
import { Box } from "@chakra-ui/react";
import Image from "next/image";

export const Logo1 = () => {
  return (
    <Link href="/">
      <Box
        w="40px"
        h="40px"
        borderRadius="5px"
        display="flex"
        alignItems="center"
        justifyContent="center"
        cursor="pointer"
        _hover={{ opacity: 0.8 }}
        transition="opacity 0.2s"
      >
        <Image
          src="/logo-icon.png"
          alt="Logo"
          width="40"
          height="40"
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
