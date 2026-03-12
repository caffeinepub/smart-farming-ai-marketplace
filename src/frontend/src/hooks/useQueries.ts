import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { UserRole } from "../backend.d";
import { useActor } from "./useActor";

export function useMyProfile() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["myProfile"],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getMyProfile();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useCreateProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      name: string;
      phone: string;
      location: string;
      farmSize: string;
      farmType: string;
      bio: string | null;
      role: UserRole;
    }) => {
      if (!actor) throw new Error("Not connected");
      await actor.createProfile(
        data.name,
        data.phone,
        data.location,
        data.farmSize,
        data.farmType,
        data.bio,
        data.role,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["myProfile"] });
    },
  });
}

export function useUpdateProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      name: string;
      phone: string;
      location: string;
      farmSize: string;
      farmType: string;
      bio: string | null;
    }) => {
      if (!actor) throw new Error("Not connected");
      await actor.updateProfile(
        data.name,
        data.phone,
        data.location,
        data.farmSize,
        data.farmType,
        data.bio,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["myProfile"] });
    },
  });
}

export function useAllUsers() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["allUsers"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllUsers();
    },
    enabled: !!actor && !isFetching,
  });
}
