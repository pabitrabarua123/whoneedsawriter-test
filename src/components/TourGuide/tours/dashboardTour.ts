import { TourStep } from '../TourGuide';

export const createDashboardTourSteps = (router: any): TourStep[] => [
  {
    target: 'body',
    content: 'Let\'s take a quick tour so you can get the most out of your dashboard.',
    title: 'Welcome to Who Needs a Writer! 🎉',
    placement: 'center',
    disableBeacon: true,
  },
  {
    target: '[data-tour="godmode-card"],[data-tour="litemode-card"]',
    content: 'Head here to start generating new content!',
    title: 'Ready to write?',
    placement: 'bottom',
    onNext: () => {
      router.push('/article-generator');
    },
  },
];

export const createDashboardTourConfig = (router: any) => ({
  tourKey: 'dashboard',
  steps: createDashboardTourSteps(router),
});

// Legacy exports for backward compatibility
export const dashboardTourSteps: TourStep[] = [];
export const dashboardTourConfig = {
  tourKey: 'dashboard',
  steps: dashboardTourSteps,
}; 