# Coffee Diary 2025 - Project Guide

This is a personal coffee expense tracking application that visualizes coffee purchases from Alipay and WeChat Pay transaction data for the year 2025.

## Common Commands

```bash
# Development
npm run dev                    # Start dev server at http://localhost:5173
npm run preview               # Preview production build at http://localhost:4173/coffee-2025/

# Data Processing
npm run preprocess            # Process transaction data from CSV/Excel files

# Build
npm run build                 # TypeScript compile + Vite build
npm run build:with-preprocess # Preprocess data + build (full pipeline)

# Code Quality
npm run lint                  # ESLint check
```

## Architecture Overview

### Two-Phase Architecture

This project follows a **preprocessing + frontend visualization** pattern:

1. **Data Preprocessing Phase** (`scripts/preprocess.js`)
   - Parses transaction data from two sources:
     - **Alipay CSV** files (GBK encoding) from `alipay-record/` directory
     - **WeChat Pay Excel** files from `wechatpay-record/` directory
   - Filters for 2025 expenses ("支出") only
   - Detects coffee-related transactions using keyword matching
   - Anonymizes sensitive data (transaction IDs, account info, specific merchant details)
   - Outputs to `public/data/coffee-data.json`

2. **Frontend Visualization** (React + TypeScript + Vite)
   - Loads preprocessed JSON data
   - Provides interactive calendar view of coffee purchases
   - Multi-filter system for different coffee shops and categories

### Data Flow

```
Alipay CSV (GBK) ──┐
                   ├──> preprocess.js ──> coffee-data.json ──> React App
WeChat Pay Excel ──┘
```

## Coffee Detection Logic

The preprocessing script uses comprehensive keyword matching to identify coffee-related transactions:

### Three Keyword Categories
- **English keywords**: coffee, starbucks, luckin, manner, espresso, latte, etc.
- **Chinese keywords**: 咖啡, 星巴克, 瑞幸, 拿铁, 卡布奇诺, etc.
- **Merchant names**: Special handling for known coffee shop company names (北京茵赫餐饮管理有限公司 = Manner Coffee)

### Smart Filtering
- **Excludes**: Restaurants/bars that incidentally mention coffee, coffee-flavored food items (cookies, cakes, ice cream)
- **Bean Detection**: Identifies coffee bean purchases vs. drinks using weight measurements (100g, 250g), origin names (瑰夏, 埃塞俄比亚), roast levels, etc.
- **Equipment Exclusion**: Filters out coffee equipment purchases (滤纸, 咖啡杯, 咖啡机)

### Confidence Scoring
Each transaction gets a confidence score (0-1) based on keyword matches. Transactions with confidence > 0.5 are classified as coffee purchases.

## Filter System

The app provides 8 main filters (mutually exclusive):
- **manner**: Manner Coffee (including company name "北京茵赫")
- **grid**: Grid Coffee
- **dozzze**: DOzzZE 豆仔
- **hans**: Hans Coffee (憨憨)
- **beans**: Coffee bean purchases (with merchant sub-filters)
- **cafe**: Independent cafes (excludes chains, beans, equipment, delivery)
- **pin3**: Pin3 Coffee
- **yuwen**: 余温 Coffee

### Sub-Filters
- **Manner sub-filter**: "espresso" - shows only transactions ≤ ¥5 (espresso shots)
- **Beans sub-filter**: Filter by specific bean merchants
- **Cafe sub-filter**: Filter by specific cafe names

## Critical Implementation Details

### Manner Coffee Anonymization
The preprocessing script specifically anonymizes Manner Coffee transactions by:
1. Detecting Manner transactions via merchant name, account domain, or keywords
2. Replacing merchant name with "Manner Coffee"
3. Replacing description with "Manner Coffee Order"

**Important**: The filter logic in `App.tsx` must match the detection logic in `preprocess.js`. Manner detection criteria:
```typescript
merchant.includes('Manner') ||
merchant.includes('北京茵赫') ||
merchant.includes('茵赫') ||
isMannerAccount === true ||
matchedKeywords.includes('manner')
```

### Character Encoding
Alipay CSV files use **GBK encoding**, not UTF-8. The preprocessing script uses `iconv-lite` to decode them correctly.

### Base Path Configuration
The app is configured to deploy at `/coffee-2025/` subpath (see `vite.config.ts`). When testing locally after build:
```bash
npm run preview
# Visit http://localhost:4173/coffee-2025/
```

## Deployment

See `DEPLOYMENT.md` for detailed deployment instructions. The app is designed to be deployed as a Vercel project with subpath routing to `www.yifen.me/coffee-2025`.

## Data Privacy

- All sensitive transaction data (transactionId, merchantOrderId, account, note) is removed during preprocessing
- Only anonymized transaction data is included in the final JSON output
- The JSON file is committed to git for deployment purposes
