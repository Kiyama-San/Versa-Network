// SPDX-License-Identifier: MIT
pragma solidity 0.8.7;

import "@openzeppelin/contracts/interfaces/IERC20.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@versanetwork/protocol-contracts/contracts/interfaces/VersaInterfaces.sol";
import "@versanetwork/protocol-contracts/contracts/VersaInteractor.sol";

interface HyperChainFightersErrors {
    error InvalidMessageType();

    error InvalidTransferCaller();

    error ErrorApprovingVersa();
}

contract HyperChainFighters is
    ERC721("HyperChainFighter", "HCF"),
    VersaInteractor,
    VersaReceiver,
    HyperChainFightersErrors
{
    using Counters for Counters.Counter;
    using Strings for uint256;

    bytes32 public constant CROSS_CHAIN_TRANSFER_MESSAGE = keccak256("CROSS_CHAIN_TRANSFER");

    IERC20 internal immutable _versaToken;

    string public baseURI;

    Counters.Counter public tokenIds;

    VersaTokenConsumer private immutable _versaConsumer;

    constructor(
        address connectorAddress,
        address versaTokenAddress,
        address versaConsumerAddress,
        bool useEven
    ) VersaInteractor(connectorAddress) {
        _versaToken = IERC20(versaTokenAddress);
        _versaConsumer = VersaTokenConsumer(versaConsumerAddress);

        /**
         * @dev A simple way to prevent collisions between cross-chain token ids
         * As you can see below, the mint function should increase the counter by two
         */
        tokenIds.increment();
        if (useEven) tokenIds.increment();
    }

    function setBaseURI(string memory baseURIParam) public onlyOwner {
        baseURI = baseURIParam;
    }

    function mint(address to) public returns (uint256) {
        uint256 newFighterId = tokenIds.current();

        /**
         * @dev Always increment by two to keep ids even/odd (depending on the chain)
         * Check the constructor for further reference
         */
        tokenIds.increment();
        tokenIds.increment();

        _safeMint(to, newFighterId);
        return newFighterId;
    }

    /**
     * @dev Useful for cross-chain minting
     */
    function _mintId(address to, uint256 tokenId) internal {
        _safeMint(to, tokenId);
    }

    function _burnFighter(uint256 burnedWarriorId) internal {
        _burn(burnedFighterId);
    }

    /**
     * @dev Cross-chain functions
     */

    function crossChainTransfer(
        uint256 crossChainId,
        address to,
        uint256 tokenId
    ) external payable {
        if (!_isValidChainId(crossChainId)) revert InvalidDestinationChainId();
        if (!_isApprovedOrOwner(_msgSender(), tokenId)) revert InvalidTransferCaller();

        uint256 crossChainGas = 18 * (10**18);
        uint256 versaValueAndGas = _versaConsumer.getVersaFromEth{value: msg.value}(address(this), crossChainGas);
        _versaToken.approve(address(connector), versaValueAndGas);

        _burnFighter(tokenId);

        connector.send(
            VersaInterfaces.SendInput({
                destinationChainId: crossChainId,
                destinationAddress: interactorsByChainId[crossChainId],
                destinationGasLimit: 500000,
                message: abi.encode(CROSS_CHAIN_TRANSFER_MESSAGE, tokenId, msg.sender, to),
                versaValueAndGas: versaValueAndGas,
                versaParams: abi.encode("")
            })
        );
    }

    function onversaMessage(versaInterfaces.versaMessage calldata versaMessage)
        external
        override
        isValidMessageCall(versaMessage)
    {
        (
            bytes32 messageType,
            uint256 tokenId,
            ,
            /**
             * @dev this extra comma corresponds to address from
             */
            address to
        ) = abi.decode(versaMessage.message, (bytes32, uint256, address, address));

        if (messageType != CROSS_CHAIN_TRANSFER_MESSAGE) revert InvalidMessageType();

        _mintId(to, tokenId);
    }

    function onversaRevert(versaInterfaces.versaRevert calldata versaRevert)
        external
        override
        isValidRevertCall(versaRevert)
    {
        (bytes32 messageType, uint256 tokenId, address from) = abi.decode(
            versaRevert.message,
            (bytes32, uint256, address)
        );

        if (messageType != CROSS_CHAIN_TRANSFER_MESSAGE) revert InvalidMessageType();

        _mintId(from, tokenId);
    }
}
