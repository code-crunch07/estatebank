import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

// Mock API functions - Replace with actual API calls
export const useProperties = () => {
  return useQuery({
    queryKey: ["properties"],
    queryFn: async () => {
      // Replace with actual API call
      return [];
    },
  });
};

export const useLeads = () => {
  return useQuery({
    queryKey: ["leads"],
    queryFn: async () => {
      return [];
    },
  });
};

export const useClients = () => {
  return useQuery({
    queryKey: ["clients"],
    queryFn: async () => {
      return [];
    },
  });
};

