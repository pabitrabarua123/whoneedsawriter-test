"use client";

import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Card,
  CardBody,
  CardHeader,
  Flex,
  Heading,
  Text,
  VStack,
  HStack,
  IconButton,
  Badge,
  useToast,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  useDisclosure,
  Switch,
  FormControl,
  FormLabel,
  Spinner,
  Center,
  Code,
  useColorModeValue,
  Divider,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Tooltip,
} from "@chakra-ui/react";
import { FiCopy, FiTrash2, FiPlus, FiEye, FiEyeOff } from "react-icons/fi";
import { useQuery, useQueryClient } from "@tanstack/react-query";

interface ApiKey {
  id: string;
  api_key: string;
  status: number;
  createdAt: string;
  updatedAt: string;
}

export const ApiKeys: React.FC = () => {
  const toast = useToast();
  const queryClient = useQueryClient();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [keyToDelete, setKeyToDelete] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isKeyVisible, setIsKeyVisible] = useState(false);
  
  const cancelRef = React.useRef<HTMLButtonElement>(null);
  
  const cardBg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const codeBg = useColorModeValue("gray.50", "gray.900");

  // Fetch API key (single key)
  const {
    data: apiKeysData,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["apiKeys"],
    queryFn: async () => {
      const response = await fetch("/api/api-keys");
      if (!response.ok) {
        throw new Error("Failed to fetch API key");
      }
      return response.json() as Promise<{ apiKeys: ApiKey[] }>;
    },
  });

  const apiKey = apiKeysData?.apiKeys?.[0] || null;

  // Create new API key
  const handleCreateApiKey = async () => {
    setIsCreating(true);
    try {
      const response = await fetch("/api/api-keys", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create API key");
      }

      await queryClient.invalidateQueries({ queryKey: ["apiKeys"] });
      toast({
        title: "API key created successfully",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: "Error creating API key",
        description: error instanceof Error ? error.message : "Unknown error",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsCreating(false);
    }
  };

  // Delete API key
  const handleDeleteApiKey = async (keyId: string) => {
    try {
      const response = await fetch(`/api/api-keys?id=${keyId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete API key");
      }

      await queryClient.invalidateQueries({ queryKey: ["apiKeys"] });
      toast({
        title: "API key deleted successfully",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: "Error deleting API key",
        description: error instanceof Error ? error.message : "Unknown error",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      onClose();
      setKeyToDelete(null);
    }
  };

  // Toggle API key status
  const handleToggleStatus = async (keyId: string, currentStatus: number) => {
    try {
      const response = await fetch("/api/api-keys", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          keyId,
          status: currentStatus === 0,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update API key status");
      }

      await queryClient.invalidateQueries({ queryKey: ["apiKeys"] });
      toast({
        title: `API key ${currentStatus === 0 ? "activated" : "deactivated"}`,
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: "Error updating API key",
        description: error instanceof Error ? error.message : "Unknown error",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  // Copy to clipboard
  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "API key copied to clipboard",
        status: "success",
        duration: 2000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: "Failed to copy API key",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  // Toggle key visibility
  const toggleKeyVisibility = () => {
    setIsKeyVisible(prev => !prev);
  };

  // Format API key for display
  const formatApiKey = (key: string, isVisible: boolean) => {
    if (isVisible) {
      return key;
    }
    return `${key.substring(0, 8)}${"*".repeat(key.length - 12)}${key.substring(key.length - 4)}`;
  };

  const openDeleteDialog = (keyId: string) => {
    setKeyToDelete(keyId);
    onOpen();
  };

  if (isLoading) {
    return (
      <Center h="400px">
        <Spinner size="xl" color="brand.500" />
      </Center>
    );
  }

  if (error) {
    return (
      <Alert status="error">
        <AlertIcon />
        <AlertTitle>Error loading API keys</AlertTitle>
        <AlertDescription>
          {error instanceof Error ? error.message : "Unknown error occurred"}
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Box p={6}>
      <VStack spacing={6} align="stretch">
        {/* Header */}
        <Flex justify="space-between" align="center">
          <Box>
            <Heading size="lg" mb={2}>
              Developer API
            </Heading>
            <Text color="gray.600">
              Manage your API access for external integrations
            </Text>
          </Box>
          {!apiKey && (
            <Button
              leftIcon={<FiPlus />}
              colorScheme="blue"
              onClick={handleCreateApiKey}
              isLoading={isCreating}
              loadingText="Creating..."
            >
              Generate API Key
            </Button>
          )}
        </Flex>

        {/* Usage Information */}
        <Alert status="info" variant="left-accent">
          <AlertIcon />
          <Box>
            <AlertTitle>API Usage</AlertTitle>
            <AlertDescription>
              Use your API key to integrate with our services. You can have one active API key at a time.
              Remember to keep your key secure and never share it publicly.
            </AlertDescription>
          </Box>
        </Alert>

        {/* API Key Display */}
        {!apiKey ? (
          <Card bg={cardBg} border="1px" borderColor={borderColor}>
            <CardBody>
              <Center py={8}>
                <VStack spacing={4}>
                  <Text fontSize="lg" fontWeight="medium">
                    No API key found
                  </Text>
                  <Text color="gray.600" textAlign="center">
                    Generate your API key to start integrating with our services
                  </Text>
                  <Button
                    leftIcon={<FiPlus />}
                    colorScheme="blue"
                    onClick={handleCreateApiKey}
                    isLoading={isCreating}
                    loadingText="Creating..."
                  >
                    Generate API Key
                  </Button>
                </VStack>
              </Center>
            </CardBody>
          </Card>
        ) : (
          <Card bg={cardBg} border="1px" borderColor={borderColor}>
            <CardHeader pb={2}>
              <Flex justify="space-between" align="center">
                <HStack spacing={3}>
                  <Text fontWeight="semibold">Your API Key</Text>
                  <Badge
                    colorScheme={apiKey.status === 1 ? "green" : "red"}
                    variant="solid"
                  >
                    {apiKey.status === 1 ? "Active" : "Inactive"}
                  </Badge>
                </HStack>
                <HStack spacing={2}>
                  <FormControl display="flex" alignItems="center">
                    <FormLabel htmlFor="status" mb="0" fontSize="sm">
                      Active
                    </FormLabel>
                    <Switch
                      id="status"
                      isChecked={apiKey.status === 1}
                      onChange={() => handleToggleStatus(apiKey.id, apiKey.status)}
                      colorScheme="green"
                    />
                  </FormControl>
                  <Tooltip label="Generate new key">
                    <IconButton
                      aria-label="Delete and regenerate API key"
                      icon={<FiTrash2 />}
                      size="sm"
                      variant="ghost"
                      colorScheme="red"
                      onClick={() => openDeleteDialog(apiKey.id)}
                    />
                  </Tooltip>
                </HStack>
              </Flex>
            </CardHeader>
            
            <CardBody pt={0}>
              <VStack align="stretch" spacing={3}>
                <Box>
                  <Text fontSize="sm" color="gray.600" mb={2}>
                    API Key
                  </Text>
                  <HStack spacing={2}>
                    <Code
                      p={2}
                      borderRadius="md"
                      fontFamily="mono"
                      fontSize="sm"
                      flex={1}
                      bg={codeBg}
                    >
                      {formatApiKey(apiKey.api_key, isKeyVisible)}
                    </Code>
                    <Tooltip label={isKeyVisible ? "Hide key" : "Show key"}>
                      <IconButton
                        aria-label="Toggle visibility"
                        icon={isKeyVisible ? <FiEyeOff /> : <FiEye />}
                        size="sm"
                        variant="ghost"
                        onClick={toggleKeyVisibility}
                      />
                    </Tooltip>
                    <Tooltip label="Copy to clipboard">
                      <IconButton
                        aria-label="Copy API key"
                        icon={<FiCopy />}
                        size="sm"
                        variant="ghost"
                        onClick={() => copyToClipboard(apiKey.api_key)}
                      />
                    </Tooltip>
                  </HStack>
                </Box>
                
                <Divider />
                
                <HStack justify="space-between" fontSize="sm" color="gray.600">
                  <Text>
                    Created: {new Date(apiKey.createdAt).toLocaleDateString()}
                  </Text>
                  <Text>
                    Updated: {new Date(apiKey.updatedAt).toLocaleDateString()}
                  </Text>
                </HStack>
              </VStack>
            </CardBody>
          </Card>
        )}

        {/* API Documentation Section */}
        {apiKey && (
          <Box mt={8}>
            <Heading size="md" mb={4}>
              API Integration Guide
            </Heading>
            
            <VStack spacing={6} align="stretch">
              {/* Create Article Section */}
              <Card bg={cardBg} border="1px" borderColor={borderColor}>
                <CardHeader>
                  <Heading size="sm">1. Create Article</Heading>
                  <Text fontSize="sm" color="gray.600" mt={1}>
                    Submit a keyword to generate an article
                  </Text>
                </CardHeader>
                <CardBody pt={0}>
                  <VStack align="stretch" spacing={4}>
                    <Box>
                      <Text fontSize="sm" fontWeight="medium" mb={2}>
                        Request
                      </Text>
                      <Code 
                        display="block" 
                        whiteSpace="pre" 
                        p={4} 
                        bg={codeBg}
                        borderRadius="md"
                        fontSize="sm"
                        overflowX="auto"
                      >
{`const res = await fetch('https://whoneedsawriter.com/api/v1/tasks', {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "x-api-key": "${apiKey.api_key}",
  },
  body: JSON.stringify({ 
    keyword: "your keyword here",
    wordLimit: 2000,        // optional, default: 2000
    featuredImage: "Yes",   // optional, default: "Yes"
    imageInArticle: "No"    // optional, default: "No"
  }),
});`}
                      </Code>
                    </Box>
                    
                    <Box>
                      <Text fontSize="sm" fontWeight="medium" mb={2}>
                        Response
                      </Text>
                      <Code 
                        display="block" 
                        whiteSpace="pre" 
                        p={4} 
                        bg={codeBg}
                        borderRadius="md"
                        fontSize="sm"
                        overflowX="auto"
                      >
{`if (res.status === 200) {
  const data = await res.json();
  // Article ID to check status
  console.log("articleId: ", data.articleId);
} else {
  const data = await res.json();
  // Error details
  console.log("Error:", JSON.stringify(data, null, 2));
}`}
                      </Code>
                    </Box>
                  </VStack>
                </CardBody>
              </Card>

              {/* Check Article Status Section */}
              <Card bg={cardBg} border="1px" borderColor={borderColor}>
                <CardHeader>
                  <Heading size="sm">2. Check Article Status</Heading>
                  <Text fontSize="sm" color="gray.600" mt={1}>
                    Monitor article generation progress
                  </Text>
                </CardHeader>
                <CardBody pt={0}>
                  <VStack align="stretch" spacing={4}>
                    <Box>
                      <Text fontSize="sm" fontWeight="medium" mb={2}>
                        Request
                      </Text>
                      <Code 
                        display="block" 
                        whiteSpace="pre" 
                        p={4} 
                        bg={codeBg}
                        borderRadius="md"
                        fontSize="sm"
                        overflowX="auto"
                      >
{`const res = await fetch(\`https://whoneedsawriter.com/api/v1/status?articleId=\${encodeURIComponent(articleId)}\`, {
  method: "GET",
  headers: {
    "x-api-key": "${apiKey.api_key}",
  },
});`}
                      </Code>
                    </Box>
                    
                    <Box>
                      <Text fontSize="sm" fontWeight="medium" mb={2}>
                        Response
                      </Text>
                      <Code 
                        display="block" 
                        whiteSpace="pre" 
                        p={4} 
                        bg={codeBg}
                        borderRadius="md"
                        fontSize="sm"
                        overflowX="auto"
                      >
{`if (res.status === 200) {
  const data = await res.json();
  console.log("Status:", data.status);     // "pending" or "ready"
  console.log("Article ID:", data.articleId);
  if (data.status === "ready") {
    console.log("Content:", data.content);  // Generated article content
  }
} else {
  const data = await res.json();
  // Error details
  console.log("Error:", JSON.stringify(data, null, 2));
}`}
                      </Code>
                    </Box>
                  </VStack>
                </CardBody>
              </Card>

              {/* Parameters Reference */}
              <Card bg={cardBg} border="1px" borderColor={borderColor}>
                <CardHeader>
                  <Heading size="sm">3. Parameters Reference</Heading>
                </CardHeader>
                <CardBody pt={0}>
                  <VStack align="stretch" spacing={4}>
                    <Box>
                      <Text fontSize="sm" fontWeight="medium" mb={3}>
                        Create Article Parameters
                      </Text>
                      <VStack align="stretch" spacing={2}>
                        <HStack justify="space-between" align="start">
                          <Box flex={1}>
                            <Text fontSize="sm" fontWeight="medium">keyword</Text>
                            <Text fontSize="xs" color="gray.600">string, required</Text>
                          </Box>
                          <Text fontSize="xs" color="gray.600" flex={2}>
                            The main topic/keyword for article generation
                          </Text>
                        </HStack>
                        <Divider />
                        <HStack justify="space-between" align="start">
                          <Box flex={1}>
                            <Text fontSize="sm" fontWeight="medium">wordLimit</Text>
                            <Text fontSize="xs" color="gray.600">number, optional</Text>
                          </Box>
                          <Text fontSize="xs" color="gray.600" flex={2}>
                            Target word count (default: 2000)
                          </Text>
                        </HStack>
                        <Divider />
                        <HStack justify="space-between" align="start">
                          <Box flex={1}>
                            <Text fontSize="sm" fontWeight="medium">featuredImage</Text>
                            <Text fontSize="xs" color="gray.600">string, optional</Text>
                          </Box>
                          <Text fontSize="xs" color="gray.600" flex={2}>
                            Include featured image: &quot;Yes&quot; or &quot;No&quot; (default: &quot;Yes&quot;)
                          </Text>
                        </HStack>
                        <Divider />
                        <HStack justify="space-between" align="start">
                          <Box flex={1}>
                            <Text fontSize="sm" fontWeight="medium">imageInArticle</Text>
                            <Text fontSize="xs" color="gray.600">string, optional</Text>
                          </Box>
                          <Text fontSize="xs" color="gray.600" flex={2}>
                            Include images within article: &quot;Yes&quot; or &quot;No&quot; (default: &quot;No&quot;)
                          </Text>
                        </HStack>
                      </VStack>
                    </Box>
                  </VStack>
                </CardBody>
              </Card>

              {/* Rate Limits & Notes */}
              <Alert status="warning" variant="left-accent">
                <AlertIcon />
                <Box>
                  <AlertTitle>Important Notes</AlertTitle>
                  <AlertDescription>
                    <VStack align="start" spacing={1} mt={2}>
                      <Text fontSize="sm">• Article generation typically takes 2-5 minutes</Text>
                      <Text fontSize="sm">• Each API call consumes 1 credit from your lifetime balance</Text>
                      <Text fontSize="sm">• Poll the status endpoint every 30-60 seconds to check progress</Text>
                      <Text fontSize="sm">• Keep your API key secure and never expose it in client-side code</Text>
                    </VStack>
                  </AlertDescription>
                </Box>
              </Alert>
            </VStack>
          </Box>
        )}
      </VStack>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        isOpen={isOpen}
        leastDestructiveRef={cancelRef}
        onClose={onClose}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Delete API Key
            </AlertDialogHeader>

            <AlertDialogBody>
              Are you sure you want to delete your API key? This action cannot be undone
              and any applications using this key will lose access. You can generate a new key afterwards.
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onClose}>
                Cancel
              </Button>
              <Button
                colorScheme="red"
                onClick={() => keyToDelete && handleDeleteApiKey(keyToDelete)}
                ml={3}
              >
                Delete
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </Box>
  );
};
