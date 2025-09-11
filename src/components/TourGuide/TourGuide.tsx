"use client";

import React, { useState, useEffect } from 'react';
import Joyride, { CallBackProps, STATUS, EVENTS, Step } from 'react-joyride';
import { Button } from '@chakra-ui/react';
import { useSession } from 'next-auth/react';
import { TourStatusResponse } from '@/app/api/user/tours/route';

export interface TourStep extends Step {
  target: string;
  content: string;
  title?: string;
  placement?: 'top' | 'bottom' | 'left' | 'right' | 'center' | 'auto';
  disableBeacon?: boolean;
  onNext?: () => void; // Callback for when "Next" is clicked on this step
}

interface TourGuideProps {
  steps: TourStep[];
  run: boolean;
  onTourComplete?: () => void;
  onTourSkip?: () => void;
  tourKey?: string;
}

export const TourGuide: React.FC<TourGuideProps> = ({
  steps,
  run,
  onTourComplete,
  onTourSkip,
  tourKey = 'default'
}) => {
  const [tourState, setTourState] = useState({
    run: false,
    stepIndex: 0,
  });

  useEffect(() => {
    if (run) {
      setTourState({ run: true, stepIndex: 0 });
    }
  }, [run]);

  const handleJoyrideCallback = (data: CallBackProps) => {
    const { status, type, index, action } = data;

    if (type === EVENTS.STEP_AFTER || type === EVENTS.TARGET_NOT_FOUND) {
      // Execute onNext callback if it exists for the current step
      if (type === EVENTS.STEP_AFTER && steps[index]?.onNext && action === 'next') {
        steps[index].onNext?.();
      }
      
      setTourState((prev) => ({
        ...prev,
        stepIndex: index + (type === EVENTS.STEP_AFTER ? 1 : 0),
      }));
    } else if (status === STATUS.FINISHED || status === STATUS.SKIPPED || action === 'close') {
      setTourState({ run: false, stepIndex: 0 });
      
      if (status === STATUS.FINISHED) {
        if (onTourComplete) {
          onTourComplete();
        }
      } else if (status === STATUS.SKIPPED || action === 'close') {
        // Handle both skip button and close button (X) as skip
        if (onTourSkip) {
          onTourSkip();
        }
      }
    }
  };

  // Determine if we should show "Next" instead of "Finish" for the last step
  const isLastStepWithNext = tourKey === 'dashboard' && tourState.stepIndex === steps.length - 1;

  return (
    <Joyride
      callback={handleJoyrideCallback}
      continuous
      hideCloseButton={false}
      run={tourState.run}
      scrollToFirstStep
      showProgress
      showSkipButton={false}
      stepIndex={tourState.stepIndex}
      steps={steps}
      styles={{
        options: {
          arrowColor: '#fff',
          backgroundColor: '#fff',
          overlayColor: 'rgba(0, 0, 0, 0.5)',
          primaryColor: '#3182ce',
          textColor: '#333',
          width: 350,
          zIndex: 1000,
        },
        tooltip: {
          borderRadius: 8,
          padding: 20,
        },
        tooltipContainer: {
          textAlign: 'left',
        },
        tooltipTitle: {
          fontSize: '18px',
          fontWeight: 600,
          marginBottom: '10px',
          color: '#1a202c',
        },
        tooltipContent: {
          fontSize: '14px',
          lineHeight: '1.5',
          color: '#4a5568',
        },
        buttonNext: {
          backgroundColor: '#3182ce',
          borderRadius: '6px',
          color: '#fff',
          fontSize: '14px',
          padding: '8px 16px',
          border: 'none',
          cursor: 'pointer',
        },
        buttonBack: {
          color: '#3182ce',
          marginRight: '10px',
          fontSize: '14px',
          padding: '8px 16px',
          border: '1px solid #3182ce',
          borderRadius: '6px',
          backgroundColor: 'transparent',
          cursor: 'pointer',
        },
        buttonSkip: {
          color: '#718096',
          fontSize: '14px',
          padding: '8px 16px',
          border: 'none',
          backgroundColor: 'transparent',
          cursor: 'pointer',
        },
      }}
      locale={{
        back: 'Back',
        close: 'Close',
        last: isLastStepWithNext ? 'Next' : 'Finish',
        next: 'Next',
        skip: 'Skip Tour',
      }}
    />
  );
};

