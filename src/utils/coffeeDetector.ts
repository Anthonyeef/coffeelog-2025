import { Transaction, CoffeeTransaction } from '../types'

/**
 * Coffee-related keywords for matching
 */
const COFFEE_KEYWORDS = {
  english: [
    'coffee',
    'starbucks',
    'luckin',
    'manner',
    'grid coffee',
    'cafe',
    'café',
    'espresso',
    'latte',
    'cappuccino',
    'americano',
    'mocha',
    'frappuccino',
    'coffee shop',
    'coffeehouse',
    'barista',
  ],
  chinese: [
    '咖啡',
    '星巴克',
    '瑞幸',
    'luckin',
    'manner',
    'Manner',
    'Grid Coffee',
    'grid coffee',
    '咖啡馆',
    '咖啡店',
    '咖啡厅',
    '咖啡吧',
    '手冲咖啡',
    '精品咖啡',
    '意式咖啡',
    '美式咖啡',
    '拿铁',
    '卡布奇诺',
    '摩卡',
    '浓缩咖啡',
    '咖啡豆',
    '咖啡机',
  ],
  merchantNames: [
    'starbucks',
    '星巴克',
    'luckin',
    '瑞幸',
    'manner',
    'Manner',
    'mannercoffee',
    'grid coffee',
    'Grid Coffee',
    'coffee',
    '咖啡',
    '北京茵赫餐饮管理有限公司',
    '茵赫', // Manner Coffee official company name
    '豆子咖啡实验室',
    '豆仔', // 豆仔 coffee shop
    '白鲸咖啡',
    '白鲸', // 白鲸咖啡 (White Whale Coffee) - bean roaster
    'the common cup',
    'common cup', // The Common Cup coffee shop
    'cup', // Common word in coffee shop names
    '余温', // 余温 coffee shop
  ],
}

/**
 * Check if a transaction is coffee-related
 */
