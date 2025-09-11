"use client";

import { Accordion, Flex, Heading, VStack, Text } from "@chakra-ui/react";
import { Link } from "@chakra-ui/next-js";
import { Section } from "../atoms/Section/Section";
import { FAQQuestionProps, FAQquestion } from "./FAQquestion";
import { brandName, supportEmail } from "@/config";
import { useColorModeValues } from "@/hooks/useColorModeValues";

const faqs: FAQQuestionProps[] = [
  {
    question: "What is WhoNeedsAWriter.com?",
    answer: `${brandName} is an advanced AI-powered content generation tool that creates well-researched, human-focused articles optimized for search engines and readers alike. Simply enter a keyword, and our AI generates comprehensive articles complete with high-quality images, all designed to engage real audiences while performing well in search results.`,
  },
  {
    question: "How do I get started?",
    answer: "Getting started is simple! Just visit our website, enter your target keyword, and our AI will generate a complete article for you. The process takes just minutes, compared to the 3-4 hours it would typically take a human writer to create the same quality content.",
  },
  {
    question: "Do I need any writing experience to use the tool?",
    answer: "Not at all! Our tool is designed for everyone, from complete beginners to experienced content creators. The AI handles all the heavy lifting - research, writing, structuring, and image generation - so you don't need any prior writing experience.",
  },
  {
    question: "How long are the generated articles?",
    answer: "Our articles are comprehensive and thorough, typically ranging from 1,000 to 4,000+ words, depending on your chosen settings. The length is optimized to provide complete coverage of the subject while maintaining reader engagement.",
  },
];

export const FAQ = () => {
  const { primaryTextColor } = useColorModeValues();
  return (
    <Section>
      <Flex
        bgColor="blackAlpha.50"
        w="90%"
        maxW="1000px"
        alignItems="center"
        justifyContent="center"
        p={["0", "16px", "40px", "54px"]}
        borderRadius="16px"
        flexDir="column"
      >
        <VStack maxW="800px">
          <Heading alignItems="center" textAlign="center" my="16px">
            Frequently asked questions
          </Heading>

          <Text color={primaryTextColor} textAlign="center">
            More questions? Email us at{" "}
            <Link
              href={`mailto:${supportEmail}`}
              fontWeight="bold"
              color="brand.500"
            >
              {supportEmail}
            </Link>{" "}
          </Text>
        </VStack>

        <Accordion mt="40px" w="100%" borderColor="blackAlpha.300" allowToggle>
          {faqs.map((faq, index) => {
            return (
              <FAQquestion
                question={faq.question}
                answer={faq.answer}
                key={index}
              />
            );
          })}
        </Accordion>
      </Flex>
    </Section>
  );
};
