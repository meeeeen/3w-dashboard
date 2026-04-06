"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { Profile } from "@/types/database";
import { SEED_MEMBERS } from "@/data/members";

const STORAGE_KEY = "3w-dashboard-members";
const SEED_VERSION_KEY = "3w-dashboard-members-version";
const CURRENT_SEED_VERSION = "1";

function getStoredMembers(): Profile[] {
  if (typeof window === "undefined") return SEED_MEMBERS;
  const storedVersion = localStorage.getItem(SEED_VERSION_KEY);
  if (storedVersion !== CURRENT_SEED_VERSION) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(SEED_MEMBERS));
    localStorage.setItem(SEED_VERSION_KEY, CURRENT_SEED_VERSION);
    return SEED_MEMBERS;
  }
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(SEED_MEMBERS));
    return SEED_MEMBERS;
  }
  return JSON.parse(stored);
}

function saveMembers(members: Profile[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(members));
}

export function useMembers() {
  return useQuery<Profile[]>({
    queryKey: ["members"],
    queryFn: () => getStoredMembers(),
  });
}

export function useMember(id: string) {
  return useQuery<Profile | undefined>({
    queryKey: ["members", id],
    queryFn: () => getStoredMembers().find((m) => m.id === id),
  });
}

export function useAddMember() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: Omit<Profile, "id" | "created_at">) => {
      const members = getStoredMembers();
      const newMember: Profile = {
        ...data,
        id: crypto.randomUUID(),
        created_at: new Date().toISOString(),
      };
      members.push(newMember);
      saveMembers(members);
      return newMember;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["members"] });
    },
  });
}

export function useDeleteMember() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const members = getStoredMembers().filter((m) => m.id !== id);
      saveMembers(members);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["members"] });
    },
  });
}
