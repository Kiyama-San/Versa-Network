// SPDX-License-Identifier: MIT
pragma solidity 0.8.7;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@versanetwork/protocol-contracts/contracts/Versa.eth.sol";
import "@versanetwork/protocol-contracts/contracts/VersaInteractor.sol";
import "@versanetwork/protocol-contracts/contracts/interfaces/VersaInterfaces.sol";

interface MultiChainValueErrors {
    error ErrorTransferringVersa();

    error ChainIdAlreadyEnabled();

    error ChainIdNotAvailable();

    error InvalidVersaValueAndGas();
}

contract MultiChainValue is VersaInteractor, MultiChainValueErrors {
    address public versaToken;
    mapping(uint256 => bool) public availableChainIds;

    constructor(address connectorAddress_, address versaToken_) VersaInteractor(connectorAddress_) {
        versaToken = versaToken_;
    }

    function addAvailableChainId(uint256 destinationChainId) external onlyOwner {
        if (availableChainIds[destinationChainId]) revert ChainIdAlreadyEnabled();

        availableChainIds[destinationChainId] = true;
    }

    function removeAvailableChainId(uint256 destinationChainId) external onlyOwner {
        if (!availableChainIds[destinationChainId]) revert ChainIdNotAvailable();

        delete availableChainIds[destinationChainId];
    }

    function send(
        uint256 destinationChainId,
        bytes calldata destinationAddress,
        uint256 versaValueAndGas
    ) external {
        if (!availableChainIds[destinationChainId]) revert InvalidDestinationChainId();
        if (versaValueAndGas == 0) revert InvalidVersaValueAndGas();

        bool success1 = VersaEth(versaToken).approve(address(connector), versaValueAndGas);
        bool success2 = VerseEth(versaToken).transferFrom(msg.sender, address(this), versaValueAndGas);
        if (!(success1 && success2)) revert ErrorTransferringVersa();

        connector.send(
            VersaInterfaces.SendInput({
                destinationChainId: destinationChainId,
                destinationAddress: destinationAddress,
                destinationGasLimit: 300000,
                message: abi.encode(),
                versaValueAndGas: versaValueAndGas,
                versaParams: abi.encode("")
            })
        );
    }
}
