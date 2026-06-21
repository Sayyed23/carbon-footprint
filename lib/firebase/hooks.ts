"use client";

import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { 
  subscribeToActivities, 
  subscribeToDailySummaries, 
  subscribeToWeeklySummaries, 
  getActivities,
  Activity,
  DailySummary,
  WeeklySummary 
} from "./db";

/**
 * Custom hook to query and subscribe to activities live from Firestore,
 * keeping the TanStack Query cache in perfect sync.
 */
export function useUserActivities(userId: string | undefined, startDate?: Date, endDate?: Date) {
  const queryClient = useQueryClient();
  
  // Date range keys represented in ISO string for cache key serialization
  const dateKey = `${startDate?.toISOString() || "all"}_${endDate?.toISOString() || "all"}`;
  const queryKey = ["activities", userId, dateKey];

  const query = useQuery<Activity[]>({
    queryKey,
    queryFn: () => (userId ? getActivities(userId, startDate, endDate) : Promise.resolve([])),
    enabled: !!userId,
  });

  useEffect(() => {
    if (!userId) return;

    // Subscribe to Firestore updates
    const unsubscribe = subscribeToActivities(userId, startDate, endDate, (updatedActivities) => {
      // Direct cache update bypassing refetching overhead
      queryClient.setQueryData(queryKey, updatedActivities);
    });

    return () => unsubscribe();
  }, [userId, startDate, endDate, queryClient, dateKey]);

  return query;
}

/**
 * Custom hook to subscribe to daily summaries live from Firestore.
 */
export function useUserDailySummaries(userId: string | undefined) {
  const queryClient = useQueryClient();
  const queryKey = ["dailySummaries", userId];

  const query = useQuery<DailySummary[]>({
    queryKey,
    queryFn: () => Promise.resolve([]), // initially empty, hydrated by subscribe
    enabled: !!userId,
  });

  useEffect(() => {
    if (!userId) return;

    const unsubscribe = subscribeToDailySummaries(userId, (updatedSummaries) => {
      queryClient.setQueryData(queryKey, updatedSummaries);
    });

    return () => unsubscribe();
  }, [userId, queryClient]);

  return query;
}

/**
 * Custom hook to subscribe to weekly summaries live from Firestore.
 */
export function useUserWeeklySummaries(userId: string | undefined) {
  const queryClient = useQueryClient();
  const queryKey = ["weeklySummaries", userId];

  const query = useQuery<WeeklySummary[]>({
    queryKey,
    queryFn: () => Promise.resolve([]), // initially empty, hydrated by subscribe
    enabled: !!userId,
  });

  useEffect(() => {
    if (!userId) return;

    const unsubscribe = subscribeToWeeklySummaries(userId, (updatedSummaries) => {
      queryClient.setQueryData(queryKey, updatedSummaries);
    });

    return () => unsubscribe();
  }, [userId, queryClient]);

  return query;
}
