import { ConnectKitButton } from 'connectkit';
import Link from 'next/link';

export default function Header() {
  return (
    <div className="flex justify-between items-center p-4 border-b-2">
      <h1 className="text-4xl font-bold">NFT Marketplace</h1>
      <div className="flex items-center gap-4">
        <Link href="/">Marketplace</Link>
        <Link href="/sell-nft">Sell Nft</Link>
        <ConnectKitButton />
      </div>
    </div>
  );
}
