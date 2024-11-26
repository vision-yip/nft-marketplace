import { createPublicClient, webSocket } from 'viem'
import { sepolia } from 'viem/chains'

export const client = createPublicClient({
  chain: sepolia,
  transport: webSocket('wss://eth-sepolia.g.alchemy.com/v2/6ExkU4ulEIw5izW-lKMjA3YfcluS9qyk'),
})


export default client;