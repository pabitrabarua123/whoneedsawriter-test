import React, { useEffect, useState, useRef } from "react";
import {
  Button,
  Text,
  Flex,
  Container,
  Heading,
  VStack,
  Input,
  Textarea,
  Switch,
  Box,
  Spinner,
  useColorModeValue,
  Select,
  IconButton,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  FormControl,
  FormLabel,
  Tooltip
} from "@chakra-ui/react";
import {
  TbPlus
} from "react-icons/tb";
import { LuTimerReset } from "react-icons/lu";
import { FiSettings, FiInfo } from "react-icons/fi";
import { BsFillQuestionCircleFill } from "react-icons/bs";
import { useMutation, useQuery } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { User } from "@prisma/client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
//import { Label } from "@/components/ui/label";
import { useRouter, useSearchParams } from "next/navigation";
import GodmodeLoader from "./GodmodeLoader";
import { TourGuide, useTourStatus, articleGeneratorTourSteps, articleGeneratorGodModeTourSteps } from "@/components/TourGuide";

const ArticleGenerator: React.FC = () => {
  
  const router = useRouter();
  const [isEditPromptDialogOpen, setIsEditPromptDialogOpen] = React.useState(false);
  const [isSettingsPopupOpen, setIsSettingsPopupOpen] = useState(false);
  
  // Tour guide state
  const [runTour, setRunTour] = useState(false);
  const { shouldShowTour, resetTour, markTourComplete } = useTourStatus('article-generator');
  //const [todoToEdit, setTodoToEdit] = React.useState<Todo | null>(null);
  
  const searchParams = useSearchParams();
  const param = searchParams.get("payment"); 
  useEffect(() => {
    if(param === 'success') {
      const type = searchParams.get("type");
      const plan = searchParams.get("plan");
              if(type === 'subscription'){
          toast.success(`You have been successfully upgraded to "${plan} Monthly Plan"`, {
            duration: 20000 // 20 seconds
          });
        }else{
          toast.success(`You have been successfully upgraded to "${plan} Lifetime Plan"`, {
            duration: 20000 // 20 seconds
          });
        }
      }else if(param === 'failed'){
        toast.error("Your Payment has failed (Please Try again)", {
          duration: 20000 // 20 seconds
        });
    }
  }, [param]);

  const spinnerColor = useColorModeValue("blackAlpha.300", "whiteAlpha.300");

  const {
      data: userData,
      isLoading,
      error,
    } = useQuery({
      queryKey: ["user"],
      queryFn: async () => {
        const response = await fetch('/api/user');
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.json() as Promise<{
          user: User;
        }>;
      }
  });
  const user = userData?.user ?? null;
 // console.log(user);

  // Auto-start tour for new users
  useEffect(() => {
    if (shouldShowTour && !isLoading && user) {
      const timer = setTimeout(() => {
        setRunTour(true);
      }, 1500); // Small delay to ensure everything is rendered
      return () => clearTimeout(timer);
    }
  }, [shouldShowTour, isLoading, user]);

  const handleStartTour = () => {
    setRunTour(true);
  };

  const handleTourComplete = async () => {
    setRunTour(false);
    await markTourComplete(true, false);
  };

  const handleTourSkip = async () => {
    setRunTour(false);
    await markTourComplete(false, true);
  };

  const openPromptDialog = () => {
    setIsEditPromptDialogOpen(true);
  };

  const closeEditPromptDialog = () => {
    setIsEditPromptDialogOpen(false);
  };
  
  const [text, setText] = useState('');
  const lines = text.split(/\r?\n/).filter((line) => line.trim() !== "");
  const [prompt, setPrompt] = useState("Write a detailed and information-dense and seo optimized article in English for the keyword {KEYWORD} in html using clear, language without unnecessary grandiose or exaggerations for newspaper. Write article with subheadings formatted in HTML without head or title.");
  const batchRef = useRef("");
  const handleBatchChange = (val: string) => {
    batchRef.current = val; // No re-render happens
  };

  const generateArticle = useMutation({
    mutationFn: async (keyword: { 
      batchId: string, 
      text: string, 
      prompt: string, 
      is_godmode: boolean, 
      balance_type?: string, 
      no_of_keyword: number,
      wordLimit?: string, // Optional as it might not be used by lite mode
      featuredImage?: string, // Optional
      imageInArticle?: string, // Optional
      specialRequests?: string, // Optional
      selectedModel?: string // Optional
    }) => {
      const response = await fetch("/api/article-generator", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(keyword)
      });
      if (!response.ok) {
        throw new Error("Failed to create article");
      }
      return response.json();
    },
    onSuccess: (data) => {
      //toast.success("Article generated successfully for Keyword: ");
    },
    onError: (error) => {
      // If the error is an abort error, don't show the toast
      if (error.name !== 'AbortError') {
        toast.error("Error creating article");
      }
    },
  });

  const [currentKeyword, setCurrentKeyword] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);

  const sendKeywordsSequentially = async (keywords: string[]) => {
    if(balance.credits == 0) {
      openTimerPopup();
      return;
    }
    if(keywords.length > balance.credits){
       toast.error("Limit Exceeded. Please shorten your list or buy more credits. ");
       return;
    }
    if(keywords.length === 0){
       toast.error("Please enter Keywords");
      return;
    }
    if(keywords.length > 10) {
     toast.error("10 Maximum keywords allowed in one batch");
     return;
    }

    setIsProcessing(true);

    const batchValue = batchRef.current && batchRef.current.trim() !== ''
    ? batchRef.current
    : "Batch_" + (Math.floor(Math.random() * 9000) + 1000);

    try {
      const response = await fetch('/api/article-generator/batch', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({batch: batchValue, articleType: 'liteMode', articles: keywords.length})
      });

      const data = await response.json();
     // batchRef.current = data.assignedBatch;

    // console.log(data);

      const interval = setInterval(() => {
        setProgress((prev) => Math.min(prev + 0.3, 95)); // Slow continuous progress
      }, 1000);

      for (let i = 0; i < keywords.length; i++) {

        setCurrentKeyword(keywords[i]);
        try {
          await generateArticle.mutateAsync({
            batchId: data.assignedBatch,
            text: keywords[i],
            prompt: prompt,
            is_godmode: isGodMode,
            no_of_keyword: 1,
            balance_type: balance.balance_type,
            selectedModel: selectedModel,
          });
        } catch (error: any) {
         // console.error(`Error processing keyword "${keywords[i]}":`, error);
          toast.error(`Error creating article for the keyword: "${keywords[i]}"`);
        }
        
        let progressPercent = ((i + 1) / keywords.length) * 100;
        setProgress(progressPercent); // Jump to the actual progress when result is received
      }
      
      clearInterval(interval);
      router.push(`/articles?batchId=${data.assignedBatch}`);
      
    } catch (error: any) {
     // console.error("Error:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const godModeArticleIds = useRef<string[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const [godmodeArticlePrepared, setGodmodeArticlePrepared] = useState([]);
  const [godmodeArticleRemain, setGodmodeArticleRemain] = useState(0);
  const [godmodeStatus, setGodmodeStatus] = useState('');
  const [isProcessingGodmode, setIsProcessingGodmode] = useState(false);
  const [progressGodmode, setProgressGodmode] = useState(0);
  const [GodModeLoader, setGodModeLoader] = useState(false);
  const redirectReadyRef = useRef(false);

  const sendKeywordsSequentiallyGodmode = async (keywords: string[]) => {
    if (balance.credits == 0) {
      openTimerPopup();
      return;
    }
    if (keywords.length*2 > balance.credits) {
      toast.error("Limit Exceeded. Please shorten your list or buy more credits.");
      return;
    }
    if (keywords.length === 0) {
      toast.error("Please enter Keywords");
      return;
    }
    if (keywords.length > 10) {
      toast.error("10 Maximum keywords allowed in one batch");
      return;
    }
  
    setIsProcessingGodmode(true);
    setGodModeLoader(true);
    start25MinLoader(); // 🔥 Start the 25-min loader here

    try {
      const batchValue = batchRef.current && batchRef.current.trim() !== ''
      ? batchRef.current
      : "Batch_" + (Math.floor(Math.random() * 9000) + 1000);

      const response = await fetch('/api/article-generator/batch', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({batch: batchValue, articleType: 'godmode', articles: keywords.length})
      });

      const data = await response.json();
      batchRef.current = data.assignedBatch;
    
      const res = await generateArticle.mutateAsync({
        batchId: batchRef.current,
        text: keywords.join('\n'),
        prompt: prompt,
        is_godmode: isGodMode,
        balance_type: balance.balance_type,
        no_of_keyword: keywords.length,
        wordLimit: wordLimit,
        featuredImage: featuredImage,
        imageInArticle: imageInArticle,
        specialRequests: specialRequests,
        selectedModel: selectedModel,
      });
      
      // Store all article IDs
      godModeArticleIds.current = res.articles.map((article: any) => article.id);
      
    //  console.log(godModeArticleIds.current);
    } catch (error: any) {
     // console.error("Error processing keywords:", error);
      // Always clean up when there's an error
      setIsProcessingGodmode(false);
      setGodModeLoader(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
  };

  const start25MinLoaderOld = () => {
    setProgressGodmode(0); // reset
    const duration = 900; // 900 seconds
    let secondsPassed = 0;
    let apiCalled = false; // ensure it's called only once
  
    if (timerRef.current) clearInterval(timerRef.current);
  
    timerRef.current = setInterval(() => {
      secondsPassed++;
      const percent = (secondsPassed / duration) * 100;
      setProgressGodmode(percent);
  
      const remaining = duration - secondsPassed;
  
      // Trigger API call when 60 seconds or less remain
      if (remaining <= 10 && !apiCalled) {
        apiCalled = true;
        checkArticlePrepared();
      }
  
      if (secondsPassed >= duration) {
        setGodModeLoader(false);
        clearInterval(timerRef.current!);
        redirectReadyRef.current = true;
      }
    }, 1000); // update every second
  };

  // Add this state
const [startTime, setStartTime] = useState<number | null>(null);
const [apiCalled, setApiCalled] = useState(false);

// Replace your start25MinLoader function with this approach:
const start25MinLoader = () => {
  const startTime = Date.now();
  setStartTime(startTime);
  setProgressGodmode(0);
  let lastApiCallTime = 0;
  
  const updateProgress = () => {
    const elapsed = (Date.now() - startTime) / 1000; // seconds
    const percent = Math.min((elapsed / 900) * 100, 100);
    setProgressGodmode(percent);
    
    // Check article prepared every 2 minutes (120 seconds)
    if (elapsed - lastApiCallTime >= 120) {
      lastApiCallTime = elapsed;
      checkArticlePrepared();
    }
    
    if (elapsed >= 900) {
      setGodModeLoader(false);
      redirectReadyRef.current = true;
    } else {
      requestAnimationFrame(updateProgress);
    }
  };
  
  // Handle visibility change
  const handleVisibilityChange = () => {
    if (!document.hidden) {
      // Tab became visible, resume with correct time
      updateProgress();
    }
  };
  
  document.addEventListener('visibilitychange', handleVisibilityChange);
  updateProgress();
};
  
  const checkArticlePrepared = () => {
    fetch("/api/article-generator/check-godmode-completion", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({keywords: godModeArticleIds.current})
    }).then(response => response.json())
      .then(data => {
       // console.log(data.res);
         if(data.res === 'Partial'){
           setGodmodeArticlePrepared(data.contentFilledKeywords);
           setGodmodeArticleRemain(data.remainingKeywords);
           setGodmodeStatus('Partial');
         }
         if(data.res === 'Full'){
           setGodmodeArticlePrepared(data.contentFilledKeywords);
           setGodmodeStatus('Full');
           // Complete the loader circle immediately when articles are fully ready
           setProgressGodmode(100);
           setGodModeLoader(false);
           redirectReadyRef.current = true;
         }
         if(data.res === 'Incomplete'){
          setGodmodeArticleRemain(data.remainingKeywords);
          setGodmodeStatus('Incomplete');
         }
      })
      .catch(error => {
        // Ignore abort errors
        if (error.name !== 'AbortError') {
         // console.error('Error:', error);
        }
      });
  }

  useEffect(() => {
    if (redirectReadyRef.current && godmodeArticleRemain === 0 && !GodModeLoader) {
      setTimeout(() => {
        router.push(`/articles?batchId=${batchRef.current}`);
      }, 3000);
    }
  }, [godmodeArticleRemain, GodModeLoader]);
  

  const [isPricingPopupOpen, setIsPricingPopupOpen] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>("monthly")
  
  const openPricingPopup = (): void => {
    setIsPricingPopupOpen(true);
  };

  const closePricingPopup = (): void => {
   setIsPricingPopupOpen(false);
  };

  const [isTimerPopupOpen, setIsTimerPopupOpen] = useState<boolean>(false);

  const openTimerPopup = (): void => {
    setIsTimerPopupOpen(true);
  };

  const closeTimerPopup = (): void => {
   setIsTimerPopupOpen(false);
  };

  const [isGodMode, setIsGodMode] = useState<boolean>(true);
  const [selectedModel, setSelectedModel] = useState<string>("1a-pro");
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);
  
  const toggleMode = () => {
    setIsGodMode(!isGodMode);
  };

  const modelOptions = [
    {
      value: "1a-lite",
      label: "1a Lite",
      credits: "0.1 Credit",
      description: "Simple content, no frills",
      isGodMode: false
    },
    {
      value: "1a-pro",
      label: "1a Pro", 
      credits: "2 credits",
      description: "PhD-level & Deeply Researched",
      isGodMode: true
    }
  ];

  const handleModelSelect = (option: typeof modelOptions[0]) => {
    setSelectedModel(option.value);
    setIsGodMode(option.isGodMode);
    setIsDropdownOpen(false);
  };

  const selectedOption = modelOptions.find(option => option.value === selectedModel) || modelOptions[1];

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('.dropdown-container')) {
        setIsDropdownOpen(false);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDropdownOpen]);

  const [showGodModeAlert, setShowGodModeAlert] = useState<boolean>(true);
  const [balance, setBalance] = useState({credits: 0, balance_type: '', balance_text: ''});

  useEffect(() => {
      setShowGodModeAlert(true);
      console.log(user);
      if(user && user?.monthyBalance > 0) {
        setBalance({...balance, credits: user.monthyBalance, balance_type: 'monthyBalance', balance_text: 'Monthly Balance'})
      }else if(user && user.lifetimeBalance > 0){
        setBalance({...balance, credits: user.lifetimeBalance, balance_type: 'lifetimeBalance', balance_text: 'Lifetime Balance'})
      }else{
        setBalance({...balance, credits: user?.freeCredits? user.freeCredits : 0, balance_type: 'freeCredits', balance_text: 'Trial Balance'})
      }
    
  }, [isGodMode, user]);


