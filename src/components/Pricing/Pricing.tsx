"use client";

import { useEffect } from "react";
import { Button, Flex, Heading, SimpleGrid, Text, Tooltip, useColorModeValue, Box } from "@chakra-ui/react";
import { BsFillQuestionCircleFill } from "react-icons/bs";
import { PricingPlan } from "./PricingPlan";
import { useRouter } from "next/navigation";
import { Section } from "../atoms/Section/Section";
import { useState } from "react";
import { useColorModeValues } from "@/hooks/useColorModeValues";
import { useQuery } from "@tanstack/react-query";
import { useIsLogged } from "@/hooks/useIsLogged";

export const Pricing = () => {
  const router = useRouter();
  const { primaryTextColor, secondaryTextColor, borderColor,bgColor } =
    useColorModeValues();
  const { isLogged } = useIsLogged();
  
  // Tooltip color mode values
  const tooltipBg = useColorModeValue("gray.800", "gray.200");
  const tooltipColor = useColorModeValue("white", "gray.800");
  const [planType, setPlanType] = useState<"monthly" | "annual">("annual");
  const isMonthly = planType === "monthly";

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
 // console.log(productData);

  // Filter plans based on country
  const [filteredPlansSubscription, setFilteredPlansSubscription] = useState<any[]>([]);
  const [filteredPlansLifetime, setFilteredPlansLifetime] = useState<any[]>([]);
  const [countryName, setCountryName] = useState<string>('');

  useEffect(() => {
    //  console.log(productData);
      // Early return if productData is not available yet
      if (!productData) return;
      

const apiKey = process.env.GOOGLE_API_KEY;
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
  //  console.log('Country Name:', country.long_name);
   // console.log('Country Code:', country.short_name);
   setCountryName(country.long_name); 
   if(country.long_name === 'India'){
  //  console.log('Country Name:', country_name);
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
      enabled: isLogged,
  });
  
  //console.log(planData);

    const [activeTab, setActiveTab] = useState<string>("monthly")
    const [processingPlan, setProcessingPlan] = useState<string | null>(null);
    const handleTabClick = (tab: string): void => {
      setActiveTab(tab);
    };

    const payStripeSubscription = async (priceId: string, name: string) => {
      if (!isLogged) {
        router.push('/login');
        return;
      }
      
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
          //console.error("Fetch error:", error);
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
      if (!isLogged) {
        router.push('/login');
        return;
      }
      
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
          //console.error("Fetch error:", error);
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

  return (
    <>
      <Section flexDir="column" id="pricing">
        <Heading as="h4" fontSize="16px" color="brand.400" mb="16px">
          Pricing
        </Heading>
        <Heading
          as="h2"
          fontSize={["26px", "40px", "48px"]}
          lineHeight={["32px", "48px", "56px"]}
          mb="32px"
          fontWeight="extrabold"
          textAlign="center"
        >
          Upgrade your plan
        </Heading>

      </Section>
      {isLoadingPrice && 
      <Text my="5px" textAlign="center">
        Loading plans...
      </Text>
      }
      { !isLoadingPrice &&
        <Flex
        mt="5px"
        fontSize="14px"
        color={secondaryTextColor}
        justifyContent="center"
        className="mx-auto block text-center md:flex md:text-left"
        >
        <Text ml="5px" mr="5px">All plans include a</Text>
        <Tooltip 
          label="Refund applicable for unused credits, or error in article generations"
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
          <Text textDecor={isMonthly ? "line-through" : "none"} color="brand.400" cursor="help">
            7-day money-back guarantee.
          </Text>
        </Tooltip>
        <Text ml="5px">Need help choosing? Contact our support team.</Text>
        </Flex>
      }
      {!isLoadingPrice &&
            <Section mt="60px" alignItems="center" className="block max-w-[1000px] my-5 mx-auto">
            {/* Tabs */}
            <div className="flex justify-center p-4">
              <div className="flex">
                <button 
                  className={`px-5 py-2 font-medium border border-[rgba(255,255,255,0.2)] 
                    ${activeTab === 'monthly' 
                      ? 'bg-[#33d6e2] border-[#33d6e2] text-[#141824] font-semibold' 
                      : `bg-transparent ${secondaryTextColor} ${borderColor}`} 
                    rounded-l-lg cursor-pointer`}
                  onClick={() => handleTabClick('monthly')}
                >
                  Monthly
                </button>
                <button 
                  className={`px-5 py-2 font-medium border border-[rgba(255,255,255,0.2)] 
                    ${activeTab === 'onetime' 
                      ? 'bg-[#33d6e2] border-[#33d6e2] text-[#141824] font-semibold' 
                      : `bg-transparent ${secondaryTextColor} ${borderColor}`} 
                    rounded-r-lg cursor-pointer`}
                  onClick={() => handleTabClick('onetime')}
                >
                  Pay-per-Credit
                </button>
              </div>
            </div>
    
            {/* Content Area with Plans */}
            <div className="overflow-y-auto">
              {activeTab === 'monthly' ? (
                <div className="flex flex-col md:flex-row p-4 md:p-6 gap-4">
    { filteredPlansSubscription &&
      filteredPlansSubscription.map((plan: {id: number; name: string; productId: string; priceId: string; price: number; features: string, currency: string}) => (
      <div key={plan.id} className={`${bgColor} rounded-lg flex-1 p-6 border ${borderColor} relative min-h-[380px] hover:transform hover:translate-y-[-4px] hover:shadow-lg transition-all duration-300 hover:border-[#33d6e2]`}>
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
        <Button  
          size="md"
          variant="solid"
          colorScheme="brand"
          h="50px"
          minH="50px"
          w="220px"
          px="24px"
          onClick={() => payStripeSubscription(plan.priceId, plan.name)} 
          className={`absolute bottom-6 left-6 right-6 ${
            (processingPlan === plan.priceId || (planData?.SubscriptionPlan && planData.SubscriptionPlan.planId === plan.id)) 
              ? 'cursor-not-allowed opacity-50' 
              : 'cursor-pointer'
          }`}
          disabled={processingPlan === plan.priceId || planData?.SubscriptionPlan && planData.SubscriptionPlan.planId === plan.id}
        >
          { planData?.SubscriptionPlan && planData.SubscriptionPlan.planId === plan.id ?
          'Current Plan' 
          :
          <>
          { processingPlan === plan.priceId ? 'Processing Payment...' : 'Upgrade Now'}
          </>
        }
        </Button>
      </div>
      ))
    }            
                </div>
              ) : (
                <div className="flex flex-col md:flex-row p-4 md:p-6 gap-4">
    { filteredPlansLifetime &&
      filteredPlansLifetime.map((plan: {id: number; name: string; productId: string; priceId: string; price: number; features: string, currency: string}) => (
      <div key={plan.id} className={`${bgColor} rounded-lg flex-1 p-6 border ${borderColor} relative min-h-[380px] hover:transform hover:translate-y-[-4px] hover:shadow-lg transition-all duration-300 hover:border-[#33d6e2]`}>
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
       <Button  
        size="md"
        variant="solid"
        colorScheme="brand"
        h="50px"
        minH="50px"
        w="220px"
        px="24px"
          onClick={() => payStripeLifetime(plan.priceId, plan.name)} 
          className={`absolute bottom-6 left-6 right-6 ${
            (processingPlan === plan.priceId || (planData?.LifetimePlan && planData.LifetimePlan.planId === plan.id)) 
              ? 'cursor-not-allowed opacity-50' 
              : 'cursor-pointer'
          }`}
          disabled={processingPlan === plan.priceId || (planData?.LifetimePlan && planData.LifetimePlan.planId === plan.id)}
        >
          { processingPlan === plan.priceId ? 'Processing Payment...' : 'Upgrade Now'}
        </Button>
      </div>
      ))
    }
                </div>
              )}
            </div>
          </Section>
      }
    </>
  );
};
