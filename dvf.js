const HDWalletProvider = require('@truffle/hdwallet-provider')
const DVF = require('dvf-client-js')
const Web3 = require('web3')
const { PRIVATE_KEY, ALCHEMY_URL, API_URL } = require('./config')

module.exports = () => {
  const provider = new HDWalletProvider(PRIVATE_KEY, ALCHEMY_URL)
  const web3 = new Web3(provider)
  provider.engine.stop()

  return DVF(web3, {
    api: API_URL
  })
}
