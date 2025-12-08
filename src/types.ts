export interface Transaction {
  date: string; // YYYY-MM-DD format
  time: string; // HH:MM:SS format
  datetime: string; // Full datetime string
  category: string; // 交易分类
  merchant: string; // 交易对方
  account: string; // 对方账号
  description: string; // 商品说明
  type: '支出' | '收入' | '收入/支出'; // 收/支
  amount: number; // 金额
  paymentMethod: string; // 收/付款方式
  status: string; // 交易状态
  transactionId: string; // 交易订单号
  merchantOrderId: string; // 商家订单号
  note: string; // 备注
  source: 'alipay' | 'wechatpay'; // Payment source
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

