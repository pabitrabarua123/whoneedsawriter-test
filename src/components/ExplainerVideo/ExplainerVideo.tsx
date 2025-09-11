import { Flex, Text } from "@chakra-ui/react";
import { Section } from "../atoms/Section/Section";

export const ExplainerVideo = () => {
  return (
    <Section mt={{ base: "50px", lg: "200px" }}>
      <Flex flexDir="column" alignItems="center">
        <Text
          textAlign="center"
          mb="24px"
          color="brand.400"
          fontWeight={600}
          px="48px"
        >
          Check out true Auto Blogging On Steroids
        </Text>

        <Flex
          position="relative"
          borderRadius={["8px", "8px", "16px", "16px"]}
          overflow="hidden"
          w={["100%", "100%", "800px", "800px"]}
          h={["200px", "250px", "540px", "540px"]}
          maxW="calc(100vw - 48px)"
        >
          <iframe
            width="100%"
            height="100%"
            src="https://www.youtube.com/embed/P8YYa69A904"
            title="YouTube video player"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            style={{
              borderRadius: "inherit",
            }}
          />
        </Flex>
      </Flex>
    </Section>
  );
};
