"use client";

import {
  Flex,
  Spacer,
  Stack,
  Text,
  Tooltip,
  VStack,
  HStack,
  useColorModeValue,
} from "@chakra-ui/react";
import { TbBrandDiscord, TbBrandX, TbBrandYoutube } from "react-icons/tb";
import { Section } from "../atoms/Section/Section";
import { Link } from "@chakra-ui/next-js";
import { discordLink, twitterLink, youTubeLink } from "@/config";
import { useColorModeValues } from "@/hooks/useColorModeValues";
import { Routes } from "@/data/routes";
import { Logo, LogoLight } from "../atoms/Logo/Logo";

export const Footer = () => {
  const { secondaryTextColor, borderColor } = useColorModeValues();
    // Use LogoLight for light mode, Logo for dark mode
    const LogoComponent = useColorModeValue(LogoLight, Logo);
  return (
    <Section flexDir="column" my="80px">
      <Flex
        w="90%"
        maxW="1000px"
        flexDir="column"
        fontSize="12px"
        color={secondaryTextColor}
      >
        <Flex
          borderTop="1px solid gray"
          borderColor={borderColor}
          mt="32px"
          mb="80px"
        />

        <Flex
          mb="40px"
          alignItems="flex-start"
          flexDir={["column", "column", "row"]}
        >
          <Stack alignItems="flex-start" mr="32px">
            <Stack direction="row" alignItems="center">
              <LogoComponent />
            </Stack>
            {/* <Text fontWeight={500} fontSize="14px">
            Increase Blog Traffic by 10x
            </Text> */}
<a href="https://theresanaiforthat.com/ai/who-needs-a-writer/?ref=featured&v=7171533" target="_blank" rel="nofollow"><img width="300" src="https://media.theresanaiforthat.com/featured-on-taaft.png?width=600"/></a>
            {/* <BuiltWith /> */}
          </Stack>
          <Spacer />
          <Stack
            direction={["column", "column", "row"]}
            spacing="24px"
            alignItems="flex-start"
            mt={["16px", "16px", "0"]}
          >
            <VStack mr="8px" alignItems="flex-start">
              <Text fontWeight="bold" textTransform="uppercase">
                Links
              </Text>
              <Link href={Routes.blog} mr="8px">
                Blog
              </Link>
              <Link href="/#pricing" mr="8px">
                Pricing
              </Link>
              <Link href={Routes.affiliates} isExternal alignItems="flex-start">
                Affiliate — Earn 20%
              </Link>
            </VStack>

            <VStack mr="8px" alignItems="flex-start">
              <Text fontWeight="bold" textTransform="uppercase">
                Legal
              </Text>
              <Link href={Routes.privacy}>Privacy Policy</Link>
              <Link href={Routes.terms}>Terms and Conditions</Link>
            </VStack>

            <VStack spacing="16px" alignItems="flex-start">
              <Text fontWeight="bold" textTransform="uppercase">
                Social
              </Text>
              <HStack>
                <Tooltip label="Join Discord community" placement="top">
                  <Link href={discordLink} target="_blank" rel="noopener">
                    <TbBrandDiscord size="20px" />
                  </Link>
                </Tooltip>
                <Tooltip label="Follow X account" placement="top">
                  <Link href={twitterLink} target="_blank" rel="noopener">
                    <TbBrandX size="20px" />
                  </Link>
                </Tooltip>
                <Tooltip label="Join YouTube Channel" placement="top">
                  <Link href={youTubeLink} target="_blank" rel="noopener">
                    <TbBrandYoutube size="20px" />
                  </Link>
                </Tooltip>
              </HStack>
            </VStack>
          </Stack>
        </Flex>

        <Text fontSize="12px" color={secondaryTextColor} mb="40px">
          <br />© Copyright {new Date().getFullYear()} <a href="https://whoneedsawriter.com">whoneedsawriter.com</a>. All rights
          reserved.
        </Text>
      </Flex>
    </Section>
  );
};
