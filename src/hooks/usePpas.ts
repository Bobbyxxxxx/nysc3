import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../lib/supabase";
// Types matching your database structure
export interface NewReviewInput {
  ppaId: string;
  author: string;
  batch: string;
  rating: number;
  text: string;
  stipend: string;
  paymentStatus: string;
  tags: string[];
}

// -------------------------------------------------------------
// STEP 2: Query Hook (Fetch Single PPA with Nested Reviews)
// -------------------------------------------------------------
export function usePpaDetails(ppaId: string) {
  return useQuery({
    queryKey: ["ppa", ppaId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ppas")
        .select(
          `
          *,
          reviews (*)
        `,
        )
        .eq("id", ppaId)
        .single();

      if (error) throw new Error(error.message);
      return data;
    },
    enabled: Boolean(ppaId), // Only run query if ppaId is provided
  });
}

// -------------------------------------------------------------
// STEP 3: Mutation Hook (Submit New Review)
// -------------------------------------------------------------
export function useAddReview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (review: NewReviewInput) => {
      const { data, error } = await supabase
        .from("reviews")
        .insert([
          {
            ppa_id: review.ppaId,
            author: review.author || "Anonymous",
            batch: review.batch,
            rating: review.rating,
            text: review.text,
            stipend: review.stipend,
            payment_status: review.paymentStatus,
            tags: review.tags,
          },
        ])
        .select();

      if (error) throw new Error(error.message);
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["ppas"] });
      queryClient.invalidateQueries({ queryKey: ["ppa", variables.ppaId] });
    },
  });
}
