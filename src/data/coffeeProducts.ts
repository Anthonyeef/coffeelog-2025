import { CoffeeProduct } from '../types';

export const coffeeProducts: CoffeeProduct[] = [
  {
    code: 'L23',
    chineseName: '埃塞俄比亚 古吉',
    englishName: 'Ethiopia Guji',
    letter: 'L',
    number1: 2,
    number2: 3,
  },
  // Add more products as needed
];

// Helper function to get product by code
export function getCoffeeProduct(code: string): CoffeeProduct | undefined {
  return coffeeProducts.find((product) => product.code === code);
}

