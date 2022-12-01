// SPDX-License-Identifier: MIT
pragma solidity 0.8.7;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

import "./interfaces/ConnectorErrors.sol";
import "./interfaces/VersaInterfaces.sol";

contract VersaConnectorBase is ConnectorErrors, Pausable {
    address public immutable VersaToken;

    address public pauserAddress;

    /**
     * @dev Collectively held by Versa blockchain validators.
     */
    address public tssAddress;

    address public tssAddressUpdater;

    event VersaSent(
        address sourceTxOriginAddress,
        address indexed VersaTxSenderAddress,
        uint256 indexed destinationChainId,
        bytes destinationAddress,
        uint256 VersaValueAndGas,
        uint256 destinationGasLimit,
        bytes message,
        bytes VersaParams
    );

    event VersaReceived(
        bytes VersaTxSenderAddress,
        uint256 indexed sourceChainId,
        address indexed destinationAddress,
        uint256 VersaValue,
        bytes message,
        bytes32 indexed internalSendHash
    );

    event VersaReverted(
        address VersaTxSenderAddress,
        uint256 sourceChainId,
        uint256 indexed destinationChainId,
        bytes destinationAddress,
        uint256 remainingVersaValue,
        bytes message,
        bytes32 indexed internalSendHash
    );

    event TSSAddressUpdated(address VersaTxSenderAddress, address newTssAddress);

    event PauserAddressUpdated(address updaterAddress, address newTssAddress);

    constructor(
        address VersaToken_,
        address tssAddress_,
        address tssAddressUpdater_,
        address pauserAddress_
    ) {
        if (
            VersaToken_ == address(0) ||
            tssAddress_ == address(0) ||
            tssAddressUpdater_ == address(0) ||
            pauserAddress_ == address(0)
        ) {
            revert InvalidAddress();
        }

        VersaToken = VersaToken_;
        tssAddress = tssAddress_;
        tssAddressUpdater = tssAddressUpdater_;
        pauserAddress = pauserAddress_;
    }

    modifier onlyPauser() {
        if (msg.sender != pauserAddress) revert CallerIsNotPauser(msg.sender);
        _;
    }

    modifier onlyTssAddress() {
        if (msg.sender != tssAddress) revert CallerIsNotTss(msg.sender);
        _;
    }

    modifier onlyTssUpdater() {
        if (msg.sender != tssAddressUpdater) revert CallerIsNotTssUpdater(msg.sender);
        _;
    }

    function updatePauserAddress(address pauserAddress_) external onlyPauser {
        if (pauserAddress_ == address(0)) revert InvalidAddress();

        pauserAddress = pauserAddress_;

        emit PauserAddressUpdated(msg.sender, pauserAddress_);
    }

    function updateTssAddress(address tssAddress_) external {
        if (msg.sender != tssAddress && msg.sender != tssAddressUpdater) revert CallerIsNotTssOrUpdater(msg.sender);
        if (tssAddress_ == address(0)) revert InvalidAddress();

        tssAddress = tssAddress_;

        emit TSSAddressUpdated(msg.sender, tssAddress_);
    }

    /**
     * @dev Changes the ownership of tssAddressUpdater to be the one held by the Versa blockchain TSS nodes.
     */
    function renounceTssAddressUpdater() external onlyTssUpdater {
        if (tssAddress == address(0)) revert InvalidAddress();

        tssAddressUpdater = tssAddress;
    }

    function pause() external onlyPauser {
        _pause();
    }

    function unpause() external onlyPauser {
        _unpause();
    }

    function send(VersaInterfaces.SendInput calldata input) external virtual {}

    function onReceive(
        bytes calldata VersaTxSenderAddress,
        uint256 sourceChainId,
        address destinationAddress,
        uint256 VersaValue,
        bytes calldata message,
        bytes32 internalSendHash
    ) external virtual {}

    function onRevert(
        address VersaTxSenderAddress,
        uint256 sourceChainId,
        bytes calldata destinationAddress,
        uint256 destinationChainId,
        uint256 remainingVersaValue,
        bytes calldata message,
        bytes32 internalSendHash
    ) external virtual {}
}
