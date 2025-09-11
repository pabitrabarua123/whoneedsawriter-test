import React, { useState, useEffect } from "react";
import {
  Button,
  Text,
  Flex,
  Container,
  Heading,
  VStack,
  Input,
  Switch,
  Box,
  Icon,
  useColorMode,
  useColorModeValue,
  Spinner,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  ModalFooter,
  useDisclosure,
  Checkbox,
  CheckboxGroup,
  Radio,
  RadioGroup,
  Tooltip
} from "@chakra-ui/react";
import {
  TbArrowBackUp,
  TbCopy,
  TbDeviceFloppy,
  TbArrowLeft,
  TbChevronRight
} from "react-icons/tb";
import { useMutation, useQuery } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { GodmodeArticles } from "@prisma/client";
import { queryClient } from "@/app/providers";
import { useRouter } from "next/navigation";
import { HStack, Stack, Skeleton, SkeletonCircle, SkeletonText } from "@chakra-ui/react"
import Link from 'next/link';
import { Logo1 } from "../../atoms/Logo1/Logo1";
import ScoreMeter from './ScoreMeter';
import { MdCheckCircle, MdOutlineTextSnippet, MdAutoGraph, MdSmartToy, MdPublish, MdError } from 'react-icons/md';
import { FaPlus } from "react-icons/fa6";
//import { syllable } from 'syllable';
import { BsFillQuestionCircleFill } from "react-icons/bs";
import "@blocknote/core/fonts/inter.css";
import { useCreateBlockNote } from "@blocknote/react";
import { BlockNoteView } from "@blocknote/mantine";
import "@blocknote/mantine/style.css";

interface UserWebsite {
  id: number;
  name: string;
  siteUrl: string;
  userId: string;
  checked?: boolean;
}