// Hook to check if a tour has been completed
export const useTourStatus = (tourKey: string) => {
  const { data: session, status: sessionStatus } = useSession();
  const [hasCompletedTour, setHasCompletedTour] = useState(false);
  const [hasSkippedTour, setHasSkippedTour] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch tour status from API
  const fetchTourStatus = async () => {
    if (!session?.user) return;
    
    try {
      const response = await fetch(`/api/user/tours?tourKey=${tourKey}`);
      if (response.ok) {
        const data: TourStatusResponse = await response.json();
        setHasCompletedTour(data.completed);
        setHasSkippedTour(data.skipped);
      } else {
        // Fallback to localStorage for backward compatibility
        const completed = localStorage.getItem(`tour-completed-${tourKey}`) === 'true';
        const skipped = localStorage.getItem(`tour-skipped-${tourKey}`) === 'true';
        setHasCompletedTour(completed);
        setHasSkippedTour(skipped);
        
        // Migrate localStorage data to database
        if (completed || skipped) {
          await markTourComplete(completed, skipped);
        }
      }
    } catch (error) {
      console.error('Error fetching tour status:', error);
      // Fallback to localStorage
      const completed = localStorage.getItem(`tour-completed-${tourKey}`) === 'true';
      const skipped = localStorage.getItem(`tour-skipped-${tourKey}`) === 'true';
      setHasCompletedTour(completed);
      setHasSkippedTour(skipped);
    } finally {
      setIsLoading(false);
    }
  };

  // Mark tour as complete/skipped
  const markTourComplete = async (completed: boolean, skipped: boolean = false) => {
    if (!session?.user) {
      // Fallback to localStorage if not authenticated
      localStorage.setItem(`tour-completed-${tourKey}`, completed.toString());
      if (skipped) {
        localStorage.setItem(`tour-skipped-${tourKey}`, 'true');
      }
      setHasCompletedTour(completed);
      setHasSkippedTour(skipped);
      return;
    }

    try {
      const response = await fetch('/api/user/tours', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tourKey,
          completed,
          skipped,
        }),
      });

      if (response.ok) {
        const data: TourStatusResponse = await response.json();
        setHasCompletedTour(data.completed);
        setHasSkippedTour(data.skipped);
        
        // Clean up localStorage after successful API call
        localStorage.removeItem(`tour-completed-${tourKey}`);
        localStorage.removeItem(`tour-skipped-${tourKey}`);
      } else {
        // Fallback to localStorage
        localStorage.setItem(`tour-completed-${tourKey}`, completed.toString());
        if (skipped) {
          localStorage.setItem(`tour-skipped-${tourKey}`, 'true');
        }
        setHasCompletedTour(completed);
        setHasSkippedTour(skipped);
      }
    } catch (error) {
      console.error('Error updating tour status:', error);
      // Fallback to localStorage
      localStorage.setItem(`tour-completed-${tourKey}`, completed.toString());
      if (skipped) {
        localStorage.setItem(`tour-skipped-${tourKey}`, 'true');
      }
      setHasCompletedTour(completed);
      setHasSkippedTour(skipped);
    }
  };

  useEffect(() => {
    if (sessionStatus === 'loading') return;
    fetchTourStatus();
  }, [session, sessionStatus, tourKey]);

  const resetTour = async () => {
    await markTourComplete(false, false);
  };

  return {
    hasCompletedTour,
    hasSkippedTour,
    shouldShowTour: !hasCompletedTour && !hasSkippedTour && !isLoading,
    isLoading,
    resetTour,
    markTourComplete,
  };
};

// Tour trigger button component
interface TourTriggerProps {
  onStartTour: () => void;
  children?: React.ReactNode;
  className?: string;
}

export const TourTrigger: React.FC<TourTriggerProps> = ({
  onStartTour,
  children,
  className = "",
}) => {
  return (
    <Button
      onClick={onStartTour}
      size="sm"
      colorScheme="blue"
      variant="outline"
      className={className}
    >
      {children || "🎯 Take Tour"}
    </Button>
  );
}; 