// SPDX-License-Identifier: MIT
pragma solidity 0.8.7;

interface VersaInteractorErrors {
    error InvalidDestinationChainId();

    error InvalidCaller(address caller);

    error InvalidVersaMessageCall();

    error InvalidVersaRevertCall();
}
