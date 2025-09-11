"use client";

import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { UserPlanStatusResponse } from "@/app/api/user-plan-status/route";
import { TbCrown } from "react-icons/tb";

export const PlanStatus = () => {
  
  const { data: planData, isLoading } = useQuery({
    queryFn: () => {
      return axios.get<UserPlanStatusResponse>("/api/user-plan-status");
    },
    queryKey: ["user-plan-status"],
  });

  if (isLoading) {
    return (
      <div className="flex items-center space-x-2">
        <div className="animate-pulse bg-gray-200 h-6 w-20 rounded"></div>
      </div>
    );
  }

  const plan = planData?.data;
  if (!plan) return null;

  const getPlanColor = (planName: string) => {
    switch (planName) {
      case "Ultimate":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "Premium":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "Pro":
        return "bg-green-100 text-green-800 border-green-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getPlanIcon = (planName: string) => {
    if (planName !== "Free") {
      return <TbCrown className="h-4 w-4" />;
    }
    return null;
  };

  const getGodModeLimit = (planName: string) => {
    switch (planName) {
      case "Pro": return 10;
      case "Premium": return 30;
      case "Ultimate": return 100;
      default: return 0;
    }
  };

  const getLiteModeLimit = (planName: string) => {
    switch (planName) {
      case "Pro": return 100;
      case "Premium": return 150;
      case "Ultimate": return 300;
      default: return 0;
    }
  };

  return (
    <div className="space-y-1">
      <div className="flex items-center space-x-2">
        <div className={`px-3 py-1 rounded-full border text-sm font-medium flex items-center space-x-1 ${getPlanColor(plan.planName)}`}>
          {getPlanIcon(plan.planName)}
          <span>Current Plan: {plan.planName}</span>
        </div>
      </div>
      {plan.planName !== "Free" && (
        <div className="flex items-center space-x-3 text-xs text-foreground">
          <span>God Mode: {getGodModeLimit(plan.planName)}</span>
          <span className="opacity-75">|</span>
          <span>Lite Mode: {getLiteModeLimit(plan.planName)}</span>
        </div>
      )}
    </div>
  );
};
