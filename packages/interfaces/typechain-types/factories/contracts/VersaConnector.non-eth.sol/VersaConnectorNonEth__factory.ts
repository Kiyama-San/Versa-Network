/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import { Signer, utils, Contract, ContractFactory, Overrides } from "ethers";
import type { Provider, TransactionRequest } from "@ethersproject/providers";
import type {
  VersaConnectorNonEth,
  VersaConnectorNonEthInterface,
} from "../../../contracts/VersaConnector.non-eth.sol/VersaConnectorNonEth";

const _abi = [
  {
    inputs: [
      {
        internalType: "address",
        name: "VersaTokenAddress_",
        type: "address",
      },
      {
        internalType: "address",
        name: "tssAddress_",
        type: "address",
      },
      {
        internalType: "address",
        name: "tssAddressUpdater_",
        type: "address",
      },
      {
        internalType: "address",
        name: "pauserAddress_",
        type: "address",
      },
    ],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "caller",
        type: "address",
      },
    ],
    name: "CallerIsNotPauser",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "caller",
        type: "address",
      },
    ],
    name: "CallerIsNotTss",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "caller",
        type: "address",
      },
    ],
    name: "CallerIsNotTssOrUpdater",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "caller",
        type: "address",
      },
    ],
    name: "CallerIsNotTssUpdater",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "maxSupply",
        type: "uint256",
      },
    ],
    name: "ExceedsMaxSupply",
    type: "error",
  },
  {
    inputs: [],
    name: "InvalidAddress",
    type: "error",
  },
  {
    inputs: [],
    name: "VersaTransferError",
    type: "error",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "address",
        name: "account",
        type: "address",
      },
    ],
    name: "Paused",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "address",
        name: "updaterAddress",
        type: "address",
      },
      {
        indexed: false,
        internalType: "address",
        name: "newTssAddress",
        type: "address",
      },
    ],
    name: "PauserAddressUpdated",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "address",
        name: "VersaTxSenderAddress",
        type: "address",
      },
      {
        indexed: false,
        internalType: "address",
        name: "newTssAddress",
        type: "address",
      },
    ],
    name: "TSSAddressUpdated",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "address",
        name: "account",
        type: "address",
      },
    ],
    name: "Unpaused",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "bytes",
        name: "VersaTxSenderAddress",
        type: "bytes",
      },
      {
        indexed: true,
        internalType: "uint256",
        name: "sourceChainId",
        type: "uint256",
      },
      {
        indexed: true,
        internalType: "address",
        name: "destinationAddress",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "VersaValue",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "bytes",
        name: "message",
        type: "bytes",
      },
      {
        indexed: true,
        internalType: "bytes32",
        name: "internalSendHash",
        type: "bytes32",
      },
    ],
    name: "VersaReceived",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "address",
        name: "VersaTxSenderAddress",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "sourceChainId",
        type: "uint256",
      },
      {
        indexed: true,
        internalType: "uint256",
        name: "destinationChainId",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "bytes",
        name: "destinationAddress",
        type: "bytes",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "remainingVersaValue",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "bytes",
        name: "message",
        type: "bytes",
      },
      {
        indexed: true,
        internalType: "bytes32",
        name: "internalSendHash",
        type: "bytes32",
      },
    ],
    name: "VersaReverted",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "address",
        name: "sourceTxOriginAddress",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "VersaTxSenderAddress",
        type: "address",
      },
      {
        indexed: true,
        internalType: "uint256",
        name: "destinationChainId",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "bytes",
        name: "destinationAddress",
        type: "bytes",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "VersaValueAndGas",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "destinationGasLimit",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "bytes",
        name: "message",
        type: "bytes",
      },
      {
        indexed: false,
        internalType: "bytes",
        name: "VersaParams",
        type: "bytes",
      },
    ],
    name: "VersaSent",
    type: "event",
  },
  {
    inputs: [],
    name: "getLockedAmount",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "maxSupply",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes",
        name: "VersaTxSenderAddress",
        type: "bytes",
      },
      {
        internalType: "uint256",
        name: "sourceChainId",
        type: "uint256",
      },
      {
        internalType: "address",
        name: "destinationAddress",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "VersaValue",
        type: "uint256",
      },
      {
        internalType: "bytes",
        name: "message",
        type: "bytes",
      },
      {
        internalType: "bytes32",
        name: "internalSendHash",
        type: "bytes32",
      },
    ],
    name: "onReceive",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "VersaTxSenderAddress",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "sourceChainId",
        type: "uint256",
      },
      {
        internalType: "bytes",
        name: "destinationAddress",
        type: "bytes",
      },
      {
        internalType: "uint256",
        name: "destinationChainId",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "remainingVersaValue",
        type: "uint256",
      },
      {
        internalType: "bytes",
        name: "message",
        type: "bytes",
      },
      {
        internalType: "bytes32",
        name: "internalSendHash",
        type: "bytes32",
      },
    ],
    name: "onRevert",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "pause",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "paused",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "pauserAddress",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "renounceTssAddressUpdater",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        components: [
          {
            internalType: "uint256",
            name: "destinationChainId",
            type: "uint256",
          },
          {
            internalType: "bytes",
            name: "destinationAddress",
            type: "bytes",
          },
          {
            internalType: "uint256",
            name: "destinationGasLimit",
            type: "uint256",
          },
          {
            internalType: "bytes",
            name: "message",
            type: "bytes",
          },
          {
            internalType: "uint256",
            name: "VersaValueAndGas",
            type: "uint256",
          },
          {
            internalType: "bytes",
            name: "VersaParams",
            type: "bytes",
          },
        ],
        internalType: "struct VersaInterfaces.SendInput",
        name: "input",
        type: "tuple",
      },
    ],
    name: "send",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "maxSupply_",
        type: "uint256",
      },
    ],
    name: "setMaxSupply",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "tssAddress",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "tssAddressUpdater",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "unpause",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "pauserAddress_",
        type: "address",
      },
    ],
    name: "updatePauserAddress",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "tssAddress_",
        type: "address",
      },
    ],
    name: "updateTssAddress",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "VersaToken",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
];

