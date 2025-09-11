import { Heading, Stack } from "@chakra-ui/react";
import { Section } from "../atoms/Section/Section";
import { Testimonial, TestimonialProps } from "./Testimonial";
import { brandName } from "@/config";

export const testimonials: TestimonialProps[] = [
  {
    text: `What used to take me an entire weekend now takes 5 minutes, and the engagement on our content has tripled - this tool is a complete game-changer for startups.`,
    name: "Marcus Rodriguez",
    highlightSentences: ["Now I keep recommending this to all my friends"],
    job: "Founder & CEO at GrowthHacker Pro",
    pictureUrl: "https://i.pravatar.cc/150?u=a042581f4e29026704g",
  },
  {
    text: `${brandName} increased our blog traffic by 40% and helped us capture 12 featured snippets in just two months - it's like having a tireless senior writer on demand.`,
    name: "Sarah Chen",
    highlightSentences: ["10/10 experience overall"],
    job: "Digital Marketing Manager at TechFlow Solutions",
    pictureUrl: "https://i.pravatar.cc/150?u=a042581f4e29026704f",
  },
];

export const Testimonials = () => {
  return (
    <Section flexDir="column" mb="160px" mt="120px" px="40px">
      <Heading alignItems="center" textAlign="center" my="16px" px="40px">
        You&apos;re in a good company
      </Heading>

      <Stack mt="40px" spacing="80px">
        {testimonials.map((testimonial, index) => {
          return (
            <Testimonial
              key={index}
              text={testimonial.text}
              name={testimonial.name}
              highlightSentences={testimonial.highlightSentences}
              job={testimonial.job}
              pictureUrl={testimonial.pictureUrl}
            />
          );
        })}
      </Stack>
    </Section>
  );
};
