import { TourStep } from '../TourGuide';

export const articleGeneratorTourSteps: TourStep[] = [
  {
    target: '[data-tour="article-mode"]',
    content: 'Select *God Mode* for Top Notch SEO Articles and *Lite Mode* for quick content perfect for guest posts and simple articles.',
    title: 'Choose Your Article Quality',
    placement: 'bottom',
    disableBeacon: true,
  },
  {
    target: '[data-tour="keyword-input"]',
    content: 'Add up to 10 keywords, one per line.\nEach keyword will generate a separate article.',
    title: 'Enter Keywords',
    placement: 'bottom',
  },
  {
    target: 'body',
    content: 'Looks like you\'re ready to go 🎉',
    title: 'That\'s everything',
    placement: 'center',
  },
];

// Alternative tour steps for when God Mode is active (includes advanced settings)
export const articleGeneratorGodModeTourSteps: TourStep[] = [
  {
    target: '[data-tour="article-mode"]',
    content: 'Select *God Mode* for Top Notch SEO Articles and *Lite Mode* for quick content perfect for guest posts and simple articles.',
    title: 'Choose Your Article Quality',
    placement: 'bottom',
    disableBeacon: true,
  },
  {
    target: '[data-tour="advanced-settings"]',
    content: 'Adjust advanced options like Word Limit, Images, Brand Mentions, and more!',
    title: 'Customize Your Article Output',
    placement: 'left',
  },
  {
    target: '[data-tour="keyword-input"]',
    content: 'Add up to 10 keywords, one per line.\nEach keyword will generate a separate article.',
    title: 'Enter Keywords',
    placement: 'bottom',
  },
  {
    target: 'body',
    content: 'Looks like you\'re ready to go 🎉',
    title: 'That\'s everything',
    placement: 'center',
  },
];

export const articleGeneratorTourConfig = {
  tourKey: 'article-generator',
  steps: articleGeneratorTourSteps,
}; 