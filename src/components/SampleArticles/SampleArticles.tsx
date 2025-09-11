"use client";

import { Heading } from "@chakra-ui/react";
import Link from "next/link";
import React, { useEffect, useState } from "react";

interface Article {
  id: string;
  title: string;
  description: string;
  slug: string;
  ogImageUrl?: string;
  date: string;
}

const SampleArticles = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSampleArticles = async () => {
      try {
        const response = await fetch('/api/sample-articles');
        if (response.ok) {
          const data = await response.json();
          setArticles(data.articles);
        } else {
          console.error('Failed to fetch sample articles');
        }
      } catch (error) {
        console.error('Error fetching sample articles:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSampleArticles();
  }, []);

  // Fallback articles if no articles are found or while loading
  const fallbackArticles = [
    {
      id: '1',
      title: 'Best Dog Toys for Every Size and Play Style',
      slug: 'best-dog-toys',
      ogImageUrl: '/images/well-researched.png'
    },
    {
      id: '2', 
      title: '5 Best Restaurants in Italy: Top Culinary Destinations for 2025',
      slug: 'best-restaurants-italy',
      ogImageUrl: '/images/well-researched.png'
    },
    {
      id: '3',
      title: 'Cranberry Juice Heartburn: Causes, Risks, and Relief Tips',
      slug: 'cranberry-juice-heartburn',
      ogImageUrl: '/images/well-researched.png'
    }
  ];

  const displayArticles = articles.length > 0 ? articles : fallbackArticles;

  return (
    <section className="w-full pt-20 pb-7 flex flex-col items-center">
      <Heading as="h4" fontSize="16px" color="brand.400" mb="16px">
       Blog
      </Heading>
      <Heading
            as="h2"
            fontSize={["26px", "40px", "48px"]}
            lineHeight={["32px", "48px", "56px"]}
            mb="32px"
            fontWeight="extrabold"
            textAlign="center"
      >
          Sample Articles
      </Heading>
      <p className="text-lg text-center text-gray-300 mb-12 max-w-2xl text-slate-500">Below are some sample articles created by WhoNeedsaWriter</p>
      <div className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-3 gap-8">
        {displayArticles.map((article, index) => (
          <div key={article.id} className="relative rounded-2xl overflow-hidden shadow-lg bg-card">
            <img 
              src={article.ogImageUrl || `/images/well-researched.png`} 
              alt={article.title} 
              className="w-full h-72 object-cover" 
            />
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6">
              <h3 className="text-2xl font-semibold text-white"><Link href={`/blog/${article.slug}`} target="_blank">{article.title}</Link></h3>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default SampleArticles; 