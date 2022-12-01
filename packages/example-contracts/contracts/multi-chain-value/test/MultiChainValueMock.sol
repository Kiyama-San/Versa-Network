// SPDX-License-Identifier: MIT
pragma solidity 0.8.7;

import "../MultiChainValue.sol";

contract MultiChainValueMock is MultiChainValue {
    constructor(address connectorAddress, address _versaTokenInput) MultiChainValue(connectorAddress, _versaTokenInput) {}
}
