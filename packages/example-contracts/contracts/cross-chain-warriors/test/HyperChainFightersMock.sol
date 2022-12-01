// SPDX-License-Identifier: MIT
pragma solidity 0.8.7;

import "../HyperChainFighters.sol";

contract HyperChainFightersMock is HyperChainFighters {
    constructor(
        address connectorAddress,
        address versaTokenAddress,
        address ConsumerAddress,
        bool useEven
    ) HyperChainFighters(connectorAddress, versaTokenAddress, versaConsumerAddress, useEven) {}

    function mintId(address to, uint256 tokenId) external {
        return _mintId(to, tokenId);
    }
}