const { data: productData, isLoading: isLoadingPrice, error: errorPrice } = useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      const response = await fetch("/api/products");
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      return response.json();
    }
  });

  //console.log(productData);
  const {
    data: planData,
    isLoading: isLoadingPlan,
    error: errorPlan,
  } = useQuery({
    queryKey: ["plans"],
    queryFn: async () => {
      const response = await fetch('/api/account');
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      return response.json();
    },
    enabled: true,
});

  const [filteredPlansSubscription, setFilteredPlansSubscription] = useState<any[]>([]);
  const [filteredPlansLifetime, setFilteredPlansLifetime] = useState<any[]>([]);
  const [countryName, setCountryName] = useState<string>('');
  useEffect(() => {
    //  console.log(productData);
      // Early return if productData is not available yet
      if (!productData) return;
      
const apiKey = 'AIzaSyARPhrTVh6j2Bu5TbdpPUTX0KuQNat2GSQ';
const geoUrl = `https://www.googleapis.com/geolocation/v1/geolocate?key=${apiKey}`;

const requestData = {
  homeMobileCountryCode: 310,
  homeMobileNetworkCode: 410,
  radioType: 'gsm',
  carrier: 'Vodafone',
  considerIp: true
};

fetch(geoUrl, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(requestData)
})
.then(response => response.json())
.then(data => {
  const { lat, lng } = data.location;
  
  const geocodeApiKey = apiKey;
  const geocodeUrl = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${geocodeApiKey}`;
  
  return fetch(geocodeUrl);
})
.then(response => response.json())
.then(data => {
  const addressComponents = data.results[0].address_components;
  const country = addressComponents.find((component: { types: string[]; }) => component.types.includes('country'));
  if (country) {
    //console.log('Country Name:', country.long_name);
    //console.log('Country Code:', country.short_name);
   setCountryName(country.long_name); 
   if(country.long_name === 'India'){
    //console.log('Country Name:', country.long_name);
    setFilteredPlansSubscription(productData.subscriptionPlans.filter((plan: { currency: string; }) => plan.currency === 'INR'));
    setFilteredPlansLifetime(productData.lifetimePlans.filter((plan: { currency: string; }) => plan.currency === 'INR'));
  }else{
    setFilteredPlansSubscription(productData.subscriptionPlans.filter((plan: { currency: string; }) => plan.currency === 'USD'));
    setFilteredPlansLifetime(productData.lifetimePlans.filter((plan: { currency: string; }) => plan.currency === 'USD'));
  }
  } else {
    console.log('Country information not found');
  }
})
.catch(error => {
  console.error('Error:', error);
  // Add null check for productData before accessing its properties
  if (productData) {
    setFilteredPlansSubscription(productData.subscriptionPlans.filter((plan: { currency: string; }) => plan.currency === 'USD'));
    setFilteredPlansLifetime(productData.lifetimePlans.filter((plan: { currency: string; }) => plan.currency === 'USD'));
  }
});
  }, [productData]);


  const [wordLimit, setWordLimit] = useState("2000");
  const [featuredImage, setFeaturedImage] = useState("yes");
  const [imageInArticle, setImageInArticle] = useState("no");
  const [specialRequests, setSpecialRequests] = useState("");

  const infoBoxBg = useColorModeValue("bg-[#f3f4f5]", "bg-[#2196f3]");
  const infoBoxBg2 = useColorModeValue("bg-[#f5f7f9]", "bg-[#060d34]");
  const mytext = useColorModeValue("text-[#343232]", "text-white");
  const toolborder = useColorModeValue("border-[#e9e9f7]", "border-[#111b28]");

  return (
    <Container pt={["16px", "30px"]} alignItems="flex-center" maxWidth={700}>
      <VStack align="flex-start" spacing={6} width="100%">
        {/* Header Section */}
        <VStack align="flex-start" spacing={2} width="100%">
          <Heading size="lg" color="white">Article Generator</Heading>
          <Text className="text-slate-500 text-md">
            Generate up to 10 Articles in One Batch
          </Text>
        </VStack>
      
        <Box className={`border ${toolborder} rounded-lg p-4 w-full mb-4`}>
        {/* Mode Selection and Balance Section */}
        <Flex width="100%" justifyContent="space-between" alignItems="flex-start" gap={4}>
          <div className="flex flex-col w-full" data-tour="article-mode">
            <div className="flex items-center gap-4 mb-3 mode-div">
              <div className="relative dropdown-container" data-tour="article-mode">
                <label className="block text-sm font-medium text-slate-300 mb-2">Model Selection</label>
                <div className="relative">
                  <button
                    className="w-80 border border-slate-700 text-white rounded-lg pr-10 py-3 px-4 text-left flex items-center justify-between hover:border-slate-600 transition-all duration-200"
                    style={{ backgroundColor: '#040b26' }}
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  >
                    <span className="font-medium text-white">{selectedOption.label}</span>
                    <svg 
                      className={`w-4 h-4 text-slate-300 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  
                  {isDropdownOpen && (
                    <div className="absolute top-full left-0 right-0 mt-1 border border-slate-700 rounded-lg shadow-xl z-50 overflow-hidden" style={{ backgroundColor: '#040b26' }}>
                      {modelOptions.map((option, index) => (
                        <div
                          key={option.value}
                          className={`dropdown-option p-4 cursor-pointer transition-all duration-200 ${
                            index === 0 ? 'rounded-t-lg' : ''
                          } ${
                            index === modelOptions.length - 1 ? 'rounded-b-lg' : ''
                          } ${
                            selectedModel === option.value 
                              ? 'border-l-2 border-blue-500' 
                              : ''
                          }`}
                          style={{
                            backgroundColor: selectedModel === option.value 
                              ? '#1a1f3a' 
                              : 'transparent'
                          }}
                          onMouseEnter={(e) => {
                            if (selectedModel !== option.value) {
                              e.currentTarget.style.backgroundColor = '#1a1f3a';
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (selectedModel !== option.value) {
                              e.currentTarget.style.backgroundColor = 'transparent';
                            }
                          }}
                          onClick={() => handleModelSelect(option)}
                        >
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <strong className={`font-medium ${
                                selectedModel === option.value ? 'text-blue-300' : 'text-white'
                              }`}>
                                {option.label}
                              </strong>
                              <span className={`badge text-xs px-2 py-1 rounded-full ${
                                selectedModel === option.value 
                                  ? 'bg-blue-600 text-blue-100' 
                                  : 'bg-slate-700 text-slate-200'
                              }`}>
                                {option.credits}
                              </span>
                            </div>
                            <small className={`text-sm ${
                              selectedModel === option.value ? 'text-slate-300' : 'text-slate-400'
                            }`}>
                              {option.description}
                            </small>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              {isGodMode && (
                <div data-tour="advanced-settings">
                  <IconButton
                    aria-label="Settings"
                    icon={<FiSettings />}
                    onClick={() => setIsSettingsPopupOpen(true)}
                    variant="ghost"
                    size="sm"
                    color="gray.400"
                    _hover={{ color: "white" }}
                  />
                </div>
              )}
          <Flex direction="column" alignItems="flex-end" width="100%" className="balance-div">
            { isLoading ?
            <Spinner size="xs" color={spinnerColor} mr="16px" /> 
            :
            <>
            <Text fontSize="sm" color="gray.400">{balance.balance_text}: {balance.credits} Credits</Text>
            { user && user?.monthyBalance === 0 && user && user?.lifetimeBalance === 0 &&
            <Text
            fontSize="sm"
            color="blue.500"
            textDecoration="underline"
            onClick={openPricingPopup}
            cursor="pointer"
            >
              Buy more credits
            </Text>
            }
            </>
          }
          </Flex>
            </div>
          </div>
          

        </Flex>

        {/* Lite Mode Change Prompt */}
        {!isGodMode && (
          <Flex gap={2} width="100%" justifyContent="space-between" alignItems="center" mt="20px">
            <div data-tour="custom-prompt">
              <Button
                onClick={() => openPromptDialog()}
                size="sm"
                leftIcon={<TbPlus />}
                minW="160px"
                variant="solid"
                className="text-slate-500 custom-btn-1"
              >
                Change Prompt
              </Button>
            </div>
          </Flex>
        )}

        {/* Batch Details Section */}
        <VStack align="flex-start" spacing={3} width="100%" mt="20px">
          <Heading className={`${mytext} font-normal text-[18px]`}>Batch details</Heading>
          <Input
            placeholder="Batch name (Optional)"
            defaultValue={batchRef.current}
            onChange={(e) => handleBatchChange(e.target.value)}
            className="rounded-md w-1/2 flex-grow text-slate-500"
          />
        </VStack>

        {/* Keywords Section */}
        <VStack align="flex-start" spacing={3} width="100%" data-tour="keyword-input" mt="13px">
          <Heading className={`${mytext} font-normal text-[18px]`}>Keywords</Heading>
          <Textarea
            className="wtext-sm rounded-md w-full flex-grow text-slate-500 ca"
            placeholder="Keywords (Add 1 Per Line)"
            height="250px"
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          { lines.length > 0 &&
           <Text className="text-slate-500 text-sm">
            Keywords Added: {lines.length} | 
            Estimated Time: 
            { !isGodMode ? 
              lines.length*30 > 60 ? lines.length*30/60 + ' minutes' : lines.length*30 + ' seconds'
              :
              '15 minutes'
            }
            </Text>
          }
        </VStack>

        {/* Action Buttons */}
        <Flex gap={4} data-tour="generate-button" mt="16px" className="flex-col md:flex-row justify-end">
          <Button
            variant="outline"
            borderColor="gray.600"
            className="text-slate-500"
            _hover={{ borderColor: "gray.500", color: "white" }}
            onClick={() => setText('')}
            disabled={isProcessing}
          >
            Clear
          </Button>
          <Button
            colorScheme="brand"
            _hover={{ bg: "blue.700" }}
            onClick={() =>
              isGodMode
                ? sendKeywordsSequentiallyGodmode(lines)
                : sendKeywordsSequentially(lines)
            }
            disabled={isProcessing}
            px={8}
          >
            {isProcessing ? 'Generating...' : 'Generate'}
          </Button>
        </Flex>


        { isProcessing &&
          <p className="text-slate-500 text-sm">
            Please do not close the window.
          </p>
        }

{isProcessing && !isGodMode &&
    <div style={{ width: "100%", marginTop: '0px' }}>
    {/* <h3>{isProcessing ? `Processing: ${currentKeyword}` : "All keywords processed!"}</h3> */}
    <div style={{ width: "100%", backgroundColor: "#f0f0f0", borderRadius: "10px" }}>
      <div
        style={{
          width: `${progress}%`,
          height: "5px",
          backgroundColor: "#9decf9",
          borderRadius: "10px",
          transition: "width 0.5s ease-in-out",
        }}
      />
    </div>
    <p className="mt-2 text-slate-500 text-sm">{Math.round(progress)}% Complete</p>
  </div>
}
       { isProcessingGodmode && isGodMode && 
         <div className="godmod-progress fixed inset-0 z-50 flex items-center justify-center">
           <GodmodeLoader progress={progressGodmode} isProcessing={GodModeLoader} />
           { !GodModeLoader && godmodeStatus === 'Full' &&
              <VStack spacing={2}>
                  <Text className="text-slate-500">
                   Articles generated successfully.
                  </Text>
                  <br/>
                  <Button
                    colorScheme="brand"
                    size="sm"
                    onClick={() => router.push(`/articles?batchId=${batchRef.current}`)}
                    >
                    Check Articles
                  </Button>
              </VStack>
           }
           { !GodModeLoader && godmodeStatus === 'Partial' &&
             <VStack spacing={2}>
              <Text className="text-slate-500">
               {godmodeArticlePrepared.length} Articles Completed. {godmodeArticleRemain} articles are still in progress, we will email you when completed.
              </Text>
              <br/>
              <Button
               colorScheme="brand"
               size="sm"
               onClick={() => setIsProcessingGodmode(false)}
              >
               Generate New Article
              </Button>
             </VStack>
           }
           { !GodModeLoader && godmodeStatus === 'Incomplete' &&
             <VStack spacing={2}>
              <Text className="text-slate-500">
               {godmodeArticleRemain} articles Generated on God mode will be completed in another 20 minutes.
              </Text>
              <br/>
              <Button
               colorScheme="brand"
               size="sm"
               onClick={() => setIsProcessingGodmode(false)}
              >
               Generate New Article
              </Button>
             </VStack>
           }
         </div>      
       }
        </Box>
    </VStack>

      {isEditPromptDialogOpen && (
        <EditPromptDialog
          isOpen={isEditPromptDialogOpen}
          onClose={closeEditPromptDialog}
          prompt={prompt}
          setPrompt={setPrompt}
        />
      )}

      <SettingsPopup
          isOpen={isSettingsPopupOpen}
          onClose={() => setIsSettingsPopupOpen(false)}
          wordLimit={wordLimit}
          setWordLimit={setWordLimit}
          featuredImage={featuredImage}
          setFeaturedImage={setFeaturedImage}
          imageInArticle={imageInArticle}
          setImageInArticle={setImageInArticle}
          specialRequests={specialRequests}
          setSpecialRequests={setSpecialRequests}
       />

     {isPricingPopupOpen && (
       <PricingPopup 
         isOpen={isPricingPopupOpen} 
         onClose={closePricingPopup}
         activeTab={activeTab}
         setActiveTab={setActiveTab}
         productData={productData} 
         isLoadingPrice={isLoadingPrice}
         errorPrice={errorPrice}
         filteredPlansSubscription={filteredPlansSubscription}
         filteredPlansLifetime={filteredPlansLifetime}
         planData={planData}
         countryName={countryName}
        />
     )}

     {isTimerPopupOpen && (
       <TimerPopup 
         isOpen={isTimerPopupOpen} 
         onClose={closeTimerPopup}
         openPricingPopup={openPricingPopup}
         isGodMode={isGodMode}
        />
     )}

      {/* Tour Guide */}
      <TourGuide
        steps={isGodMode ? articleGeneratorGodModeTourSteps : articleGeneratorTourSteps}
        run={runTour}
        onTourComplete={handleTourComplete}
        onTourSkip={handleTourSkip}
        tourKey="article-generator"
      />

    </Container>
  );
};

export default ArticleGenerator;

const TimerPopup = ({
  isOpen,
  onClose,
  openPricingPopup,
  isGodMode
}: {
  isOpen: boolean;
  onClose: () => void;
  openPricingPopup: () => void;
  isGodMode: boolean;
}) => {

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[725px]">
        <div className="grid gap-4 py-4">
          <div className="flex items-center">
            <div style={{textAlign: 'center', width: '100%'}}>
             { !isGodMode &&
             <>
              <LuTimerReset style={{fontSize: '100px', color: '#76e4f7', display: 'inline'}}/>
              <br/><br/>
             </>
             } 
             {isGodMode ? 
             <>
              <h3 className="text-2xl font-bold mb-4">Trial Balance has expired</h3>
              <p>Please updgrade to generate more god mode articles.</p>
             </>
             :
             <p>Credits will refill in next 24 hours</p>
             }
             <br/>
             <Button
               type="button"
               colorScheme="brand"
               onClick={async () => {
                 openPricingPopup();
                 onClose();
               }}
             >
              Upgrade
             </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

const EditPromptDialog = ({
  isOpen,
  onClose,
  prompt,
  setPrompt
}: {
  isOpen: boolean;
  onClose: () => void;
  prompt: string;
  setPrompt: (value: string) => void;
}) => {

  const [currentPrompt, setCurrentPrompt] = useState(prompt);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[725px]">
        <DialogHeader>
          <DialogTitle>Edit Prompt</DialogTitle>
          <DialogDescription>
            Update your prompt. Please do not remove the variable &#123;KEYWORD&#125;
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="flex items-center gap-4">
            <div className="flex-1">
            <Textarea
              className="wtext-sm rounded-md w-full flex-grow"
              placeholder="Keywords (Add 1 Per Line)"
              height="200px"
              value={currentPrompt}
              onChange={(e) => {
                setCurrentPrompt(e.target.value);
              }}
            />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button
            type="submit"
            colorScheme="brand"
            onClick={async () => {
              if(!currentPrompt.includes('{KEYWORD}')) {
                toast.error("The variable {KEYWORD} must be there in the prompt. Please add that.");
                return;
              }
              setPrompt(currentPrompt);
              onClose();
            }}
          >
            Update
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

interface SubscriptionPlan {
  id: number;
  name: string;
  productId: string;
  priceId: string;
  price: number;
  features: string;
}

interface ProductData {
  subscriptionPlans?: SubscriptionPlan[];
  lifetimePlans?: SubscriptionPlan[]; // Add this if lifetimePlans also exists
}

interface PricingPopupProps {
  isOpen: boolean;
  onClose: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  productData: ProductData,
  isLoadingPrice: boolean,
  errorPrice: Error | null,
  filteredPlansSubscription: any[],
  filteredPlansLifetime: any[],
  planData: any,
  countryName: string
}

const PricingPopup: React.FC<PricingPopupProps> = ({ isOpen, onClose, activeTab, setActiveTab, productData, isLoadingPrice, errorPrice, filteredPlansSubscription, filteredPlansLifetime, planData, countryName }) => {
  const [processingPlan, setProcessingPlan] = useState<string | null>(null);
  
  // Tooltip color mode values
  const tooltipBg = useColorModeValue("gray.800", "gray.200");
  const tooltipColor = useColorModeValue("white", "gray.800");

  const handleTabClick = (tab: string): void => {
    setActiveTab(tab);
  };

  const payStripeSubscription = async (priceId: string, name: string) => {
    setProcessingPlan(priceId);
    if(countryName === 'India'){
      try {
        const response = await fetch("/api/subscriptions/stripe", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ priceId, name }), 
        });
  
        if (!response.ok) throw new Error(`Error: ${response.status}`);
        const { url } = await response.json();
        window.location.href = url;
      } catch (error:any) {
       // console.error("Fetch error:", error);
        return { error: error.message };
      }
    }else{
      try {
        const response = await fetch("/api/subscriptions/lemon-squeezy", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ variantId: priceId, name }), 
        });
  
        if (!response.ok) throw new Error(`Error: ${response.status}`);
        const { checkoutUrl, checkoutId } = await response.json();
        window.location.href = checkoutUrl;
      } catch (error:any) {
        //console.error("Fetch error:", error);
        return { error: error.message };
      }
    }

  }; 

  const payStripeLifetime = async (priceId: string, name: string) => {
    setProcessingPlan(priceId);
    if(countryName === 'India'){
      try {
        const response = await fetch("/api/lifetimePurchase", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ priceId, name }), 
        });
  
        if (!response.ok) throw new Error(`Error: ${response.status}`);
        const { url } = await response.json();
        window.location.href = url;
      } catch (error:any) {
       // console.error("Fetch error:", error);
        return { error: error.message };
      }
    }else{
      try {
        const response = await fetch("/api/lifetime-purchase/lemon-squeezy", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ variantId: priceId, name }), 
        });
  
        if (!response.ok) throw new Error(`Error: ${response.status}`);
        const { checkoutUrl, checkoutId } = await response.json();
        window.location.href = checkoutUrl;
      } catch (error:any) {
        //console.error("Fetch error:", error);
        return { error: error.message };
      }
    }

  };

  const bg12 = useColorModeValue('#ffffff', '#060d36');
  const planCardBg = 'transparent';
  const planCardBorder = useColorModeValue('gray.300', 'gray.500');
  const tabBorderColor = useColorModeValue('gray.300', 'rgba(255,255,255,0.2)');
  const tabTextColor = useColorModeValue('gray.700', 'white');

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="6xl" isCentered>
      <ModalOverlay />
      <ModalContent bgColor={bg12} maxW="900px" maxH="90vh">
        <ModalHeader textAlign="center">Upgrade Plan</ModalHeader>
        <ModalCloseButton />
        <ModalBody pb={6} overflowY="auto">
                     {/* Tabs */}
           <div className="flex justify-center mb-4">
             <div className="flex">
               <button 
                 className={`px-5 py-2 font-medium border rounded-l-lg cursor-pointer
                   ${activeTab === 'monthly' 
                     ? 'bg-[#33d6e2] border-[#33d6e2] text-[#141824] font-semibold' 
                     : 'bg-transparent'}`}
                 style={{
                   borderColor: activeTab === 'monthly' ? '#33d6e2' : tabBorderColor,
                   color: activeTab === 'monthly' ? '#141824' : tabTextColor
                 }}
                 onClick={() => handleTabClick('monthly')}
               >
                 Monthly
               </button>
               <button 
                 className={`px-5 py-2 font-medium border rounded-r-lg cursor-pointer
                   ${activeTab === 'onetime' 
                     ? 'bg-[#33d6e2] border-[#33d6e2] text-[#141824] font-semibold' 
                     : 'bg-transparent'}`}
                 style={{
                   borderColor: activeTab === 'onetime' ? '#33d6e2' : tabBorderColor,
                   color: activeTab === 'onetime' ? '#141824' : tabTextColor
                 }}
                 onClick={() => handleTabClick('onetime')}
               >
                 Pay-per-Credit
               </button>
             </div>
           </div>
