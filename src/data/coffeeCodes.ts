import { LetterCategory, FlavorCategory } from '../types';

export const letterCategories: LetterCategory[] = [
  {
    letter: 'D',
    englishTitle: 'D For Dark Roast',
    chineseTitle: '深烘系列',
    description: '在醇厚的深烘处理法之上,我们希望尝试更细腻的表达。由此,我们选取本身干净度和酸质突出的豆子进行深度烘焙,在焦糖化过程中增加甜感,在醇厚之上增加更多风味细节。',
    backgroundColor: '#FF6B35', // Orange
    textColor: '#FFFFFF',
  },
  {
    letter: 'L',
    englishTitle: 'L For Light Roast',
    chineseTitle: '浅烘系列',
    description: '浅度烘焙能最大程度保留咖啡作为一种水果作物原本的风味特点。我们精心挑选经典产区中最具代表性的咖啡豆,以传达其独特的风味特征。',
    backgroundColor: '#D4E157', // Light yellow/lime green
    textColor: '#000000',
  },
  {
    letter: 'S',
    englishTitle: 'S For Special Process',
    chineseTitle: '特殊系列',
    description: '特殊处理法就像一只「上帝之手」,通过介入发酵过程,让咖啡豆突破自身限制,发展出超乎想象的味道。我们只选取品质最高的特殊处理咖啡豆,除了有明确的风味指向,也能保持一支咖啡豆本身的自然之美。',
    backgroundColor: '#1565C0', // Dark blue
    textColor: '#FFFFFF',
  },
  {
    letter: 'W',
    englishTitle: 'W For Winning Batch',
    chineseTitle: '竞标批次',
    description: '在这个系列,我们只选取包括 CoE 在内的、来自世界各地的竞标获奖咖啡豆,以微小批次发行,它们代表各自产区和产季中的最高水平。',
    backgroundColor: '#757575', // Grey
    textColor: '#FFFFFF',
  },
  {
    letter: 'C',
    englishTitle: 'C For China',
    chineseTitle: '中国系列',
    description: 'C 系列,是我们引以为傲的中国产区咖啡豆。它们代表了中国咖啡产业在精品领域的新发展,亦铺垫了东方味型在咖啡风味中的可能。',
    backgroundColor: '#8B0000', // Dark red
    textColor: '#FFFFFF',
  },
];

export const flavorCategories: FlavorCategory[] = [
  {
    number: 1,
    chineseName: '浆果/莓果类',
    englishName: 'Berries/Berry',
  },
  {
    number: 2,
    chineseName: '花香类',
    englishName: 'Floral',
  },
  {
    number: 3,
    chineseName: '柑橘类',
    englishName: 'Citrus',
  },
  {
    number: 4,
    chineseName: '温/热带水果类',
    englishName: 'Temperate/Tropical Fruit',
  },
  {
    number: 5,
    chineseName: '甜香类',
    englishName: 'Sweet',
  },
  {
    number: 6,
    chineseName: '坚果/可可类',
    englishName: 'Nut/Cocoa',
  },
  {
    number: 7,
    chineseName: '香料/草本类',
    englishName: 'Spice/Herbal',
  },
  {
    number: 8,
    chineseName: '茶香类',
    englishName: 'Tea',
  },
  {
    number: 9,
    chineseName: '发酵/酒香类',
    englishName: 'Fermented/Wine',
  },
];

// Helper functions
export function getLetterCategory(letter: string): LetterCategory | undefined {
  return letterCategories.find((cat) => cat.letter === letter);
}

export function getFlavorCategory(number: number): FlavorCategory | undefined {
  return flavorCategories.find((cat) => cat.number === number);
}

