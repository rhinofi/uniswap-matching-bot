# Uniswap Matching Bot: A market-making bot which reads prices on Uniswap and places orders on both sides of the order-book accordingly

This simple Node.js bot is for [DeversiFi](deversifi.com). This bot aims to simply keep orders on the bid and ask on any specified market, at prices determined by Uniswap, in order to profit from the spread.

This bot allows high speed-trading on a completely non-custodial exchange.

### Steps to use:

1. Create a new Ethereum account and fund with ETH
2. `git clone https://github.com/DeversiFi/uniswap-matching-bot.git`
2. Copy `config.example.js` => `config.js`
3. Get an Alchemy URL and enter use it to populate the config file: [here](https://github.com/DeversiFi/micro-bot/blob/main/config.example.js#L5)
4. Enter your Ethereum private key here (prefixed with 0x): [here](https://github.com/DeversiFi/micro-bot/blob/main/config.example.js#L3)
5. Choose the market pair you want to trade and update it [here](https://github.com/DeversiFi/micro-bot/blob/main/config.example.js#L4)

Once the above setup is complete, you can use the following instructions:

`npm install`

`node setup` - registers and deposits your ETH to the exchange

`node index` - starts the bot!


### Other information:

This bot relies on Uniswap SDK for getting prices. A simple extension to this bot could be used to arbitrage between DeversiFi and Uniswap.

Please fork and use!
