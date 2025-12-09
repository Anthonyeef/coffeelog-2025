export interface Transaction {
  date: string; // YYYY-MM-DD format
  time: string; // HH:MM:SS format
  datetime: string; // Full datetime string
  category: string; // 交易分类
  merchant: string; // 交易对方
  description: string; // 商品说明
  type: '支出' | '收入' | '收入/支出'; // 收/支
  amount: number; // 金额
  paymentMethod: string; // 收/付款方式
  status: string; // 交易状态
  source: 'alipay' | 'wechatpay'; // Payment source
  // Optional fields used during preprocessing (removed from final sanitized data)
  account?: string; // 对方账号 (used during preprocessing only)
  transactionId?: string; // 交易订单号 (used during preprocessing only)
  merchantOrderId?: string; // 商家订单号 (used during preprocessing only)
  note?: string; // 备注 (used during preprocessing only)
  // Account-based flags (extracted during preprocessing, account field removed for privacy)
  isMannerAccount?: boolean; // True if account contains mannercoffee domain
  isDeliveryAccount?: boolean; // True if account indicates delivery platform
}

export interface CoffeeTransaction extends Transaction {
  isCoffee: boolean;
  confidence: number;
  matchedKeywords: string[];
  isConfirmed?: boolean; // User confirmation status
  isBeans?: boolean; // Coffee beans purchase
}

export interface CoffeeDataByDate {
  [date: string]: CoffeeTransaction[];
}

export interface CoffeeStatistics {
  totalPurchases: number;
  totalSpending: number;
  averagePerMonth: number;
  averagePerWeek: number;
  mostFrequentShop: string;
  purchaseFrequency: { [month: string]: number };
}

