/**
 * ETH/USD price utilities with caching and multiple API sources
 */

let cachedPrice: number | null = null;
let lastFetchTime = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes in milliseconds

// API configurations
const API_SOURCES = [
  {
    name: 'CoinGecko',
    url: 'https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd',
    parsePrice: (data: any) => data?.ethereum?.usd
  },
  {
    name: 'Binance',
    url: 'https://api.binance.com/api/v3/ticker/price?symbol=ETHUSDT',
    parsePrice: (data: any) => parseFloat(data?.price)
  },
  {
    name: 'CryptoCompare',
    url: 'https://min-api.cryptocompare.com/data/price?fsym=ETH&tsyms=USD',
    parsePrice: (data: any) => data?.USD
  }
];

/**
 * Gets the current ETH price in USD from multiple API sources with caching
 * @returns {Promise<number>} The current ETH price in USD
 */
export async function getEthPriceInUsd(): Promise<number> {
  try {
    // Return cached price if valid
    const now = Date.now();
    if (cachedPrice !== null && (now - lastFetchTime < CACHE_DURATION)) {
      return cachedPrice;
    }

    // Try each API source in sequence
    for (const api of API_SOURCES) {
      try {
        const response = await fetch(api.url);
        if (!response.ok) {
          console.warn(`${api.name} API returned status ${response.status}`);
          continue;
        }

        const data = await response.json();
        const price = api.parsePrice(data);

        if (price && !isNaN(price) && price > 0) {
          // Update cache and return valid price
          cachedPrice = price;
          lastFetchTime = now;
          return price;
        }

        console.warn(`${api.name} API returned invalid price:`, price);
      } catch (error) {
        console.warn(`Error fetching from ${api.name}:`, error);
        continue;
      }
    }

    // All APIs failed, use cached price or throw error
    if (cachedPrice !== null) {
      console.warn('Using cached price as all APIs failed');
      return cachedPrice;
    }

    throw new Error('Failed to fetch ETH price from all sources');

  } catch (error) {
    console.error('Error in getEthPriceInUsd:', error);
    return cachedPrice ?? 0;
  }
}

/**
 * Converts a USD amount to its equivalent in ETH based on current market price
 * @param {number} usdAmount - The amount in USD to convert
 * @returns {Promise<string>} The equivalent amount in ETH with 18 decimal places
 */
export async function convertUsdToEth(usdAmount: number): Promise<string> {
  if (typeof usdAmount !== 'number' || isNaN(usdAmount) || usdAmount < 0) {
    console.error('Invalid USD amount:', usdAmount);
    return '0.0';
  }

  const ethPriceUsd = await getEthPriceInUsd();
  if (ethPriceUsd === 0) {
    console.error('Unable to get ETH price, conversion failed');
    return '0.0';
  }

  const ethValue = usdAmount / ethPriceUsd;
  return ethValue.toFixed(18); // Return with 18 decimal places for ETH precision
}