export function detectCoffee(transaction: Transaction): CoffeeTransaction {
  const merchant = transaction.merchant || ''
  const merchantLower = merchant.toLowerCase()
  const description = (transaction.description || '').toLowerCase()
  const account = (transaction.account || '').toLowerCase() // Also check account field
  
  const matchedKeywords: string[] = []
  let confidence = 0
  
  // Check merchant name (handle both Chinese and English)
  // But exclude restaurants/bars that just happen to have "咖啡" in the name
  const isRestaurantOrBar = merchant.includes('餐吧') || merchant.includes('餐厅') || 
                            merchant.includes('饭店') || merchant.includes('餐馆') ||
                            merchant.includes('精酿') || merchant.includes('bar') ||
                            merchant.includes('restaurant') || merchant.includes('bistro')
  
  for (const keyword of COFFEE_KEYWORDS.merchantNames) {
    // For Chinese keywords, check original case; for English, check lowercase
    const merchantToCheck = /[\u4e00-\u9fa5]/.test(keyword) ? merchant : merchantLower
    const keywordToCheck = /[\u4e00-\u9fa5]/.test(keyword) ? keyword : keyword.toLowerCase()
    
    if (merchantToCheck.includes(keywordToCheck)) {
      // If merchant is a restaurant/bar and only matched "咖啡" in name, 
      // require coffee-related terms in description to confirm it's a coffee purchase
      if (isRestaurantOrBar && keyword === '咖啡' && !description.includes('咖啡') && 
          !description.includes('coffee') && !description.includes('拿铁') && 
          !description.includes('latte') && !description.includes('美式') &&
          !description.includes('americano') && !description.includes('卡布') &&
          !description.includes('cappuccino') && !description.includes('espresso')) {
        // Skip this match - it's likely not a coffee purchase
        continue
      }
      matchedKeywords.push(keyword)
      confidence += 0.8 // High confidence for merchant match
      break
    }
  }
  
  // Check account field for coffee-related domains/emails (e.g., mannercoffee.com.cn)
  if (account.includes('mannercoffee') || account.includes('starbucks') || account.includes('luckin') || account.includes('coffee')) {
    if (!matchedKeywords.some(k => k.toLowerCase().includes('manner') || k.toLowerCase().includes('coffee'))) {
      matchedKeywords.push('account-domain')
      confidence += 0.9 // High confidence for domain match
    }
  }
  
  // Check English keywords in merchant, description, and account
  for (const keyword of COFFEE_KEYWORDS.english) {
    const keywordLower = keyword.toLowerCase()
    if (merchantLower.includes(keywordLower) || description.includes(keywordLower) || account.includes(keywordLower)) {
      if (!matchedKeywords.includes(keyword)) {
        matchedKeywords.push(keyword)
        confidence += 0.6
      }
    }
  }
  
  // Check Chinese keywords in merchant, description, and account
  for (const keyword of COFFEE_KEYWORDS.chinese) {
    // Skip if merchant is a restaurant/bar and only "咖啡" appears in merchant name without coffee terms in description
    if (keyword === '咖啡' && isRestaurantOrBar && merchant.includes('咖啡') && 
        !description.includes('咖啡') && !description.includes('coffee') && 
        !description.includes('拿铁') && !description.includes('latte') && 
        !description.includes('美式') && !description.includes('americano') && 
        !description.includes('卡布') && !description.includes('cappuccino') && 
        !description.includes('espresso')) {
      continue // Skip this match
    }
    
    if (merchant.includes(keyword) || description.includes(keyword) || account.includes(keyword)) {
      if (!matchedKeywords.includes(keyword)) {
        matchedKeywords.push(keyword)
        confidence += 0.7
      }
    }
  }
  
  // Exclude coffee-flavored food items (cookies, cakes, ice cream, etc.)
  // These are not actual coffee purchases
  const foodItemKeywords = [
    '曲奇', 'cookie', 'cookies', '饼干', 'biscuit',
    '蛋糕', 'cake', '甜品', 'dessert',
    '冰淇淋', 'ice cream', 'gelato',
    '面包', 'bread', 'bakery',
    '巧克力', 'chocolate', 'candy', '糖果',
    '糖', 'sugar', 'sweet'
  ]
  
  const isFoodItem = foodItemKeywords.some(food => 
    description.includes(food) || merchant.includes(food)
  )
  
  // If it's a food item and only matched "咖啡" as a flavor, exclude it
  // But allow if merchant is clearly a coffee shop (high confidence merchant match)
  if (isFoodItem && confidence < 0.8 && matchedKeywords.length === 1 && matchedKeywords[0] === '咖啡') {
    confidence = 0 // Exclude coffee-flavored food items
  }
  
  // Normalize confidence to 0-1 range
  confidence = Math.min(confidence, 1.0)
  
  // Consider it coffee if confidence > 0.5
  const isCoffee = confidence > 0.5
  
  // Detect coffee beans purchases
  const beanKeywords = [
    '咖啡豆', 'bean', 'beans', 'whole bean', 'whole beans',
    'ground coffee', '咖啡粉', '烘焙', 'roast', 'roasted',
    '手冲', 'pour over', 'soe', '拼配', 'blend', '单品',
    'kg', '100g', '250g', '500g', '454g', '60g', 'g/', 'g ', // Weight measurements only
    '瑰夏', 'geisha', '耶加', 'yirgacheffe', '埃塞', 'ethiopia',
    '庄园', 'estate', '水洗', 'washed', '日晒', 'natural',
    '浅烘', 'light roast', '中烘', 'medium roast', '深烘', 'dark roast'
  ]
  
  // 白鲸咖啡 is a bean roaster, so all their transactions are beans
  const isBaijing = merchant.includes('白鲸') || description.includes('白鲸')
  
  const allText = (merchant + ' ' + description + ' ' + account).toLowerCase()
  
  // Check for "豆" (bean) keyword - must be part of "咖啡豆" or standalone "豆" but not just "咖啡"
  // Exclude "豆" when it's part of cafe names like "豆子咖啡实验室" (DOzzZE豆仔), "豆仔", etc.
  const isCafeWithBeanInName = merchant.includes('豆子咖啡实验室') || merchant.includes('豆仔') || 
                               merchant.includes('DOzzZE') || merchant.includes('咖啡实验室') ||
                               description.includes('豆子咖啡实验室') || description.includes('豆仔') ||
                               description.includes('DOzzZE') || description.includes('咖啡实验室')
  
  // Exclude "咖啡豆" when it's part of a shop/cafe name (e.g., "咖啡豆买手店", "咖啡豆店", "咖啡豆馆")
  // Only consider it beans if it's an actual product description
  const isCoffeeBeanShop = (merchant.includes('咖啡豆买手店') || merchant.includes('咖啡豆店') || 
                            merchant.includes('咖啡豆馆') || merchant.includes('咖啡豆馆') ||
                            description.includes('咖啡豆买手店') || description.includes('咖啡豆店') ||
                            description.includes('咖啡豆馆'))
  
  const hasBeanKeyword = (!isCoffeeBeanShop && (description.includes('咖啡豆') || merchant.includes('咖啡豆'))) ||
                         (description.includes('豆') && !description.includes('咖啡店') && !description.includes('咖啡厅') && !description.includes('咖啡·') && !isCafeWithBeanInName) ||
                         (merchant.includes('豆') && !merchant.includes('咖啡店') && !merchant.includes('咖啡厅') && !isCafeWithBeanInName)
  
  // Exclude "手冲" (pour-over) when it's part of a cafe name (e.g., "手冲咖啡店", "手冲咖啡")
  // Only consider it a bean keyword when it's in bean-related context (e.g., "手冲豆", "手冲咖啡豆")
  const isPourOverCafe = (merchant.includes('手冲咖啡店') || merchant.includes('手冲咖啡') || 
                          description.includes('手冲咖啡店') || description.includes('手冲咖啡')) &&
                         !description.includes('豆') && !merchant.includes('豆')
  
  // Exclude "拼配" (blend) when it's followed by drink names (e.g., "拼配美式", "拼配拿铁")
  const isBlendDrink = description.includes('拼配美式') || description.includes('拼配拿铁') || 
                       description.includes('拼配卡布') || description.includes('拼配澳白') ||
                       description.includes('拼配dirty') || description.includes('拼配Dirty') ||
                       merchant.includes('拼配美式') || merchant.includes('拼配拿铁')
  
  const isBeans = isCoffee && !isPourOverCafe && !isCoffeeBeanShop && (isBaijing || hasBeanKeyword || beanKeywords.some(keyword => {
    const keywordLower = keyword.toLowerCase()
    // Skip "手冲" if it's part of a cafe name
    if (keyword === '手冲' || keyword === 'pour over') {
      if (isPourOverCafe) {
        return false
      }
      // Only consider "手冲" as bean keyword if it's with bean-related terms
      return (description.includes('手冲豆') || description.includes('手冲咖啡豆') || 
              merchant.includes('手冲豆') || merchant.includes('手冲咖啡豆'))
    }
    // Skip "拼配" if it's part of a drink name
    if (keyword === '拼配' || keyword === 'blend') {
      if (isBlendDrink) {
        return false
      }
      // Only consider "拼配" as bean keyword if it's with bean-related terms (e.g., "拼配豆", "拼配咖啡豆")
      return (description.includes('拼配豆') || description.includes('拼配咖啡豆') || 
              merchant.includes('拼配豆') || merchant.includes('拼配咖啡豆'))
    }
    // For weight measurements, check if they appear as part of a weight (e.g., "100g", "250g")
    if (keyword.includes('g') || keyword === 'kg') {
      // Match weight patterns like "100g", "250g", "kg", etc.
      const weightPattern = new RegExp(`\\d+${keyword.replace('g', '')}g|\\d+kg|${keyword}`, 'i')
      return weightPattern.test(allText)
    }
    return allText.includes(keywordLower)
  }))
  
  return {
    ...transaction,
    isCoffee,
    confidence,
    matchedKeywords,
    isBeans: isBeans || false,
  }
}

/**
 * Detect coffee for multiple transactions
 */
export function detectCoffeeBatch(transactions: Transaction[]): CoffeeTransaction[] {
  return transactions.map(detectCoffee)
}

/**
 * Filter only coffee transactions
 */
export function filterCoffeeTransactions(transactions: CoffeeTransaction[]): CoffeeTransaction[] {
  return transactions.filter(t => t.isCoffee)
}

