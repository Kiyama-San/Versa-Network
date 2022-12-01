// SPDX-License-Identifier: MIT
pragma solidity 0.8.7;

import "../interfaces/VersaInterfaces.sol";

contract VersaReceiverMock is VersaReceiver {
    event MockOnVersaMessage(address destinationAddress);

    event MockOnVersaRevert(address VersaTxSenderAddress);

    function onVersaMessage(VersaInterfaces.VersaMessage calldata VersaMessage) external override {
        emit MockOnVersaMessage(VersaMessage.destinationAddress);
    }

    function onVersaRevert(VersaInterfaces.VersaRevert calldata VersaRevert) external override {
        emit MockOnVersaRevert(VersaRevert.VersaTxSenderAddress);
    }
}
