const DVF = require('./dvf')
const _ = require('lodash')
const { splitSymbol, prepareAmount } = require('dvf-utils')
const { AlchemyProvider } = require('@ethersproject/providers')
const { PAIR, PRIVATE_KEY, ALCHEMY_URL } = require('./config')
const { ChainId, Token, WETH, Fetcher, Route, Trade, TokenAmount, TradeType } = require('@uniswap/sdk')

let dvf

const provider = new AlchemyProvider(null, ALCHEMY_URL.split('/v2/')[1])

let lastBidRoute, lastAskRoute, lastMidPrice

let tokenQuote
let tokenBase

onStartUp()

let pair, routeBuy, routeSell, buySide, sellSide, midPrice
async function marketMake () {
  setInterval(async () => {
    pair = await Fetcher.fetchPairData(tokenQuote, tokenBase, provider)
    routeBuy = new Route([pair], tokenBase)
    routeSell = new Route([pair], tokenQuote)
    midPrice = routeBuy.midPrice.invert().toSignificant(4)
    console.log(midPrice)
    const haveOpenOrders = await checkIfOpenOrders()
    if (midPrice !== lastMidPrice || !haveOpenOrders) {
      lastMidPrice = midPrice
      lastBidRoute = routeSell
      lastAskRoute = routeBuy
      replaceOrders()
    }
  }, 180000)
}

async function onStartUp () {
  dvf = await DVF()
  await cancelOpenOrders()
  await syncBalances()
  await defineUniswapTokens()
  console.log('Starting balances: ', balanceA, balanceB)
  marketMake()
}

// Trading Functions

let balanceA
let balanceB

async function cancelOpenOrders () {
  const orders = await dvf.getOrders()
  orders.forEach(o => {
    dvf.cancelOrder(o._id)
  })
}

async function checkIfOpenOrders () {
  const orders = await dvf.getOrders()
  return orders.length > 0
}

async function syncBalances () {
  const balances = _.chain(await dvf.getBalance())
    .keyBy('token')
    .mapValues('available')
    .value()
  const [quote, base] = splitSymbol(PAIR)
  balanceA = dvf.token.fromQuantizedAmount(quote, balances[quote])
  balanceB = dvf.token.fromQuantizedAmount(base, balances[base])
  balanceA = balanceA === 'NaN' ? 0 : balanceA
  balanceB = balanceB === 'NaN' ? 0 : balanceB
}

async function replaceOrders () {
  cancelOpenOrders()
  syncBalances()
  placeOrder(-balanceA / 5)
  placeOrder(balanceB / (lastMidPrice * 5))
}

async function placeOrder (amount) {
  amount = prepareAmount(amount, 3)
  if (amount === '0') return

  const [quote, base] = splitSymbol(PAIR)
  let price
  if (amount > 0) {
    const buyAmountWei = dvf.token.toBaseUnitAmount(quote, 1)
    buySide = new Trade(lastBidRoute, new TokenAmount(tokenQuote, buyAmountWei), TradeType.EXACT_INPUT)
    price = buySide.executionPrice.toSignificant(6)
    console.log('Place buy at:', price)
  } else {
    const sellAmountWei = dvf.token.toBaseUnitAmount(base, 1)
    sellSide = new Trade(lastAskRoute, new TokenAmount(tokenBase, sellAmountWei), TradeType.EXACT_INPUT)
    price = sellSide.executionPrice.invert().toSignificant(6)
    console.log('Place sell at:', price)
  }
  if (!price) return

  try {
    await dvf.submitOrder({
      symbol: PAIR,
      amount,
      price,
      starkPrivateKey: PRIVATE_KEY // .substring(2)
    })
  } catch (e) {
    const error = (e.error && e.error.details && e.error.details.error) || {}
    console.warn(`Trade not completed: ${error.error}`)
  }
}

async function defineUniswapTokens () {
  const [quote, base] = splitSymbol(PAIR)
  const config = await dvf.getConfig()
  tokenQuote = quote === 'ETH' ? WETH[ChainId.MAINNET] : new Token(
    ChainId.MAINNET,
    config.tokenRegistry[quote].tokenAddress,
    config.tokenRegistry[quote].decimals
  )
  tokenBase = base === 'ETH' ? WETH[ChainId.MAINNET] : new Token(
    ChainId.MAINNET,
    config.tokenRegistry[base].tokenAddress,
    config.tokenRegistry[base].decimals
  )
}
