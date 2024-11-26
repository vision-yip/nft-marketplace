import { createPublicClient, webSocket } from 'viem'
import { sepolia } from 'viem/chains'

export const client = createPublicClient({
  chain: sepolia,
  transport: webSocket(process.env.NEXT_PUBLIC_ALCHEMY_WS_URL),
})


export default client;