const _bytecode =
  "0x60a06040527fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff6003553480156200003557600080fd5b506040516200239b3803806200239b83398181016040528101906200005b9190620002a8565b8383838360008060006101000a81548160ff021916908315150217905550600073ffffffffffffffffffffffffffffffffffffffff168473ffffffffffffffffffffffffffffffffffffffff161480620000e15750600073ffffffffffffffffffffffffffffffffffffffff168373ffffffffffffffffffffffffffffffffffffffff16145b80620001195750600073ffffffffffffffffffffffffffffffffffffffff168273ffffffffffffffffffffffffffffffffffffffff16145b80620001515750600073ffffffffffffffffffffffffffffffffffffffff168173ffffffffffffffffffffffffffffffffffffffff16145b1562000189576040517fe6c4247b00000000000000000000000000000000000000000000000000000000815260040160405180910390fd5b8373ffffffffffffffffffffffffffffffffffffffff1660808173ffffffffffffffffffffffffffffffffffffffff1660601b8152505082600160006101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff16021790555081600260006101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff16021790555080600060016101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff16021790555050505050505050506200036d565b600081519050620002a28162000353565b92915050565b60008060008060808587031215620002c557620002c46200034e565b5b6000620002d58782880162000291565b9450506020620002e88782880162000291565b9350506040620002fb8782880162000291565b92505060606200030e8782880162000291565b91505092959194509250565b600062000327826200032e565b9050919050565b600073ffffffffffffffffffffffffffffffffffffffff82169050919050565b600080fd5b6200035e816200031a565b81146200036a57600080fd5b50565b60805160601c611fe5620003b66000396000818161029f015281816102c5015281816104500152818161053e01528181610f460152818161103401526112a30152611fe56000f3fe608060405234801561001057600080fd5b50600436106101005760003560e01c80636f8b44b011610097578063942a5e1611610066578063942a5e1614610229578063d5abeb0114610245578063ec02690114610263578063f7fb869b1461027f57610100565b80636f8b44b0146101dd578063779e3b63146101f95780638456cb59146102035780639122c3441461020d57610100565b80633f4ba83a116100d35780633f4ba83a1461017b5780635b112591146101855780635c975abb146101a35780636128480f146101c157610100565b806321e093b114610105578063252bc8861461012357806329dd214d14610141578063328a01d01461015d575b600080fd5b61010d61029d565b60405161011a9190611a98565b60405180910390f35b61012b6102c1565b6040516101389190611d05565b60405180910390f35b61015b60048036038101906101569190611713565b610371565b005b610165610769565b6040516101729190611a98565b60405180910390f35b61018361078f565b005b61018d61082b565b60405161019a9190611a98565b60405180910390f35b6101ab610851565b6040516101b89190611c1d565b60405180910390f35b6101db60048036038101906101d69190611604565b610867565b005b6101f760048036038101906101f2919061182b565b6109dd565b005b610201610a79565b005b61020b610bf9565b005b61022760048036038101906102229190611604565b610c95565b005b610243600480360381019061023e9190611631565b610e67565b005b61024d611253565b60405161025a9190611d05565b60405180910390f35b61027d600480360381019061027891906117e2565b611259565b005b6102876113ca565b6040516102949190611a98565b60405180910390f35b7f000000000000000000000000000000000000000000000000000000000000000081565b60007f000000000000000000000000000000000000000000000000000000000000000073ffffffffffffffffffffffffffffffffffffffff166370a08231306040518263ffffffff1660e01b815260040161031c9190611a98565b60206040518083038186803b15801561033457600080fd5b505afa158015610348573d6000803e3d6000fd5b505050506040513d601f19601f8201168201806040525081019061036c9190611858565b905090565b610379610851565b156103b9576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004016103b090611ca1565b60405180910390fd5b600160009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff163373ffffffffffffffffffffffffffffffffffffffff161461044b57336040517fff70ace20000000000000000000000000000000000000000000000000000000081526004016104429190611a98565b60405180910390fd5b6003547f000000000000000000000000000000000000000000000000000000000000000073ffffffffffffffffffffffffffffffffffffffff166318160ddd6040518163ffffffff1660e01b815260040160206040518083038186803b1580156104b457600080fd5b505afa1580156104c8573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906104ec9190611858565b856104f79190611dc1565b111561053c576003546040517f3d3dbc830000000000000000000000000000000000000000000000000000000081526004016105339190611d05565b60405180910390fd5b7f000000000000000000000000000000000000000000000000000000000000000073ffffffffffffffffffffffffffffffffffffffff16631e458bee8686846040518463ffffffff1660e01b815260040161059993929190611b81565b600060405180830381600087803b1580156105b357600080fd5b505af11580156105c7573d6000803e3d6000fd5b505050506000838390501115610707578473ffffffffffffffffffffffffffffffffffffffff16633749c51a6040518060a001604052808b8b8080601f016020809104026020016040519081016040528093929190818152602001838380828437600081840152601f19601f8201169050808301925050505050505081526020018981526020018873ffffffffffffffffffffffffffffffffffffffff16815260200187815260200186868080601f016020809104026020016040519081016040528093929190818152602001838380828437600081840152601f19601f820116905080830192505050505050508152506040518263ffffffff1660e01b81526004016106d49190611cc1565b600060405180830381600087803b1580156106ee57600080fd5b505af1158015610702573d6000803e3d6000fd5b505050505b808573ffffffffffffffffffffffffffffffffffffffff16877ff1302855733b40d8acb467ee990b6d56c05c80e28ebcabfa6e6f3f57cb50d6988b8b898989604051610757959493929190611c38565b60405180910390a45050505050505050565b600260009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1681565b600060019054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff163373ffffffffffffffffffffffffffffffffffffffff161461082157336040517f4677a0d30000000000000000000000000000000000000000000000000000000081526004016108189190611a98565b60405180910390fd5b6108296113f0565b565b600160009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1681565b60008060009054906101000a900460ff16905090565b600060019054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff163373ffffffffffffffffffffffffffffffffffffffff16146108f957336040517f4677a0d30000000000000000000000000000000000000000000000000000000081526004016108f09190611a98565b60405180910390fd5b600073ffffffffffffffffffffffffffffffffffffffff168173ffffffffffffffffffffffffffffffffffffffff161415610960576040517fe6c4247b00000000000000000000000000000000000000000000000000000000815260040160405180910390fd5b80600060016101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff1602179055507fd41d83655d484bdf299598751c371b2d92088667266fe3774b25a97bdd5d039733826040516109d2929190611ab3565b60405180910390a150565b600160009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff163373ffffffffffffffffffffffffffffffffffffffff1614610a6f57336040517fff70ace2000000000000000000000000000000000000000000000000000000008152600401610a669190611a98565b60405180910390fd5b8060038190555050565b600260009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff163373ffffffffffffffffffffffffffffffffffffffff1614610b0b57336040517fe700765e000000000000000000000000000000000000000000000000000000008152600401610b029190611a98565b60405180910390fd5b600073ffffffffffffffffffffffffffffffffffffffff16600160009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff161415610b94576040517fe6c4247b00000000000000000000000000000000000000000000000000000000815260040160405180910390fd5b600160009054906101000a900473ffffffffffffffffffffffffffffffffffffffff16600260006101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff160217905550565b600060019054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff163373ffffffffffffffffffffffffffffffffffffffff1614610c8b57336040517f4677a0d3000000000000000000000000000000000000000000000000000000008152600401610c829190611a98565b60405180910390fd5b610c93611491565b565b600160009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff163373ffffffffffffffffffffffffffffffffffffffff1614158015610d415750600260009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff163373ffffffffffffffffffffffffffffffffffffffff1614155b15610d8357336040517fcdfcef97000000000000000000000000000000000000000000000000000000008152600401610d7a9190611a98565b60405180910390fd5b600073ffffffffffffffffffffffffffffffffffffffff168173ffffffffffffffffffffffffffffffffffffffff161415610dea576040517fe6c4247b00000000000000000000000000000000000000000000000000000000815260040160405180910390fd5b80600160006101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff1602179055507fe79965b5c67dcfb2cf5fe152715e4a7256cee62a3d5dd8484fd8a8539eb8beff3382604051610e5c929190611ab3565b60405180910390a150565b610e6f610851565b15610eaf576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401610ea690611ca1565b60405180910390fd5b600160009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff163373ffffffffffffffffffffffffffffffffffffffff1614610f4157336040517fff70ace2000000000000000000000000000000000000000000000000000000008152600401610f389190611a98565b60405180910390fd5b6003547f000000000000000000000000000000000000000000000000000000000000000073ffffffffffffffffffffffffffffffffffffffff166318160ddd6040518163ffffffff1660e01b815260040160206040518083038186803b158015610faa57600080fd5b505afa158015610fbe573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190610fe29190611858565b85610fed9190611dc1565b1115611032576003546040517f3d3dbc830000000000000000000000000000000000000000000000000000000081526004016110299190611d05565b60405180910390fd5b7f000000000000000000000000000000000000000000000000000000000000000073ffffffffffffffffffffffffffffffffffffffff16631e458bee8a86846040518463ffffffff1660e01b815260040161108f93929190611b81565b600060405180830381600087803b1580156110a957600080fd5b505af11580156110bd573d6000803e3d6000fd5b505050506000838390501115611203578873ffffffffffffffffffffffffffffffffffffffff16633ff0693c6040518060c001604052808c73ffffffffffffffffffffffffffffffffffffffff1681526020018b81526020018a8a8080601f016020809104026020016040519081016040528093929190818152602001838380828437600081840152601f19601f82011690508083019250505050505050815260200188815260200187815260200186868080601f016020809104026020016040519081016040528093929190818152602001838380828437600081840152601f19601f820116905080830192505050505050508152506040518263ffffffff1660e01b81526004016111d09190611ce3565b600060405180830381600087803b1580156111ea57600080fd5b505af11580156111fe573d6000803e3d6000fd5b505050505b80857f521fb0b407c2eb9b1375530e9b9a569889992140a688bc076aa72c1712012c888b8b8b8b8a8a8a6040516112409796959493929190611bb8565b60405180910390a3505050505050505050565b60035481565b611261610851565b156112a1576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040161129890611ca1565b60405180910390fd5b7f000000000000000000000000000000000000000000000000000000000000000073ffffffffffffffffffffffffffffffffffffffff166379cc67903383608001356040518363ffffffff1660e01b8152600401611300929190611b58565b600060405180830381600087803b15801561131a57600080fd5b505af115801561132e573d6000803e3d6000fd5b5050505080600001353373ffffffffffffffffffffffffffffffffffffffff167f7ec1c94701e09b1652f3e1d307e60c4b9ebf99aff8c2079fd1d8c585e031c4e4328480602001906113809190611d20565b8660800135876040013588806060019061139a9190611d20565b8a8060a001906113aa9190611d20565b6040516113bf99989796959493929190611adc565b60405180910390a350565b600060019054906101000a900473ffffffffffffffffffffffffffffffffffffffff1681565b6113f8610851565b611437576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040161142e90611c81565b60405180910390fd5b60008060006101000a81548160ff0219169083151502179055507f5db9ee0a495bf2e6ff9c91a7834c1ba4fdd244a5e8aa4e537bd38aeae4b073aa61147a611533565b6040516114879190611a98565b60405180910390a1565b611499610851565b156114d9576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004016114d090611ca1565b60405180910390fd5b60016000806101000a81548160ff0219169083151502179055507f62e78cea01bee320cd4e420270b5ea74000d11b0c9f74754ebdbfc544b05a25861151c611533565b6040516115299190611a98565b60405180910390a1565b600033905090565b60008135905061154a81611f6a565b92915050565b60008135905061155f81611f81565b92915050565b60008083601f84011261157b5761157a611edf565b5b8235905067ffffffffffffffff81111561159857611597611eda565b5b6020830191508360018202830111156115b4576115b3611ef3565b5b9250929050565b600060c082840312156115d1576115d0611ee9565b5b81905092915050565b6000813590506115e981611f98565b92915050565b6000815190506115fe81611f98565b92915050565b60006020828403121561161a57611619611f02565b5b60006116288482850161153b565b91505092915050565b600080600080600080600080600060e08a8c03121561165357611652611f02565b5b60006116618c828d0161153b565b99505060206116728c828d016115da565b98505060408a013567ffffffffffffffff81111561169357611692611efd565b5b61169f8c828d01611565565b975097505060606116b28c828d016115da565b95505060806116c38c828d016115da565b94505060a08a013567ffffffffffffffff8111156116e4576116e3611efd565b5b6116f08c828d01611565565b935093505060c06117038c828d01611550565b9150509295985092959850929598565b60008060008060008060008060c0898b03121561173357611732611f02565b5b600089013567ffffffffffffffff81111561175157611750611efd565b5b61175d8b828c01611565565b985098505060206117708b828c016115da565b96505060406117818b828c0161153b565b95505060606117928b828c016115da565b945050608089013567ffffffffffffffff8111156117b3576117b2611efd565b5b6117bf8b828c01611565565b935093505060a06117d28b828c01611550565b9150509295985092959890939650565b6000602082840312156117f8576117f7611f02565b5b600082013567ffffffffffffffff81111561181657611815611efd565b5b611822848285016115bb565b91505092915050565b60006020828403121561184157611840611f02565b5b600061184f848285016115da565b91505092915050565b60006020828403121561186e5761186d611f02565b5b600061187c848285016115ef565b91505092915050565b61188e81611e17565b82525050565b61189d81611e17565b82525050565b6118ac81611e29565b82525050565b6118bb81611e35565b82525050565b60006118cd8385611d9f565b93506118da838584611e69565b6118e383611f07565b840190509392505050565b60006118f982611d83565b6119038185611d8e565b9350611913818560208601611e78565b61191c81611f07565b840191505092915050565b6000611934601483611db0565b915061193f82611f18565b602082019050919050565b6000611957601083611db0565b915061196282611f41565b602082019050919050565b600060a083016000830151848203600086015261198a82826118ee565b915050602083015161199f6020860182611a7a565b5060408301516119b26040860182611885565b5060608301516119c56060860182611a7a565b50608083015184820360808601526119dd82826118ee565b9150508091505092915050565b600060c083016000830151611a026000860182611885565b506020830151611a156020860182611a7a565b5060408301518482036040860152611a2d82826118ee565b9150506060830151611a426060860182611a7a565b506080830151611a556080860182611a7a565b5060a083015184820360a0860152611a6d82826118ee565b9150508091505092915050565b611a8381611e5f565b82525050565b611a9281611e5f565b82525050565b6000602082019050611aad6000830184611894565b92915050565b6000604082019050611ac86000830185611894565b611ad56020830184611894565b9392505050565b600060c082019050611af1600083018c611894565b8181036020830152611b04818a8c6118c1565b9050611b136040830189611a89565b611b206060830188611a89565b8181036080830152611b338186886118c1565b905081810360a0830152611b488184866118c1565b90509a9950505050505050505050565b6000604082019050611b6d6000830185611894565b611b7a6020830184611a89565b9392505050565b6000606082019050611b966000830186611894565b611ba36020830185611a89565b611bb060408301846118b2565b949350505050565b600060a082019050611bcd600083018a611894565b611bda6020830189611a89565b8181036040830152611bed8187896118c1565b9050611bfc6060830186611a89565b8181036080830152611c0f8184866118c1565b905098975050505050505050565b6000602082019050611c3260008301846118a3565b92915050565b60006060820190508181036000830152611c538187896118c1565b9050611c626020830186611a89565b8181036040830152611c758184866118c1565b90509695505050505050565b60006020820190508181036000830152611c9a81611927565b9050919050565b60006020820190508181036000830152611cba8161194a565b9050919050565b60006020820190508181036000830152611cdb818461196d565b905092915050565b60006020820190508181036000830152611cfd81846119ea565b905092915050565b6000602082019050611d1a6000830184611a89565b92915050565b60008083356001602003843603038112611d3d57611d3c611eee565b5b80840192508235915067ffffffffffffffff821115611d5f57611d5e611ee4565b5b602083019250600182023603831315611d7b57611d7a611ef8565b5b509250929050565b600081519050919050565b600082825260208201905092915050565b600082825260208201905092915050565b600082825260208201905092915050565b6000611dcc82611e5f565b9150611dd783611e5f565b9250827fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff03821115611e0c57611e0b611eab565b5b828201905092915050565b6000611e2282611e3f565b9050919050565b60008115159050919050565b6000819050919050565b600073ffffffffffffffffffffffffffffffffffffffff82169050919050565b6000819050919050565b82818337600083830152505050565b60005b83811015611e96578082015181840152602081019050611e7b565b83811115611ea5576000848401525b50505050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052601160045260246000fd5b600080fd5b600080fd5b600080fd5b600080fd5b600080fd5b600080fd5b600080fd5b600080fd5b600080fd5b6000601f19601f8301169050919050565b7f5061757361626c653a206e6f7420706175736564000000000000000000000000600082015250565b7f5061757361626c653a2070617573656400000000000000000000000000000000600082015250565b611f7381611e17565b8114611f7e57600080fd5b50565b611f8a81611e35565b8114611f9557600080fd5b50565b611fa181611e5f565b8114611fac57600080fd5b5056fea264697066735822122026e075a0329747f85269f5d9d020ef49f1b1599f4c1ed2ca912d2621aec8339c64736f6c63430008070033";

