import { useQuery } from '@tanstack/react-query';
import { getCoffeeProduct } from '../data/coffeeProducts';
import { CoffeeProduct } from '../types';

// Simulate async data fetch (in real app, this could be an API call)
async function fetchCoffeeProduct(code: string): Promise<CoffeeProduct | null> {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 100));
  return getCoffeeProduct(code) || null;
}

export function useCoffeeProduct(code: string | null) {
  return useQuery<CoffeeProduct | null>({
    queryKey: ['coffeeProduct', code],
    queryFn: () => fetchCoffeeProduct(code!),
    enabled: !!code,
    staleTime: 1000 * 60 * 60, // 1 hour
  });
}

