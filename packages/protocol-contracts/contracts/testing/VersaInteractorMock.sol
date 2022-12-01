// SPDX-License-Identifier: MIT
pragma solidity 0.8.7;

import "../VersaInteractor.sol";

contract VersaInteractorMock is VersaInteractor, VersaReceiver {
    constructor(address VersaConnectorAddress) VersaInteractor(VersaConnectorAddress) {}

    function onVersaMessage(VersaInterfaces.VersaMessage calldata VersaMessage)
        external
        override
        isValidMessageCall(VersaMessage)
    {}

    function onVersaRevert(VersaInterfaces.VersaRevert calldata VersaRevert)
        external
        override
        isValidRevertCall(VersaRevert)
    {}
}