type VersaConnectorNonEthConstructorParams =
  | [signer?: Signer]
  | ConstructorParameters<typeof ContractFactory>;

const isSuperArgs = (
  xs: VersaConnectorNonEthConstructorParams
): xs is ConstructorParameters<typeof ContractFactory> => xs.length > 1;

export class VersaConnectorNonEth__factory extends ContractFactory {
  constructor(...args: VersaConnectorNonEthConstructorParams) {
    if (isSuperArgs(args)) {
      super(...args);
    } else {
      super(_abi, _bytecode, args[0]);
    }
  }

  override deploy(
    VersaTokenAddress_: string,
    tssAddress_: string,
    tssAddressUpdater_: string,
    pauserAddress_: string,
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<VersaConnectorNonEth> {
    return super.deploy(
      VersaTokenAddress_,
      tssAddress_,
      tssAddressUpdater_,
      pauserAddress_,
      overrides || {}
    ) as Promise<VersaConnectorNonEth>;
  }
  override getDeployTransaction(
    VersaTokenAddress_: string,
    tssAddress_: string,
    tssAddressUpdater_: string,
    pauserAddress_: string,
    overrides?: Overrides & { from?: string | Promise<string> }
  ): TransactionRequest {
    return super.getDeployTransaction(
      VersaTokenAddress_,
      tssAddress_,
      tssAddressUpdater_,
      pauserAddress_,
      overrides || {}
    );
  }
  override attach(address: string): VersaConnectorNonEth {
    return super.attach(address) as VersaConnectorNonEth;
  }
  override connect(signer: Signer): VersaConnectorNonEth__factory {
    return super.connect(signer) as VersaConnectorNonEth__factory;
  }

  static readonly bytecode = _bytecode;
  static readonly abi = _abi;
  static createInterface(): VersaConnectorNonEthInterface {
    return new utils.Interface(_abi) as VersaConnectorNonEthInterface;
  }
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): VersaConnectorNonEth {
    return new Contract(address, _abi, signerOrProvider) as VersaConnectorNonEth;
  }
}