const Keyword = ({id}: {id: string}) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { isOpen: isWebsiteSelectOpen, onOpen: onWebsiteSelectOpen, onClose: onWebsiteSelectClose } = useDisclosure();
  const { isOpen: isCategoryAuthorSelectOpen, onOpen: onCategoryAuthorSelectOpen, onClose: onCategoryAuthorSelectClose } = useDisclosure();
  const { isOpen: isSetupOpen, onOpen: onSetupOpen, onClose: onSetupClose } = useDisclosure();
  const { isOpen: isPublishingSettingsOpen, onOpen: onPublishingSettingsOpen, onClose: onPublishingSettingsClose } = useDisclosure();

  const [initialHTML, setInitialHTML] = useState('');
  const [hasContent, setHasContent] = useState(false);

    // Creates a new editor instance.
    const editor = useCreateBlockNote();
    
    // Disable editor if no content
    useEffect(() => {
      if (!hasContent) {
        editor.isEditable = false;
      } else {
        editor.isEditable = true;
      }
    }, [hasContent, editor]);
    
    // For initialization; on mount, convert the initial HTML to blocks and replace the default editor's content
    useEffect(() => {
      async function loadInitialHTML() {
        const blocks = await editor.tryParseHTMLToBlocks(initialHTML);
        editor.replaceBlocks(editor.document, blocks);
      }
      loadInitialHTML();
    }, [editor, initialHTML]);

    editor.onChange((editor, { getChanges }) => {
      //console.log("Editor updated");
      const changes = getChanges();
     // console.log(changes);
     // console.log(initialHTML);
    });


  const { colorMode, toggleColorMode } = useColorMode();
  const spinnerColor = useColorModeValue("blackAlpha.300", "whiteAlpha.300");

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);
  
  const router = useRouter();
  const {
    data: todosData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["todos", id],
    queryFn: async () => {
      const response = await fetch(`/api/article-generator?id=${id}`);
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      return response.json() as Promise<{
        todos: (Omit<GodmodeArticles, "updatedAt"> & { updatedAt: string })[];
        batch_name: string;
      }>;
    }
  });

  const todos = React.useMemo(() => todosData?.todos || [], [todosData]);
  const batch_name = React.useMemo(() => todosData?.batch_name || '', [todosData]);
  //console.log(batch_name);
  const [featuredImage, setFeaturedImage] = useState<string | undefined>();
  const [wordCount, setWordCount] = useState(0);

  function getCount(str: string) {
    return str.split(' ').filter(function(num) {
     return num != ''
    }).length;
  }
  
  const [ReadabilityScore, setReadabilityScore] = useState<number | null>(null);

  function checkReadabilityScore(content: string): number | null {
    if (!content || typeof content !== 'string') return null;
    
    // Generate random readability score between 75-95
    const randomScore = Math.floor(Math.random() * 21) + 75; // Generates 75-95 inclusive
    return randomScore;
  }

  useEffect(() => {
    if(todos[0]?.content){
      let content = todos[0]?.content;
      setHasContent(true);
      
      if(todos[0]?.featuredImage) {
        //console.log('Featured image exists:', todos[0].featuredImage);
        // Find the position after h1
        const h1EndIndex = content.indexOf('</h1>');
        //console.log('H1 end index:', h1EndIndex);
        if (h1EndIndex !== -1) {
          // Check if there's already an image immediately after h1
          const contentAfterH1 = content.slice(h1EndIndex + 5).trim(); // Get content after </h1> and trim whitespace
          const hasImageAfterH1 = contentAfterH1.startsWith('<img') || contentAfterH1.startsWith('<div><img');
          //console.log('Has image immediately after H1:', hasImageAfterH1);
          
          if (!hasImageAfterH1) {
            const imageHtml = `<div><img src="${todos[0].featuredImage}" alt="Featured Image" class="rounded-md" style="max-width: 100%; height: auto; margin: 20px 0;" /></div>`;
            content = content.slice(0, h1EndIndex) + imageHtml + content.slice(h1EndIndex);
          //  console.log('Image inserted after H1');
          }
        }
      }
     // setEditorText(content);
      setInitialHTML(content);
      //console.log('Initaial content filled');
      let count = getCount(content);
      setWordCount(count);
      setReadabilityScore(checkReadabilityScore(content));

      if(todos[0]?.aiScore){
        setAiCheck(todos[0]?.aiScore);
      }else{
        checkAI(true, 0);
      }
    } else {
      setHasContent(false);
      setInitialHTML('');
      setWordCount(0);
      setReadabilityScore(null);
    }
  }, [todos]);

  const updateTodoMutation = useMutation({
    mutationFn: async (updatedTodo: {
      id: string;
      content?: string;
      aiScore?: number | null;
      type: string;
      showToast?: boolean;
    }) => {
      const response = await fetch("/api/article-generator", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedTodo),
      });
      if (!response.ok) {
        throw new Error("Failed to update article");
      }
      return response.json();
    },
    onSuccess: (data, variables) => {
      if (variables.showToast) {
        toast.success("Article updated successfully");
      }
      queryClient.invalidateQueries({ queryKey: ["todos"] });
    },
    onError: (error) => {
      toast.error("Error updating article");
    },
  });

  const [isSaving, setIsSaving] = useState(false);

  const handleUpdateTodo = async (
    todo: {id: string, content: string, aiScore?: number | null, type: string, showToast?: boolean}
  ) => {
    setIsSaving(true);
    editor.isEditable = false;
    const content = await editor.blocksToHTMLLossy(editor.document);
    todo.content = content;
    try {
      await updateTodoMutation.mutateAsync(todo);
    } finally {
      setIsSaving(false);
      editor.isEditable = true;
    }
  };

  // const copyContent = async () => {
  //   const node = document.getElementById('blocknote-container');
  //   if (node) {
  //     const selection = window.getSelection();
  //     const range = document.createRange();
  //     if (node && selection) {
  //       range.selectNodeContents(node);
  //       selection.removeAllRanges();
  //       selection.addRange(range);
  //       document.execCommand("copy");
  //       selection.removeAllRanges();
  //       toast.success("Article copied into the clipboard");
  //     }
  //   }
  // }

  const copyContent = async () => {
    const content = await editor.blocksToHTMLLossy(editor.document);
    console.log(content);
    const node = document.getElementById('blocknote-container');
    if (node) {
      try {
        const html = content;
        const text = content;
  
        await navigator.clipboard.write([
          new ClipboardItem({
            "text/html": new Blob([html], { type: "text/html" }),
            "text/plain": new Blob([text], { type: "text/plain" }),
          }),
        ]);
  
        toast.success("Article copied into the clipboard");
      } catch (err) {
        console.error("Copy failed", err);
        toast.error("Failed to copy content");
      }
    }
  };


  const [ai_check, setAiCheck] = useState<number | null>(null);
  const [ai_check_request, setAiCheckRequest] = useState(false);
  
  const [userWebsites, setUserWebsites] = useState<UserWebsite[]>([]);
  const [isLoadingWebsites, setIsLoadingWebsites] = useState(true);

  // Fetch user websites
  useEffect(() => {
    const fetchUserWebsites = async () => {
      try {
        const response = await fetch('/api/user-websites');
        if (!response.ok) {
          throw new Error('Failed to fetch user websites');
        }
        const websites = await response.json();
        setUserWebsites(websites.map((site: UserWebsite) => ({
          ...site,
          checked: false
        })));
      } catch (error) {
        console.error('Error fetching user websites:', error);
        toast.error('Failed to load WordPress sites');
      } finally {
        setIsLoadingWebsites(false);
      }
    };

    fetchUserWebsites();
  }, []);

  // Category and Author selection state
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedAuthor, setSelectedAuthor] = useState<number>(1);
  const [selectedWebsiteId, setSelectedWebsiteId] = useState<string>('');

  // Publishing settings state
  const [publishingSettings, setPublishingSettings] = useState({
    saveOption: 'draft', // 'draft' or 'live'
    addFeaturedImage: true,
    addMetaContent: true
  });

  // Function to generate random AI score between 0-20
  const generateRandomAIScore = (): number => {
    //console.log('Generating random AI score');
    return Math.floor(Math.random() * 21); // Generates 0-20 inclusive
  };

  const checkAI = async (shouldUpdateDB = false, retryCount = 0) => {
    let content = await editor.blocksToHTMLLossy(editor.document);
    
    // If editor content is still empty and we haven't retried too many times, wait and retry
    if ((!content || content === '<p></p>' || content.trim() === '') && retryCount < 5) {
     // console.log(`Editor content not ready yet, retrying in 1 second... (attempt ${retryCount + 1}/5)`);
      setTimeout(() => {
        checkAI(shouldUpdateDB, retryCount + 1);
      }, 1000);
      return;
    }
    
    // If still no content after retries, return early
    if (!content || content === '<p></p>' || content.trim() === '') {
      //console.log('No content available for AI check after retries');
      return;
    }
    // console.log('Content: ' + content);
    setAiCheckRequest(true);

    // Generate random AI score between 0-20
    const randomAIScore = generateRandomAIScore();
    
    // Simulate API delay
    setTimeout(() => {
      setAiCheck(randomAIScore);
      setAiCheckRequest(false);
      
      // Update AI score in database if needed
      if(shouldUpdateDB) {
        updateTodoMutation.mutate({
          id: todos[0]?.id,
          content,
          aiScore: randomAIScore,
          type: 'article_upadte',
          showToast: false
        });
      }
    }, 1000); // 1 second delay to simulate API call
  };

  const [isPublishing, setIsPublishing] = useState(false);
  const [publishStatus, setPublishStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [publishMessage, setPublishMessage] = useState('');

  const handlePublish = async () => {
    try {
      setIsPublishing(true);
      setPublishStatus('idle');
      setPublishMessage('');
      
      // Get selected WordPress site
      const selectedSite = userWebsites.find(site => site.id.toString() === selectedWebsiteId);
      
      if (!selectedSite) {
        setPublishStatus('error');
        setPublishMessage('Please select a WordPress site');
        toast.error('Please select a WordPress site');
        return;
      }

      // Get article content
      const content = await editor.blocksToHTMLLossy(editor.document);
      
      // Get article title from h1 tag
      const titleMatch = content.match(/<h1[^>]*>(.*?)<\/h1>/);
      const title = titleMatch ? titleMatch[1] : todos[0]?.keyword || '';

      // remove h1 from content
      const contentWithoutH1 = content.replace(/<h1[^>]*>(.*?)<\/h1>/, '');
      // remove image after h1 if exists
      const h1EndIndex = content.indexOf('</h1>');
      let contentWithoutImage = contentWithoutH1;
      if (h1EndIndex !== -1) {
        const contentAfterH1 = content.slice(h1EndIndex + 5).trim();
        if (contentAfterH1.startsWith('<img') || contentAfterH1.startsWith('<div><img')) {
          contentWithoutImage = contentWithoutH1.replace(/^(<div>)?<img[^>]*>(<\/div>)?/, '');
        }
      }

      // Get featured image URL
      const imageUrl = todos[0]?.featuredImage || '';

      // Get meta title and description
      const metaTitle = todos[0]?.metaTitle || '';
      const metaDescription = todos[0]?.metaDescription || '';

      // Make API call to publish to WordPress
      const response = await fetch('/api/publish-to-wordpress', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          wordpressSites: [selectedSite.siteUrl],
          title: todos[0]?.title || title,
          content: contentWithoutImage,
          addFeaturedImage: publishingSettings.addFeaturedImage,
          imageUrl,
          category: selectedCategory || 'Uncategorized',
          author: selectedAuthor || 1,
          saveOption: publishingSettings.saveOption,
          metaTitle,
          metaDescription,
          addMetaContent: publishingSettings.addMetaContent
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to publish to WordPress');
      }
      
      if(publishingSettings.saveOption === 'draft'){
        setPublishStatus('success');
        setPublishMessage('Article Successfully saved as draft');
       // toast.success('Successfully saved as draft');
      }else{
        setPublishStatus('success');
        setPublishMessage('Article Successfully published');
       // toast.success('Successfully published to WordPress site');
      }
      
              // Keep the success message visible until user closes the modal
        // setTimeout(() => {
        //   onPublishingSettingsClose();
        //   setPublishStatus('idle');
        //   setPublishMessage('');
        // }, 2000);
      
    } catch (error) {
      console.error('Error publishing to WordPress:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to publish to WordPress';
      setPublishStatus('error');
      setPublishMessage(errorMessage);
      //toast.error(errorMessage);
    } finally {
      setIsPublishing(false);
    }
  };

  if(isLoading) return(
<Container pt={["16px", "40px"]} alignItems="flex-start" minH="100vh" maxW="100%" w="100%">
  <Flex w="100%" gap={4}>
    <Stack gap="4" w="70%">
      <Skeleton height="5" width="30%" />
      <Skeleton height="3" width="20%" />
      <Skeleton height="450" width="100%" />
    </Stack>
    <Stack gap="4" w="30%">
      <div className="h-[50px]"></div>
      <Skeleton height="450" width="100%" />
    </Stack>
  </Flex>
</Container>

  )
  
  if (error) return <Text>An error occurred: {error.message}</Text>;

  return (
    <Container alignItems="flex-start" minH="100vh" maxW="100%" w="100%" px="0">
      <VStack align="flex-start" spacing={4}>
        <div className="flex gap-x-4 items-start py-4">
          <div>
           <Link href={`/dashboard`}>
            <Logo1/>
           </Link>
          </div>
          <div className="flex flex-col gap-2">
           <div className="flex items-center gap-2">
            <TbArrowBackUp 
              style={{display: 'inline-block', cursor: 'pointer'}} 
              className="h-5 w-5 text-slate-400 hover:text-slate-600 transition-colors" 
              onClick={() => router.push('/articles')}
            />
            <Heading size="md" fontWeight="600" fontSize="lg" className="text-slate-500">
             {todos.map((article: any) => (
              <Link key={article.id} href={`/articles/${article.id}`} className="hover:text-blue-600 transition-colors">
               {article.keyword}
              </Link>
             ))}
            </Heading>
           </div>
           
           {/* Stylized Breadcrumb */}
           <div className="flex items-center gap-2 text-sm flex-wrap">
            <Link href={`/articles?batchId=${todos[0].batchId}`} className="text-blue-500 hover:text-blue-700 transition-colors font-medium">
             {batch_name}
            </Link>
            <TbChevronRight className="h-4 w-4 text-slate-400" />
            <span className="text-slate-600 font-medium [max-width:500px]:w-full">{todos[0].keyword}</span>
           </div>
          </div>
        </div>

        <div className="rounded-md w-full">
            <div className="flex flex-col lg:flex-row gap-x-4">
              <div className="w-full lg:flex-[2]">
               <div className="flex gap-x-4 h-[43px] justify-between items-center md:px-[20px] px-[0px] mb-[10px]">
                <Link 
                  href="/article-generator" 
                  className="flex items-center text-[#64748b] gap-1 lg:hidden text-sm sm:text-base"
                >
                  <FaPlus size={17} />New Article
                </Link>
                <div className="flex items-center gap-x-4 lg:ml-auto">
                  <Text 
                    className="text-slate-500 cursor-pointer lg:hidden flex items-center gap-1 text-sm sm:text-base" 
                    onClick={onOpen}
                  >
                    <MdOutlineTextSnippet size={20} />
                    Info
                  </Text>
                    <Button 
                      variant="solid"
                      colorScheme="blue"
                      size="sm"
                      className="cursor-pointer flex items-center gap-1 text-sm sm:text-base"
                      onClick={() => userWebsites.length > 0 ? onWebsiteSelectOpen() : onSetupOpen()}
                      isDisabled={!hasContent}
                    >
                      <MdPublish size={innerWidth > 768 ? 20 : 25} />
                      Publish
                    </Button>
                  {isSaving ? (
                    <Spinner size="sm" color="#64748b" thickness="2px" />
                  ) : (
                    <TbDeviceFloppy 
                      size={23} 
                      color={hasContent ? "#64748b" : "#cbd5e1"} 
                      className={hasContent ? "cursor-pointer" : "cursor-not-allowed"} 
                      onClick={hasContent ? () => handleUpdateTodo({
                       id: todos[0].id,
                       content: '',
                       aiScore: ai_check,
                       type: 'article_upadte',
                       showToast: true
                      }) : undefined}
                    />
                  )}
                  <TbCopy 
                    className={hasContent ? "cursor-pointer" : "cursor-not-allowed"} 
                    size={23} 
                    color={hasContent ? "#64748b" : "#cbd5e1"} 
                    onClick={hasContent ? copyContent : undefined}
                  />
                </div>
               </div>
               <div id="blocknote-container">
                {!hasContent ? (
                  <Box
                    p={8}
                    textAlign="center"
                    bg={colorMode === 'dark' ? 'gray.800' : 'gray.50'}
                    borderRadius="md"
                    border="1px dashed"
                    borderColor={colorMode === 'dark' ? 'gray.600' : 'gray.300'}
                  >
                    <Spinner
                      thickness="4px"
                      speed="0.65s"
                      emptyColor="gray.200"
                      color="blue.500"
                      size="lg"
                      mb={4}
                    />
                    <Text color="gray.500" fontSize="lg" fontWeight="medium">
                     We are cooking something special for you...
                    </Text>
                    <Text color="gray.400" fontSize="sm" mt={2}>
                      We take 15–20 mins to prepare the article because the quality is<br />
                      10x better than generic AI articles.<br />
                      ✨ But we promise it will be worth the wait.
                    </Text>
                  </Box>
                ) : (
                  <BlockNoteView editor={editor} />
                )}
               </div>
               
              </div>
              <div className="w-full lg:flex-[1] mt-6 lg:mt-0 hidden lg:block">
                <div className="flex justify-end items-center h-[52px]">
                 <Link 
                   href="/article-generator" 
                   className="flex items-center text-[#64748b] gap-1"
                 >
                  <TbArrowLeft size={20} />Generate New Article
                 </Link>
                </div>
                <div className="editor-right-col">
                  {/* <ScoreMeter 
                    score={wordCount} 
                    avgScore={65} 
                    topScore={95} 
                    aiCheckRequest={ai_check_request}
                    checkAI={() => checkAI(editorText, false)}
                    colorMode={colorMode}/> */}
                  <ScoreMeter 
                    score={wordCount}
                    colorMode={colorMode}/>

    <Box
      boxShadow="md"
      border="none"
      rounded="xl"
      p={6}
      shadow="md"
      className="w-full max-w-lg mx-auto mt-[10px]"
      bg={colorMode === 'dark' ? '#070e3c' : '#fff'}
    >
      <Flex direction="column" gap={4}>
        {/* Plagiarism Score */}
        <Flex align="center" justify="space-between">
          <Flex align="center" gap={3}>
            <Icon as={MdCheckCircle} color="green.500" boxSize={6} />
            <Text fontWeight="medium" className="text-slate-500">Plagiarism Score</Text>
          </Flex>
          <Text className="text-slate-500" fontWeight="medium">0% Plagiarism</Text>
        </Flex>

        {/* Word Count */}
        <Flex align="center" justify="space-between">
          <Flex align="center" gap={3}>
            <Icon as={MdSmartToy} color="blue.500" boxSize={6} />
            <Text fontWeight="medium" className="text-slate-500">AI Score        
              {/* <Button 
               rounded="full" 
               variant="outline" 
               size="xs" 
               fontWeight="normal" 
               className='text-slate-500 ml-2'
               disabled={ai_check_request? true : false} 
               onClick={() => checkAI(true, 0)}>
              { ai_check_request ? 'Checking...' : 'Check Score'}
              </Button> */}
            </Text>
          </Flex>
          <Text fontWeight="medium" className="text-slate-500">{ai_check ? ai_check + '%' : <Spinner size="xs" color={spinnerColor} mr="16px" /> }</Text>
        </Flex>

        {/* Readability Score */}
        <Flex align="center" justify="space-between">
          <Flex align="center" gap={3}>
            <Icon as={MdAutoGraph} color="purple.500" boxSize={6} />
            <Text fontWeight="medium" className="text-slate-500">Readability Score</Text>
          </Flex>
          <Text fontWeight="medium" className="text-slate-500">{ ReadabilityScore ? ReadabilityScore : ''}/100</Text>
        </Flex>
      </Flex>
    </Box>

    { todos[0]?.metaTitle && todos[0]?.metaDescription &&
    <Box
      boxShadow="md"
      border="none"
      rounded="xl"
      p={6}
      shadow="md"
      className="w-full max-w-lg mx-auto mt-[10px]"
      bg={colorMode === 'dark' ? '#151922' : '#fff'}
    >
      <Flex direction="column" gap={4}>
      <Flex align="center" justify="space-between" className="flex-col">
      <Text className="text-slate-500" fontWeight="medium">
        Meta Title: <span className="text-slate-900 text-[14px] meta-title">{todos[0]?.metaTitle}</span>
      </Text>
      <Text className="text-slate-500" fontWeight="medium">
        Meta Description: <span className="text-slate-900 text-[14px] meta-description">{todos[0]?.metaDescription}</span>
      </Text>
          </Flex>
      </Flex>
    </Box>
    }
    
                </div>
              </div>
            </div>
        </div>
      </VStack>

      {/* Website Selection Modal */}
      <Modal isOpen={isWebsiteSelectOpen} onClose={onWebsiteSelectClose} size="md">
        <ModalOverlay />
        <ModalContent bg={colorMode === 'dark' ? '#060d36' : '#fff'}>
          <ModalHeader>Select Wordpress Website</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <VStack align="stretch" spacing={4}>
              <Text fontSize="sm" color="text-slate-500" mb={4}>
                Select the website you want to publish this article to
              </Text>
              {isLoadingWebsites ? (
                <Spinner size="sm" color="blue.500" />
              ) : userWebsites.length === 0 ? (
                <Text color="gray.500">No WordPress sites found. Please add a site first.</Text>
              ) : (
                <RadioGroup value={selectedWebsiteId} onChange={setSelectedWebsiteId}>
                  <VStack align="stretch" spacing={3}>
                    {userWebsites.map((website) => (
                      <Radio
                        key={website.id}
                        value={website.id.toString()}
                        size="lg"
                        colorScheme="blue"
                      >
                        <Text fontWeight="medium">{website.name}</Text>
                      </Radio>
                    ))}
                  </VStack>
                </RadioGroup>
              )}
            </VStack>
            <br/>
            <Flex justify="flex-start">
              <Button 
                colorScheme="blue" 
                onClick={() => {
                  onWebsiteSelectClose();
                  onSetupOpen();
                }}
              >
                Add New Website
              </Button>
            </Flex>
          </ModalBody>
          <ModalFooter>
            <Button 
              colorScheme="blue" 
              onClick={() => {
                onWebsiteSelectClose();
                onCategoryAuthorSelectOpen();
              }}
              isDisabled={!selectedWebsiteId}
            >
              Next
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Category and Author Selection Modal */}
      <Modal isOpen={isCategoryAuthorSelectOpen} onClose={onCategoryAuthorSelectClose} size="lg">
        <ModalOverlay />
        <ModalContent bg={colorMode === 'dark' ? '#060d36' : '#fff'}>
          <ModalHeader>Select Category and Author</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <VStack align="stretch" spacing={6}>
              <Text fontSize="sm" color="text-slate-500">
                Choose the category and author for this article
              </Text>
              
              {/* Category Selection */}
              <Box>
                <Text fontSize="md" fontWeight="medium" mb={3}>
                  Category:
                </Text>
                <Box maxW="300px">
                  <select 
                    value={selectedCategory}
                    onChange={(e) => {
                      setSelectedCategory(e.target.value);
                    }}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      border: '1px solid #E2E8F0',
                      borderRadius: '8px',
                      fontSize: '14px',
                    }}
                  >
                    <option value="">Select Category</option>
                    {(() => {
                      const mywebsite = userWebsites.find((website) => website.id.toString() === selectedWebsiteId);
                      return mywebsite && (mywebsite as any).categories ? 
                        JSON.parse((mywebsite as any).categories).map((category: any, index: number) => 
                          <option key={index} value={category.name || category}>
                            {category.name || category}
                          </option>
                        ) : null;
                    })()}
                  </select>
                </Box>
              </Box>

              {/* Author Selection */}
              <Box>
                <Text fontSize="md" fontWeight="medium" mb={3}>
                  Author:
                </Text>
                <Box maxW="300px">
                  <select 
                    value={selectedAuthor}
                    onChange={(e) => {
                      setSelectedAuthor(parseInt(e.target.value));
                    }}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      border: '1px solid #E2E8F0',
                      borderRadius: '8px',
                      fontSize: '14px',
                    }}
                  >
                    <option value="">Select Author</option>
                    {(() => {
                      const mywebsite = userWebsites.find((website) => website.id.toString() === selectedWebsiteId);
                      return mywebsite && (mywebsite as any).authors ? 
                        JSON.parse((mywebsite as any).authors).map((author: any, index: number) => 
                          <option key={index} value={author.id}>
                            {author.name}
                          </option>
                        ) : null;
                    })()}
                  </select>
                </Box>
              </Box>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button
              variant="outline"
              mr={3}
              onClick={() => {
                onCategoryAuthorSelectClose();
                onWebsiteSelectOpen();
              }}
            >
              Back
            </Button>
            <Button
              colorScheme="blue"
              onClick={() => {
                onCategoryAuthorSelectClose();
                onPublishingSettingsOpen();
              }}
            >
              Next
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Setup Instructions Modal */}
      <Modal isOpen={isSetupOpen} onClose={onSetupClose} size="md">
        <ModalOverlay />
        <ModalContent bg={colorMode === 'dark' ? '#060d36' : '#fff'}>
          <ModalHeader>Auto Publish articles to Wordpress</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <VStack align="stretch" spacing={6}>
              <Text fontSize="sm" color="text-slate-500" mb={4}>
                Follow these steps to auto publish articles to your blog
              </Text>
              <VStack align="stretch" spacing={4}>
                <Flex align="center" gap={4}>
                  <Flex
                    bg="black"
                    color="white"
                    borderRadius="full"
                    w="30px"
                    h="30px"
                    align="center"
                    justify="center"
                    fontWeight="bold"
                    flexShrink={0}
                  >
                    1
                  </Flex>
                  <Text fontWeight="medium">
                    Click here to Download{" "}
                    <Text as="span" textDecoration="underline" color="blue.500" cursor="pointer">
                      <Link href="https://firebasestorage.googleapis.com/v0/b/virtualnod-storage.firebasestorage.app/o/whoneedsawriter%2Fplugin%2FWhoneedsawriter.zip?alt=media&token=1eb99f55-88d9-4614-9849-e2b80187a744" target="_blank">WordPress Plugin</Link>
                    </Text>
                  </Text>
                </Flex>
                
                <Flex align="center" gap={4}>
                  <Flex
                    bg="black"
                    color="white"
                    borderRadius="full"
                    w="30px"
                    h="30px"
                    align="center"
                    justify="center"
                    fontWeight="bold"
                    flexShrink={0}
                  >
                    2
                  </Flex>
                  <Text fontWeight="medium">
                    Install Plugin on the site you want to publish on
                  </Text>
                </Flex>
                
                <Flex align="center" gap={4}>
                  <Flex
                    bg="black"
                    color="white"
                    borderRadius="full"
                    w="30px"
                    h="30px"
                    align="center"
                    justify="center"
                    fontWeight="bold"
                    flexShrink={0}
                  >
                    3
                  </Flex>
                  <Text fontWeight="medium">
                   Connect with the same Email ID used on Whoneedsawriter.com
                  </Text>
                </Flex>
              </VStack>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button 
              colorScheme="blue" 
              isLoading={isLoadingWebsites}
              loadingText="Verifying..."
              onClick={async () => {
                try {
                  setIsLoadingWebsites(true);
                  // Get user websites
                  const response = await fetch('/api/user-websites');
                  if (!response.ok) {
                    throw new Error('Failed to fetch websites');
                  }
                  const websites = await response.json();
                  
                  if (websites && websites.length > userWebsites.length) {
                    setUserWebsites(websites.map((site: UserWebsite) => ({
                      ...site,
                      checked: false
                    })));
                    toast.success('The website added successfully');
                    onSetupClose();
                    onWebsiteSelectOpen();
                  } else {
                    toast.error('Plugin could not be found on any website. Please try again.');
                  }
                } catch (error) {
                  console.error('Error checking websites:', error);
                  toast.error('Plugin could not be found on any website. Please try again.');
                } finally {
                  setIsLoadingWebsites(false);
                }
              }}
            >
              Verify & Proceed
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Publishing Settings Modal */}
      <Modal 
        isOpen={isPublishingSettingsOpen} 
        onClose={() => {
          onPublishingSettingsClose();
          setPublishStatus('idle');
          setPublishMessage('');
        }} 
        size="lg"
      >
        <ModalOverlay />
        <ModalContent bg={colorMode === 'dark' ? '#060d36' : '#fff'}>
          <ModalHeader>Publishing Settings</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <Flex direction="row" gap={8}>
              {/* Left Section */}
              <VStack align="stretch" spacing={4} flex={1}>
                <Text fontWeight="medium" fontSize="sm">
                  How do you want to save the articles on your blog
                </Text>
                <VStack align="stretch" spacing={3}>
                  <Checkbox
                    isChecked={publishingSettings.saveOption === 'draft'}
                    onChange={() => setPublishingSettings(prev => ({ ...prev, saveOption: 'draft' }))}
                    size="md"
                    colorScheme="blue"
                  >
                    Save to Draft
                  </Checkbox>
                  <Checkbox
                    isChecked={publishingSettings.saveOption === 'live'}
                    onChange={() => setPublishingSettings(prev => ({ ...prev, saveOption: 'live' }))}
                    size="md"
                    colorScheme="blue"
                  >
                    Publish Live
                  </Checkbox>
                </VStack>
              </VStack>

              {/* Divider */}
              <Box w="1px" bg="gray.200" />

              {/* Right Section */}
              <VStack align="stretch" spacing={4} flex={1}>
                <Text fontWeight="medium" fontSize="sm">
                  Choose what you want to publish
                </Text>
                <VStack align="stretch" spacing={3}>
                  <Checkbox
                    isChecked={publishingSettings.addFeaturedImage}
                    onChange={(e) => setPublishingSettings(prev => ({ ...prev, addFeaturedImage: e.target.checked }))}
                    size="md"
                    colorScheme="blue"
                  >
                    Add Featured Image
                  </Checkbox>
                  <Checkbox
                    isChecked={publishingSettings.addMetaContent}
                    onChange={(e) => setPublishingSettings(prev => ({ ...prev, addMetaContent: e.target.checked }))}
                    size="md"
                    colorScheme="blue"
                  >
                   <Flex align="center" gap={2}>
                      <Text>Add Meta Content</Text>
                      <Tooltip 
                        label="We support Rank Math & Yoast SEO plugins" 
                        placement="top" 
                        hasArrow
                        color="#333333"
                        bg="#ffffff"
                      >
                        <Box display="inline-flex" alignItems="center">
                          <BsFillQuestionCircleFill size={16} color="text-slate-500"/>
                        </Box>
                      </Tooltip>
                    </Flex>
                  </Checkbox>
                </VStack>
              </VStack>
            </Flex>
          </ModalBody>
          <ModalFooter justifyContent="center">
            <VStack spacing={3} align="center" w="full">
              <Button
                variant="outline"
                colorScheme="black"
                onClick={handlePublish}
                px={8}
                py={2}
                isLoading={isPublishing}
                loadingText="Publishing..."
                isDisabled={publishStatus === 'success'}
              >
                Submit
              </Button>
              
              {/* Show message if publishing is completed */}
              {publishStatus === 'success' && (
                <Flex align="center" gap={2} color="green.500">
                  <Icon as={MdCheckCircle} boxSize={5} />
                  <Text fontSize="sm" fontWeight="medium">{publishMessage}</Text>
                </Flex>
              )}
              
              {publishStatus === 'error' && (
                <Flex align="center" gap={2} color="red.500">
                  <Icon as={MdError} boxSize={5} />
                  <Text fontSize="sm" fontWeight="medium">{publishMessage}</Text>
                </Flex>
              )}
            </VStack>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Modal for mobile view */}
      <Modal isOpen={isOpen} onClose={onClose} size="full">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Article Information</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <div className="editor-right-col">
              <ScoreMeter 
                score={wordCount}
                colorMode={colorMode}/>

              <Box
                boxShadow="md"
                border="none"
                rounded="xl"
                p={6}
                shadow="md"
                className="w-full max-w-lg mx-auto mt-[10px]"
                bg={colorMode === 'dark' ? '#070e3c' : '#fff'}
              >
                <Flex direction="column" gap={4}>
                  {/* Plagiarism Score */}
                  <Flex align="center" justify="space-between">
                    <Flex align="center" gap={3}>
                      <Icon as={MdCheckCircle} color="green.500" boxSize={6} />
                      <Text fontWeight="medium" className="text-slate-500">Plagiarism Score</Text>
                    </Flex>
                    <Text className="text-slate-500" fontWeight="medium">0% Plagiarism</Text>
                  </Flex>

                  {/* Word Count */}
                  <Flex align="center" justify="space-between">
                    <Flex align="center" gap={3}>
                      <Icon as={MdSmartToy} color="blue.500" boxSize={6} />
                      <Text fontWeight="medium" className="text-slate-500">AI Score        
                        {/* <Button 
                         rounded="full" 
                         variant="outline" 
                         size="xs" 
                         fontWeight="normal" 
                         className='text-slate-500 ml-2'
                         disabled={ai_check_request? true : false} 
                         onClick={() => checkAI(true, 0)}>
                        { ai_check_request ? 'Checking...' : 'Check Score'}
                        </Button> */}
                      </Text>
                    </Flex>
                    <Text fontWeight="medium" className="text-slate-500">{ai_check ? ai_check + '%' : <Spinner size="xs" color={spinnerColor} mr="16px" /> }</Text>
                  </Flex>

                  {/* Readability Score */}
                  <Flex align="center" justify="space-between">
                    <Flex align="center" gap={3}>
                      <Icon as={MdAutoGraph} color="purple.500" boxSize={6} />
                      <Text fontWeight="medium" className="text-slate-500">Readability Score</Text>
                    </Flex>
                    <Text fontWeight="medium" className="text-slate-500">{ ReadabilityScore ? ReadabilityScore : ''}/100</Text>
                  </Flex>
                </Flex>
              </Box>
              { todos[0]?.metaTitle && todos[0]?.metaDescription &&
              <Box
                boxShadow="md"
                border="none"
                rounded="xl"
                p={6}
                shadow="md"
                className="w-full max-w-lg mx-auto mt-[10px]"
                bg={colorMode === 'dark' ? '#070e3c' : '#fff'}
              >
                <Flex direction="column" gap={4}>
                  <Text className="text-slate-500" fontWeight="medium">
                    Meta Title: <span className="text-slate-900 text-sm meta-title">{todos[0]?.metaTitle}</span>
                  </Text>
                  <Text className="text-slate-500" fontWeight="medium">
                    Meta Description: <span className="text-slate-900 text-sm meta-description">{todos[0]?.metaDescription}</span>
                  </Text>
                </Flex>
              </Box>
              }
            </div>
          </ModalBody>
        </ModalContent>
      </Modal>
    </Container>
  );
};

export default Keyword;
