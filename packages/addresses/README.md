# VersaChain addresses

This package includes the addresses and networks to use Versachain.

## Usage

```js
import { getAddress } from "@versachain/addresses";

const address = getAddress({ address: "versaToken", networkName: "goerli", versaNetwork:"theta" });
```

## API


| Method | Description |
| :---- | ------ |
| isTestnetNetworkName = (networkName: string): networkName is TestnetNetworkName | Returns true if it's a valid Testnet name |
| isVersaTestnet = (networkName: string): networkName is VersaTestnetNetworkName | Returns true if it's a valid VersaTestnet name |
| isMainnetNetworkName = (networkName: string): networkName is MainnetNetworkName | Returns true if it's a valid Mainnet name |
| isNetworkName = (networkName: string): networkName is NetworkName | Returns true if it's a valid network name |
| isVersaNetworkName = (networkName: string): networkName is ZetaNetworkName | Returns true if it's a valid Versa network name |
| type VersaAddress | Valid values for VersaAddress |
| getAddress = ({ address: VersaAddress; networkName: string; versaNetwork: string; }): string  | Returns the address of a valid VersaAddress |

```