<br/>
          {/* Content Area with Plans */}
          {activeTab === 'monthly' ? (
            <div className="flex flex-col md:flex-row gap-4">
              {isLoadingPrice && 'Loading plans...'}

                             { filteredPlansSubscription &&
                 filteredPlansSubscription.map((plan: {id: number; name: string; productId: string; priceId: string; price: number; features: string, currency: string}) => (
                 <Box key={plan.id} bg={planCardBg} className="rounded-lg flex-1 p-6 relative min-h-[380px] hover:transform hover:translate-y-[-4px] hover:shadow-lg transition-all duration-300" borderColor={plan.name === 'Premium' ? '#33d6e2' : planCardBorder} borderWidth="1px" _hover={{borderColor: '#33d6e2'}}>
                  { plan.name === 'Premium' &&
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-[#33d6e2] text-[#141824] text-xs font-semibold py-1 px-2.5 rounded-xl uppercase">
                      Most Popular
                    </div>
                  }
                  <div className="mb-4">
                    <h3 className="font-semibold text-xl mb-2">{plan.name}</h3>
                  </div>
                  <div className="text-3xl font-bold my-2">
                    <span className="text-base align-top relative top-0.5">{plan.currency === 'INR' ? '₹' : '$'}</span>{plan.price}
                    <span className="text-sm font-normal text-[#8990a5]">/month</span>
                  </div>
                  <ul className="list-none p-0 my-6 mb-[70px]">
                    {plan.features
                      ? JSON.parse(plan.features).slice(0, 2).map((feature: string, index: number) => {
                          const match = feature.match(/^(\d+|Unlimited)\s(.+)$/); // Extracts number and text part
                          return (
                            <li key={index} className="py-2 flex items-start text-[#8990a5] text-sm leading-tight">
                              <span className="text-[#33d6e2] mr-2 font-bold flex-shrink-0">✓</span>
                              {match ? (
                                <span>
                                  <span className="text-[#33d6e2] font-medium">{match[1]}</span> {match[2]}
                                </span>
                              ) : (
                                <span>{feature}</span> // If no number detected, show feature as is
                              )}
                            </li>
                          );
                        })
                      : null}
                    <li className="py-2 flex items-start text-[#8990a5] text-sm leading-tight">
                      <span className="text-[#33d6e2] mr-2 font-bold flex-shrink-0">✓</span>
                      <Flex align="center" gap={2}>
                        <span>SERP Analysis</span>
                        <Tooltip 
                          label="Analyzes top-ranking pages to identify what content performs best for your target keyword."
                          placement="top"
                          hasArrow
                          bg={tooltipBg}
                          color={tooltipColor}
                          fontSize="sm"
                          px={3}
                          py={2}
                          borderRadius="md"
                          sx={{
                            bg: tooltipBg + " !important",
                            color: tooltipColor + " !important",
                          }}
                        >
                          <Box display="inline-flex" alignItems="center">
                            <BsFillQuestionCircleFill size={14} color="#8990a5"/>
                          </Box>
                        </Tooltip>
                      </Flex>
                    </li>
                    <li className="py-2 flex items-start text-[#8990a5] text-sm leading-tight">
                      <span className="text-[#33d6e2] mr-2 font-bold flex-shrink-0">✓</span>
                      <Flex align="center" gap={2}>
                        <span>Keyword Intent Analysis</span>
                        <Tooltip 
                          label="Analyzes the search intent behind your target keyword to create content that matches user expectations."
                          placement="top"
                          hasArrow
                          bg={tooltipBg}
                          color={tooltipColor}
                          fontSize="sm"
                          px={3}
                          py={2}
                          borderRadius="md"
                          sx={{
                            bg: tooltipBg + " !important",
                            color: tooltipColor + " !important",
                          }}
                        >
                          <Box display="inline-flex" alignItems="center">
                            <BsFillQuestionCircleFill size={14} color="#8990a5"/>
                          </Box>
                        </Tooltip>
                      </Flex>
                    </li>
                    <li className="py-2 flex items-start text-[#8990a5] text-sm leading-tight">
                      <span className="text-[#33d6e2] mr-2 font-bold flex-shrink-0">✓</span>
                      <Flex align="center" gap={2}>
                        <span>Deep Research</span>
                        <Tooltip 
                          label="We break down your query, analyze hundreds of reliable sources, and produce fact-checked, accurate articles with zero hallucination."
                          placement="top"
                          hasArrow
                          bg={tooltipBg}
                          color={tooltipColor}
                          fontSize="sm"
                          px={3}
                          py={2}
                          borderRadius="md"
                          sx={{
                            bg: tooltipBg + " !important",
                            color: tooltipColor + " !important",
                          }}
                        >
                          <Box display="inline-flex" alignItems="center">
                            <BsFillQuestionCircleFill size={14} color="#8990a5"/>
                          </Box>
                        </Tooltip>
                      </Flex>
                    </li>
                    <li className="py-2 flex items-start text-[#8990a5] text-sm leading-tight">
                      <span className="text-[#33d6e2] mr-2 font-bold flex-shrink-0">✓</span>
                      <Flex align="center" gap={2}>
                        <span>Images & Infographics</span>
                        <Tooltip 
                          label="Automatically generates and includes relevant images and infographics to enhance your content."
                          placement="top"
                          hasArrow
                          bg={tooltipBg}
                          color={tooltipColor}
                          fontSize="sm"
                          px={3}
                          py={2}
                          borderRadius="md"
                          sx={{
                            bg: tooltipBg + " !important",
                            color: tooltipColor + " !important",
                          }}
                        >
                          <Box display="inline-flex" alignItems="center">
                            <BsFillQuestionCircleFill size={14} color="#8990a5"/>
                          </Box>
                        </Tooltip>
                      </Flex>
                    </li>
                    <li className="py-2 flex items-start text-[#8990a5] text-sm leading-tight">
                      <span className="text-[#33d6e2] mr-2 font-bold flex-shrink-0">✓</span>
                      <Flex align="center" gap={2}>
                        <span>AI SEO Optimization</span>
                        <Tooltip 
                          label="Optimizes content structure, headings, and keywords for better search engine rankings."
                          placement="top"
                          hasArrow
                          bg={tooltipBg}
                          color={tooltipColor}
                          fontSize="sm"
                          px={3}
                          py={2}
                          borderRadius="md"
                          sx={{
                            bg: tooltipBg + " !important",
                            color: tooltipColor + " !important",
                          }}
                        >
                          <Box display="inline-flex" alignItems="center">
                            <BsFillQuestionCircleFill size={14} color="#8990a5"/>
                          </Box>
                        </Tooltip>
                      </Flex>
                    </li>
                    <li className="py-2 flex items-start text-[#8990a5] text-sm leading-tight">
                      <span className="text-[#33d6e2] mr-2 font-bold flex-shrink-0">✓</span>
                      <Flex align="center" gap={2}>
                        <span>Bulk Writing Mode</span>
                        <Tooltip 
                          label="Generate multiple articles at once with batch processing capabilities for maximum efficiency."
                          placement="top"
                          hasArrow
                          bg={tooltipBg}
                          color={tooltipColor}
                          fontSize="sm"
                          px={3}
                          py={2}
                          borderRadius="md"
                          sx={{
                            bg: tooltipBg + " !important",
                            color: tooltipColor + " !important",
                          }}
                        >
                          <Box display="inline-flex" alignItems="center">
                            <BsFillQuestionCircleFill size={14} color="#8990a5"/>
                          </Box>
                        </Tooltip>
                      </Flex>
                    </li>
                    <li className="py-2 flex items-start text-[#8990a5] text-sm leading-tight">
                      <span className="text-[#33d6e2] mr-2 font-bold flex-shrink-0">✓</span>
                      <Flex align="center" gap={2}>
                        <span>WordPress Integration</span>
                        <Tooltip 
                          label="Seamlessly publish articles directly to your WordPress site with one-click integration."
                          placement="top"
                          hasArrow
                          bg={tooltipBg}
                          color={tooltipColor}
                          fontSize="sm"
                          px={3}
                          py={2}
                          borderRadius="md"
                          sx={{
                            bg: tooltipBg + " !important",
                            color: tooltipColor + " !important",
                          }}
                        >
                          <Box display="inline-flex" alignItems="center">
                            <BsFillQuestionCircleFill size={14} color="#8990a5"/>
                          </Box>
                        </Tooltip>
                      </Flex>
                    </li>
                    <li className="py-2 flex items-start text-[#8990a5] text-sm leading-tight">
                      <span className="text-[#33d6e2] mr-2 font-bold flex-shrink-0">✓</span>
                      <Flex align="center" gap={2}>
                        <span>Semantic SEO</span>
                        <Tooltip 
                          label="Enriches content with related terms and entities to improve topical authority."
                          placement="top"
                          hasArrow
                          bg={tooltipBg}
                          color={tooltipColor}
                          fontSize="sm"
                          px={3}
                          py={2}
                          borderRadius="md"
                          sx={{
                            bg: tooltipBg + " !important",
                            color: tooltipColor + " !important",
                          }}
                        >
                          <Box display="inline-flex" alignItems="center">
                            <BsFillQuestionCircleFill size={14} color="#8990a5"/>
                          </Box>
                        </Tooltip>
                      </Flex>
                    </li>
                    <li className="py-2 flex items-start text-[#8990a5] text-sm leading-tight">
                      <span className="text-[#33d6e2] mr-2 font-bold flex-shrink-0">✓</span>
                      <Flex align="center" gap={2}>
                        <span>High EEAT Score</span>
                        <Tooltip 
                          label="Includes citations, outbound links, semantic structure, and first-person insights for authoritative, trustworthy content."
                          placement="top"
                          hasArrow
                          bg={tooltipBg}
                          color={tooltipColor}
                          fontSize="sm"
                          px={3}
                          py={2}
                          borderRadius="md"
                          sx={{
                            bg: tooltipBg + " !important",
                            color: tooltipColor + " !important",
                          }}
                        >
                          <Box display="inline-flex" alignItems="center">
                            <BsFillQuestionCircleFill size={14} color="#8990a5"/>
                          </Box>
                        </Tooltip>
                      </Flex>
                    </li>
                    <li className="py-2 flex items-start text-[#8990a5] text-sm leading-tight">
                      <span className="text-[#33d6e2] mr-2 font-bold flex-shrink-0">✓</span>
                      <span>
                        {plan.name === 'Pro' ? 'Email Support' : 'Priority Support'}
                      </span>
                    </li>
                  </ul>
                  <button  
                    onClick={() => payStripeSubscription(plan.priceId, plan.name)} 
                    className="absolute bottom-6 left-6 right-6 bg-[#33d6e2] text-[#141824] border-none rounded-lg py-3 font-semibold cursor-pointer hover:opacity-90 hover:transform hover:translate-y-[-2px] transition-all duration-200"
                    disabled={processingPlan === plan.priceId}
                  >
                    { 
                      planData?.SubscriptionPlan && planData.SubscriptionPlan.planId === plan.id ?
                      'Current Plan'
                      :
                      <>
                      { processingPlan === plan.priceId ? 'Processing Payment...' : 'Upgrade Now'}
                      </>
                    }
                  </button>
                </Box>
                ))
              }            
            </div>
          ) : (
            <div className="flex flex-col md:flex-row gap-4">
              { filteredPlansLifetime &&
                filteredPlansLifetime.map((plan: {id: number; name: string; productId: string; priceId: string; price: number; features: string, currency: string}) => (
                <Box key={plan.id} bg={planCardBg} className="rounded-lg flex-1 p-6 relative min-h-[380px] hover:transform hover:translate-y-[-4px] hover:shadow-lg transition-all duration-300" borderColor={plan.name === 'Premium' ? '#33d6e2' : planCardBorder} borderWidth="1px" _hover={{borderColor: '#33d6e2'}}>
                  { plan.name === 'Premium' &&
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-[#33d6e2] text-[#141824] text-xs font-semibold py-1 px-2.5 rounded-xl uppercase">
                      Most Popular
                    </div>
                  }
                  <div className="mb-4">
                    <h3 className="font-semibold text-xl mb-2">{plan.name}</h3>
                  </div>
                  <div className="text-3xl font-bold my-2">
                    <span className="text-base align-top relative top-0.5">{plan.currency === 'INR' ? '₹' : '$'}</span>{plan.price}
                    <span className="text-sm font-normal text-[#8990a5]"></span>
                  </div>
                  <ul className="list-none p-0 my-6 mb-[70px]">
                    {plan.features
                      ? JSON.parse(plan.features).slice(0, 2).map((feature: string, index: number) => {
                          const match = feature.match(/^(\d+|Unlimited)\s(.+)$/); // Extracts number and text part
                          return (
                            <li key={index} className="py-2 flex items-start text-[#8990a5] text-sm leading-tight">
                              <span className="text-[#33d6e2] mr-2 font-bold flex-shrink-0">✓</span>
                              {match ? (
                                <span>
                                  <span className="text-[#33d6e2] font-medium">{match[1]}</span> {match[2]}
                                </span>
                              ) : (
                                <span>{feature}</span> // If no number detected, show feature as is
                              )}
                            </li>
                          );
                        })
                      : null}
                    <li className="py-2 flex items-start text-[#8990a5] text-sm leading-tight">
                      <span className="text-[#33d6e2] mr-2 font-bold flex-shrink-0">✓</span>
                      <Flex align="center" gap={2}>
                        <span>SERP Analysis</span>
                        <Tooltip 
                          label="Analyzes top-ranking pages to identify what content performs best for your target keyword."
                          placement="top"
                          hasArrow
                          bg={tooltipBg}
                          color={tooltipColor}
                          fontSize="sm"
                          px={3}
                          py={2}
                          borderRadius="md"
                          sx={{
                            bg: tooltipBg + " !important",
                            color: tooltipColor + " !important",
                          }}
                        >
                          <Box display="inline-flex" alignItems="center">
                            <BsFillQuestionCircleFill size={14} color="#8990a5"/>
                          </Box>
                        </Tooltip>
                      </Flex>
                    </li>
                    <li className="py-2 flex items-start text-[#8990a5] text-sm leading-tight">
                      <span className="text-[#33d6e2] mr-2 font-bold flex-shrink-0">✓</span>
                      <Flex align="center" gap={2}>
                        <span>Keyword Intent Analysis</span>
                        <Tooltip 
                          label="Analyzes the search intent behind your target keyword to create content that matches user expectations."
                          placement="top"
                          hasArrow
                          bg={tooltipBg}
                          color={tooltipColor}
                          fontSize="sm"
                          px={3}
                          py={2}
                          borderRadius="md"
                          sx={{
                            bg: tooltipBg + " !important",
                            color: tooltipColor + " !important",
                          }}
                        >
                          <Box display="inline-flex" alignItems="center">
                            <BsFillQuestionCircleFill size={14} color="#8990a5"/>
                          </Box>
                        </Tooltip>
                      </Flex>
                    </li>
                    <li className="py-2 flex items-start text-[#8990a5] text-sm leading-tight">
                      <span className="text-[#33d6e2] mr-2 font-bold flex-shrink-0">✓</span>
                      <Flex align="center" gap={2}>
                        <span>Deep Research</span>
                        <Tooltip 
                          label="We break down your query, analyze hundreds of reliable sources, and produce fact-checked, accurate articles with zero hallucination."
                          placement="top"
                          hasArrow
                          bg={tooltipBg}
                          color={tooltipColor}
                          fontSize="sm"
                          px={3}
                          py={2}
                          borderRadius="md"
                          sx={{
                            bg: tooltipBg + " !important",
                            color: tooltipColor + " !important",
                          }}
                        >
                          <Box display="inline-flex" alignItems="center">
                            <BsFillQuestionCircleFill size={14} color="#8990a5"/>
                          </Box>
                        </Tooltip>
                      </Flex>
                    </li>
                    <li className="py-2 flex items-start text-[#8990a5] text-sm leading-tight">
                      <span className="text-[#33d6e2] mr-2 font-bold flex-shrink-0">✓</span>
                      <Flex align="center" gap={2}>
                        <span>Images & Infographics</span>
                        <Tooltip 
                          label="Automatically generates and includes relevant images and infographics to enhance your content."
                          placement="top"
                          hasArrow
                          bg={tooltipBg}
                          color={tooltipColor}
                          fontSize="sm"
                          px={3}
                          py={2}
                          borderRadius="md"
                          sx={{
                            bg: tooltipBg + " !important",
                            color: tooltipColor + " !important",
                          }}
                        >
                          <Box display="inline-flex" alignItems="center">
                            <BsFillQuestionCircleFill size={14} color="#8990a5"/>
                          </Box>
                        </Tooltip>
                      </Flex>
                    </li>
                    <li className="py-2 flex items-start text-[#8990a5] text-sm leading-tight">
                      <span className="text-[#33d6e2] mr-2 font-bold flex-shrink-0">✓</span>
                      <Flex align="center" gap={2}>
                        <span>AI SEO Optimization</span>
                        <Tooltip 
                          label="Optimizes content structure, headings, and keywords for better search engine rankings."
                          placement="top"
                          hasArrow
                          bg={tooltipBg}
                          color={tooltipColor}
                          fontSize="sm"
                          px={3}
                          py={2}
                          borderRadius="md"
                          sx={{
                            bg: tooltipBg + " !important",
                            color: tooltipColor + " !important",
                          }}
                        >
                          <Box display="inline-flex" alignItems="center">
                            <BsFillQuestionCircleFill size={14} color="#8990a5"/>
                          </Box>
                        </Tooltip>
                      </Flex>
                    </li>
                    <li className="py-2 flex items-start text-[#8990a5] text-sm leading-tight">
                      <span className="text-[#33d6e2] mr-2 font-bold flex-shrink-0">✓</span>
                      <Flex align="center" gap={2}>
                        <span>Bulk Writing Mode</span>
                        <Tooltip 
                          label="Generate multiple articles at once with batch processing capabilities for maximum efficiency."
                          placement="top"
                          hasArrow
                          bg={tooltipBg}
                          color={tooltipColor}
                          fontSize="sm"
                          px={3}
                          py={2}
                          borderRadius="md"
                          sx={{
                            bg: tooltipBg + " !important",
                            color: tooltipColor + " !important",
                          }}
                        >
                          <Box display="inline-flex" alignItems="center">
                            <BsFillQuestionCircleFill size={14} color="#8990a5"/>
                          </Box>
                        </Tooltip>
                      </Flex>
                    </li>
                    <li className="py-2 flex items-start text-[#8990a5] text-sm leading-tight">
                      <span className="text-[#33d6e2] mr-2 font-bold flex-shrink-0">✓</span>
                      <Flex align="center" gap={2}>
                        <span>WordPress Integration</span>
                        <Tooltip 
                          label="Seamlessly publish articles directly to your WordPress site with one-click integration."
                          placement="top"
                          hasArrow
                          bg={tooltipBg}
                          color={tooltipColor}
                          fontSize="sm"
                          px={3}
                          py={2}
                          borderRadius="md"
                          sx={{
                            bg: tooltipBg + " !important",
                            color: tooltipColor + " !important",
                          }}
                        >
                          <Box display="inline-flex" alignItems="center">
                            <BsFillQuestionCircleFill size={14} color="#8990a5"/>
                          </Box>
                        </Tooltip>
                      </Flex>
                    </li>
                    <li className="py-2 flex items-start text-[#8990a5] text-sm leading-tight">
                      <span className="text-[#33d6e2] mr-2 font-bold flex-shrink-0">✓</span>
                      <Flex align="center" gap={2}>
                        <span>Semantic SEO</span>
                        <Tooltip 
                          label="Enriches content with related terms and entities to improve topical authority."
                          placement="top"
                          hasArrow
                          bg={tooltipBg}
                          color={tooltipColor}
                          fontSize="sm"
                          px={3}
                          py={2}
                          borderRadius="md"
                          sx={{
                            bg: tooltipBg + " !important",
                            color: tooltipColor + " !important",
                          }}
                        >
                          <Box display="inline-flex" alignItems="center">
                            <BsFillQuestionCircleFill size={14} color="#8990a5"/>
                          </Box>
                        </Tooltip>
                      </Flex>
                    </li>
                    <li className="py-2 flex items-start text-[#8990a5] text-sm leading-tight">
                      <span className="text-[#33d6e2] mr-2 font-bold flex-shrink-0">✓</span>
                      <Flex align="center" gap={2}>
                        <span>High EEAT Score</span>
                        <Tooltip 
                          label="Includes citations, outbound links, semantic structure, and first-person insights for authoritative, trustworthy content."
                          placement="top"
                          hasArrow
                          bg={tooltipBg}
                          color={tooltipColor}
                          fontSize="sm"
                          px={3}
                          py={2}
                          borderRadius="md"
                          sx={{
                            bg: tooltipBg + " !important",
                            color: tooltipColor + " !important",
                          }}
                        >
                          <Box display="inline-flex" alignItems="center">
                            <BsFillQuestionCircleFill size={14} color="#8990a5"/>
                          </Box>
                        </Tooltip>
                      </Flex>
                    </li>
                    <li className="py-2 flex items-start text-[#8990a5] text-sm leading-tight">
                      <span className="text-[#33d6e2] mr-2 font-bold flex-shrink-0">✓</span>
                      <span>
                        {plan.name === 'Pro' ? 'Email Support' : 'Priority Support'}
                      </span>
                    </li>
                  </ul>
                  <button  
                    onClick={() => payStripeLifetime(plan.priceId, plan.name)} 
                    className="absolute bottom-6 left-6 right-6 bg-[#33d6e2] text-[#141824] border-none rounded-lg py-3 font-semibold cursor-pointer hover:opacity-90 hover:transform hover:translate-y-[-2px] transition-all duration-200"
                    disabled={processingPlan === plan.priceId}
                  >
                    { processingPlan === plan.priceId ? 'Processing Payment...' : 'Upgrade Now'}
                  </button>
                </Box>
                ))
              }
            </div>
          )}
        </ModalBody>

        <ModalFooter justifyContent="center" textAlign="center" fontSize="sm">
          All plans include a 7-day money-back guarantee. Need help choosing? Contact our support team.
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

const SettingsPopup = ({
  isOpen,
  onClose,
  wordLimit,
  setWordLimit,
  featuredImage,
  setFeaturedImage,
  imageInArticle,
  setImageInArticle,
  specialRequests,
  setSpecialRequests
}: {
  isOpen: boolean;
  onClose: () => void;
  wordLimit: string;
  setWordLimit: (value: string) => void;
  featuredImage: string;
  setFeaturedImage: (value: string) => void;
  imageInArticle: string;
  setImageInArticle: (value: string) => void;
  specialRequests: string;
  setSpecialRequests: (value: string) => void;
}) => {

  const bg12 = useColorModeValue('white', '#060d36');

  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered>
      <ModalOverlay />
      <ModalContent bgColor={bg12}>
        <ModalHeader>Advanced Settings</ModalHeader>
        <ModalCloseButton />
        <ModalBody pb={6}>
          <FormControl>
            <FormLabel>Word Limit</FormLabel>
            <Select value={wordLimit} mb={3} onChange={(e) => setWordLimit(e.target.value)}>
              <option value="1000">Under 1000 words</option>
              <option value="2000">Under 2000 words</option>
              <option value="3000">Under 3000 words</option>
              <option value="4000">Under 4000 words</option>
            </Select>
          </FormControl>

          <FormControl mt={4}>
            <FormLabel>Featured Image Generation</FormLabel>
            <Select value={featuredImage} onChange={(e) => setFeaturedImage(e.target.value)} mb={3}>
              <option value="yes">Yes</option>
              <option value="no">No</option>
            </Select>
          </FormControl>

          <FormControl mt={4}>
            <FormLabel>Image in Article</FormLabel>
            <Select 
              value={imageInArticle} 
              onChange={(e) => setImageInArticle(e.target.value)} 
              mb={3}
            >
              <option value="yes">Yes</option>
              <option value="no">No</option>
            </Select>
          </FormControl>

          <FormControl mt={4}>
            <FormLabel>
              <Flex alignItems="center" gap={1}>
                <Tooltip 
                  label="You can tell the smart AI generation engine anything you want in the article. Eg. Make sure the article is specific to Germany or I want you to link to my website ABCD.com in a non promotional manner so that people click on it."
                  hasArrow
                  placement="top"
                >
                  <Box>
                    <FiInfo />
                  </Box>
                </Tooltip>
                Special Requests (Optional)
              </Flex>
            </FormLabel>
            <Textarea
              placeholder="Example - Mention my Brand ABCD.com as the most preferred or top ranked option wherever applicable"
              value={specialRequests}
              onChange={(e) => setSpecialRequests(e.target.value)}
              size="sm"
            />
          </FormControl>
        </ModalBody>

        <ModalFooter>
          <Button colorScheme="blue" mr={3} onClick={onClose}>
            Done
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};
