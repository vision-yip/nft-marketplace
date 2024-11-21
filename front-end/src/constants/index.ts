import _marketplaceAbi from './marketplaceAbi.json';
import _basicNftAbi from './basicNftAbi.json';
import _networkMapping from './networkMapping.json';


export const marketplaceAbi = _marketplaceAbi;
export const basicNftAbi = _basicNftAbi;
export const networkMapping = _networkMapping;
export const requestUrl = process.env.NEXT_PUBLIC_GRAPH_URL as string;
