import { useQuery } from '@tanstack/react-query';
import { letterCategories, flavorCategories } from '../data/coffeeCodes';
import { LetterCategory, FlavorCategory } from '../types';

interface CoffeeCodesData {
  letterCategories: LetterCategory[];
  flavorCategories: FlavorCategory[];
}

// Simulate async data fetch (in real app, this could be an API call)
async function fetchCoffeeCodes(): Promise<CoffeeCodesData> {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 100));
  return {
    letterCategories,
    flavorCategories,
  };
}

export function useCoffeeCodes() {
  return useQuery<CoffeeCodesData>({
    queryKey: ['coffeeCodes'],
    queryFn: fetchCoffeeCodes,
    staleTime: 1000 * 60 * 60, // 1 hour
  });
}

