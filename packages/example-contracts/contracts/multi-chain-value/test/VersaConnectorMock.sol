// SPDX-License-Identifier: MIT
pragma solidity 0.8.7;

import "@versanetwork/protocol-contracts/contracts/interfaces/VersaInterfaces.sol";

contract VersaConnectorMockValue is VersaConnector {
    function send(VersaInterfaces.SendInput calldata input) external override {}
}
