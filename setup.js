#!/usr/bin/env node
const DVF = require('./dvf')
const { PRIVATE_KEY } = require('./config')

;(async () => {
  const dvf = await DVF()

  const fee = 0.1
  const balance = await dvf.web3.eth.getBalance(dvf.config.ethAddress)
  const balanceEth = parseFloat(dvf.web3.utils.fromWei(balance, 'ether'))
  const depositValue = parseFloat(balanceEth.toFixed(2)) - fee

  if (depositValue <= 0) {
    console.warn('No balance on address: ', dvf.config.ethAddress)
    process.exit(1)
  }

  await register(dvf)

  console.log(`Depositing ${depositValue}ETH`)
  await dvf.deposit('ETH', depositValue, PRIVATE_KEY.substring(2))
  console.log('Deposit OK, please wait a few minutes for the confirmations')
  process.exit(1)
})().catch((error) => {
  console.error(error)
  process.exit(1)
})

async function register (dvf) {
  const config = await dvf.getUserConfig()

  if (!config.isRegistered) {
    console.log('Registering...')
    const keyPair = await dvf.stark.createKeyPair(PRIVATE_KEY.substring(2))
    await dvf.register(keyPair.starkPublicKey)
  }

  console.log('Registration OK')
}
