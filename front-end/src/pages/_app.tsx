import '@/styles/globals.css';
import type { AppProps } from 'next/app';
import WagmiProviders from '@/providers/Wagmi';
import QueryClientProvider from '@/providers/QueryClient';
import Header from '@/components/Header';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <WagmiProviders>
      <QueryClientProvider>
        <Header />
        <Component {...pageProps} />
      </QueryClientProvider>
    </WagmiProviders>
  );
}
