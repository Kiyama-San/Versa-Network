// SPDX-License-Identifier: MIT
pragma solidity 0.8.7;

import "@openzeppelin/contracts/access/Ownable.sol";

import "./interfaces/VersaInterfaces.sol";
import "./interfaces/VersaInteractorErrors.sol";

abstract contract VersaInteractor is Ownable, VersaInteractorErrors {
    bytes32 constant ZERO_BYTES = keccak256(new bytes(0));
    uint256 internal immutable currentChainId;
    VersaConnector public immutable connector;

    /**
     * @dev Maps a chain id to its corresponding address of the MultiChainSwap contract
     * The address is expressed in bytes to allow non-EVM chains
     * This mapping is useful, mainly, for two reasons:
     *  - Given a chain id, the contract is able to route a transaction to its corresponding address
     *  - To check that the messages (onVersaMessage, onVersaRevert) come from a trusted source
     */
    mapping(uint256 => bytes) public interactorsByChainId;

    modifier isValidMessageCall(VersaInterfaces.VersaMessage calldata VersaMessage) {
        _isValidCaller();
        if (keccak256(VersaMessage.VersaTxSenderAddress) != keccak256(interactorsByChainId[VersaMessage.sourceChainId]))
            revert InvalidVersaMessageCall();
        _;
    }

    modifier isValidRevertCall(VersaInterfaces.VersaRevert calldata VersaRevert) {
        _isValidCaller();
        if (VersaRevert.VersaTxSenderAddress != address(this)) revert InvalidVersaRevertCall();
        if (VersaRevert.sourceChainId != currentChainId) revert InvalidVersaRevertCall();
        _;
    }

    constructor(address VersaConnectorAddress) {
        currentChainId = block.chainid;
        connector = VersaConnector(VersaConnectorAddress);
    }

    function _isValidCaller() private view {
        if (msg.sender != address(connector)) revert InvalidCaller(msg.sender);
    }

    /**
     * @dev Useful for contracts that inherit from this one
     */
    function _isValidChainId(uint256 chainId) internal view returns (bool) {
        return (keccak256(interactorsByChainId[chainId]) != ZERO_BYTES);
    }

    function setInteractorByChainId(uint256 destinationChainId, bytes calldata contractAddress) external onlyOwner {
        interactorsByChainId[destinationChainId] = contractAddress;
    }
}
