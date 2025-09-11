"use client";

import {
  Modal,
  ModalOverlay,
  ModalContent,
  Button,
  Text,
  VStack,
  HStack,
  Box,
} from "@chakra-ui/react";
import { TbX } from "react-icons/tb";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import axios from "axios";

interface FirstLoginPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FirstLoginPopup = ({ isOpen, onClose }: FirstLoginPopupProps) => {
  const router = useRouter();
  const [showConfetti, setShowConfetti] = useState(false);

  const handleGetStarted = () => {
    onClose();
    router.push("/article-generator");
  };

  useEffect(() => {
    if (isOpen) {
      // Mark popup as shown in the database
      axios.post("/api/first-login").catch(console.error);
      
      // Start confetti effect
      const timer = setTimeout(() => setShowConfetti(true), 500);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      closeOnOverlayClick={false}
      isCentered
      size="lg"
    >
      <ModalOverlay 
        bg="rgba(10, 15, 28, 0.8)" 
        backdropFilter="blur(1px)"
        style={{
          animation: isOpen ? 'fadeIn 0.4s ease-out' : undefined
        }}
      />
      <ModalContent
        maxW="480px"
        w="90%"
        bg="linear-gradient(145deg, #1e293b 0%, #0f172a 100%)"
        border="1px solid #334155"
        borderRadius="20px"
        color="white"
        p={8}
        position="relative"
        boxShadow="0 0 0 1px rgba(148, 163, 184, 0.1), 0 20px 60px rgba(0, 0, 0, 0.6)"
        style={{
          animation: isOpen ? 'slideUp 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)' : undefined
        }}
      >
        {/* Close Button */}
        <Button
          position="absolute"
          top="20px"
          right="20px"
          background="none"
          border="none"
          color="#64748b"
          w="32px"
          h="32px"
          minW="32px"
          p={0}
          borderRadius="6px"
          opacity={0.7}
          _hover={{ bg: "rgba(100, 116, 139, 0.1)", opacity: 1 }}
          onClick={onClose}
        >
          <TbX size={24} />
        </Button>

        <VStack spacing={6} textAlign="center">
          {/* Success Badge */}
          <Box
            display="inline-flex"
            alignItems="center"
            gap={2}
            bg="linear-gradient(135deg, rgba(34, 197, 94, 0.15), rgba(21, 128, 61, 0.15))"
            border="1px solid rgba(34, 197, 94, 0.3)"
            px={4}
            py={2}
            borderRadius="50px"
            fontSize="14px"
            color="#4ade80"
            fontWeight={500}
            _before={{
              content: '"✓"',
              color: "#22c55e",
              fontWeight: "bold",
              marginRight: "4px"
            }}
          >
            Account Created Successfully
          </Box>

          {/* Main Title */}
          <Text
            fontSize="28px"
            fontWeight={800}
            lineHeight={1.2}
            bgGradient="linear(135deg, #ffffff 0%, #e2e8f0 100%)"
            bgClip="text"
          >
            🎉 Welcome Gift Inside!
          </Text>

          {/* Value Proposition */}
          <Text
            fontSize="16px"
            color="#cbd5e1"
            lineHeight={1.4}
          >
            Your account is ready! Here&apos;s an exclusive welcome bonus to get you started:
          </Text>

          {/* Gift Container */}
          <Box
            w="full"
            bg="linear-gradient(145deg, rgba(59, 130, 246, 0.08), rgba(147, 51, 234, 0.08))"
            borderRadius="16px"
            p="24px 20px"
            position="relative"
            overflow="hidden"
            _before={{
              content: '""',
              position: "absolute",
              top: "-50%",
              left: "-50%",
              width: "200%",
              height: "200%",
              background: "radial-gradient(circle, rgba(59, 130, 246, 0.05) 0%, transparent 70%)",
              animation: "rotate 8s linear infinite"
            }}
            sx={{
              borderImage: "linear-gradient(135deg, #3b82f6, #9333ea) 1",
              border: "2px solid transparent",
              backgroundClip: "padding-box"
            }}
          >
            <VStack spacing={3} position="relative" zIndex={2}>
              {/* Gift Header */}
              <HStack spacing={3} justify="center">
                <Text
                  fontSize="24px"
                  style={{
                    animation: showConfetti ? 'bounce 2s infinite' : undefined
                  }}
                >
                  🎁
                </Text>
                <Text
                  fontSize="18px"
                  fontWeight={700}
                  color="#3b82f6"
                  textTransform="uppercase"
                  letterSpacing="1px"
                >
                  Gift Worth $6
                </Text>
              </HStack>

              {/* Free Amount */}
              <Text
                fontSize="44px"
                fontWeight={900}
                color="white"
                textShadow="0 0 30px rgba(59, 130, 246, 0.4)"
                my={1}
              >
                2 FREE
              </Text>

              {/* God Mode Label */}
              <Text
                fontSize="20px"
                fontWeight={700}
                bgGradient="linear(135deg, #3b82f6, #9333ea)"
                bgClip="text"
                mb={3}
              >
                God Mode Articles
              </Text>

              {/* Feature List */}
              <VStack spacing={1.5} align="start" w="full">
                {[
                  "In-depth research & analysis",
                  "SEO-optimized content", 
                  "Next Gen AI Articles",
                  "Auto Publish on WordPress"
                ].map((feature, index) => (
                  <HStack key={index} spacing={3} align="center">
                    <Text color="#3b82f6" fontWeight="bold">→</Text>
                    <Text color="#e2e8f0" fontSize="14px" lineHeight={1.5}>
                      {feature}
                    </Text>
                  </HStack>
                ))}
              </VStack>
            </VStack>
          </Box>

          {/* CTA Section */}
          <VStack spacing={4} w="full">
            <Button
              bg="linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)"
              borderRadius="10px"
              px={10}
              py={12.5}
              h="auto"
              fontSize="18px"
              fontWeight={600}
              color="white"
              w="full"
              maxW="350px"
              boxShadow="0 4px 15px rgba(59, 130, 246, 0.3), 0 0 0 1px rgba(59, 130, 246, 0.2)"
              position="relative"
              overflow="hidden"
              _hover={{
                transform: "translateY(-2px)",
                boxShadow: "0 8px 25px rgba(59, 130, 246, 0.4), 0 0 0 1px rgba(59, 130, 246, 0.3)"
              }}
              _active={{
                transform: "translateY(0)"
              }}
              _before={{
                content: '""',
                position: "absolute",
                top: 0,
                left: "-100%",
                width: "100%",
                height: "100%",
                bg: "linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent)",
                transition: "left 0.5s ease"
              }}
              onClick={handleGetStarted}
              sx={{
                '&:hover::before': {
                  left: '100%'
                }
              }}
            >
              Start Creating Articles →
            </Button>

            <Button
              variant="link"
              color="#64748b"
              fontSize="13px"
              _hover={{ color: "#94a3b8", textDecoration: "underline" }}
              onClick={onClose}
            >
              I&apos;ll do it later
            </Button>
          </VStack>
        </VStack>

        {/* Confetti Effect */}
        {showConfetti && (
          <Box position="absolute" top={0} left={0} w="full" h="full" pointerEvents="none">
            {Array.from({ length: 20 }).map((_, i) => (
              <Box
                key={i}
                position="absolute"
                w="4px"
                h="4px"
                borderRadius="50%"
                bg={['#3b82f6', '#9333ea', '#22c55e', '#f59e0b'][Math.floor(Math.random() * 4)]}
                left={`${Math.random() * 100}%`}
                top="-10px"
                opacity={0.6}
                style={{
                  animation: `confetti-fall ${2 + Math.random() * 2}s ease-out ${Math.random() * 2}s forwards`
                }}
              />
            ))}
          </Box>
        )}
      </ModalContent>

      {/* Add custom CSS for animations */}
      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(50px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        @keyframes bounce {
          0%, 20%, 50%, 80%, 100% {
            transform: translateY(0);
          }
          40% {
            transform: translateY(-8px);
          }
          60% {
            transform: translateY(-4px);
          }
        }

        @keyframes rotate {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        @keyframes confetti-fall {
          0% {
            transform: translateY(-20px) rotate(0deg);
            opacity: 0;
          }
          10% {
            opacity: 1;
          }
          90% {
            opacity: 1;
          }
          100% {
            transform: translateY(400px) rotate(360deg);
            opacity: 0;
          }
        }
      `}</style>
    </Modal>
  );
};
