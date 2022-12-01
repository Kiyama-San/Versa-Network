/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import {
  Signer,
  utils,
  Contract,
  ContractFactory,
  BigNumberish,
  Overrides,
} from "ethers";
import type { Provider, TransactionRequest } from "@ethersproject/providers";
import type {
  VersaTokenConsumerUniV3,
  VersaTokenConsumerUniV3Interface,
} from "../../../contracts/VersaTokenConsumerUniV3.strategy.sol/VersaTokenConsumerUniV3";

const _abi = [
  {
    inputs: [
      {
        internalType: "address",
        name: "VersaToken_",
        type: "address",
      },
      {
        internalType: "address",
        name: "uniswapV3Router_",
        type: "address",
      },
      {
        internalType: "address",
        name: "quoter_",
        type: "address",
      },
      {
        internalType: "address",
        name: "WETH9Address_",
        type: "address",
      },
      {
        internalType: "uint24",
        name: "VersaPoolFee_",
        type: "uint24",
      },
      {
        internalType: "uint24",
        name: "tokenPoolFee_",
        type: "uint24",
      },
    ],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    inputs: [],
    name: "ErrorSendingETH",
    type: "error",
  },
  {
    inputs: [],
    name: "InputCantBeZero",
    type: "error",
  },
  {
    inputs: [],
    name: "InvalidAddress",
    type: "error",
  },
  {
    inputs: [],
    name: "ReentrancyError",
    type: "error",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "uint256",
        name: "amountIn",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "amountOut",
        type: "uint256",
      },
    ],
    name: "EthExchangedForVersa",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "address",
        name: "token",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "amountIn",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "amountOut",
        type: "uint256",
      },
    ],
    name: "TokenExchangedForVersa",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "uint256",
        name: "amountIn",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "amountOut",
        type: "uint256",
      },
    ],
    name: "VersaExchangedForEth",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "address",
        name: "token",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "amountIn",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "amountOut",
        type: "uint256",
      },
    ],
    name: "VersaExchangedForToken",
    type: "event",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "destinationAddress",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "minAmountOut",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "VersaTokenAmount",
        type: "uint256",
      },
    ],
    name: "getEthFromVersa",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "destinationAddress",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "minAmountOut",
        type: "uint256",
      },
      {
        internalType: "address",
        name: "outputToken",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "VersaTokenAmount",
        type: "uint256",
      },
    ],
    name: "getTokenFromVersa",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "destinationAddress",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "minAmountOut",
        type: "uint256",
      },
    ],
    name: "getVersaFromEth",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "destinationAddress",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "minAmountOut",
        type: "uint256",
      },
      {
        internalType: "address",
        name: "inputToken",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "inputTokenAmount",
        type: "uint256",
      },
    ],
    name: "getVersaFromToken",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "quoter",
    outputs: [
      {
        internalType: "contract IQuoter",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "tokenPoolFee",
    outputs: [
      {
        internalType: "uint24",
        name: "",
        type: "uint24",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "uniswapV3Router",
    outputs: [
      {
        internalType: "contract ISwapRouter",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "VersaPoolFee",
    outputs: [
      {
        internalType: "uint24",
        name: "",
        type: "uint24",
      },
    ],
    stateMutability: "view",
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
  {
    stateMutability: "payable",
    type: "receive",
  },
];

const _bytecode =
  "0x6101406040523480156200001257600080fd5b50604051620025af380380620025af83398181016040528101906200003891906200028a565b600073ffffffffffffffffffffffffffffffffffffffff168673ffffffffffffffffffffffffffffffffffffffff161480620000a05750600073ffffffffffffffffffffffffffffffffffffffff168573ffffffffffffffffffffffffffffffffffffffff16145b80620000d85750600073ffffffffffffffffffffffffffffffffffffffff168473ffffffffffffffffffffffffffffffffffffffff16145b80620001105750600073ffffffffffffffffffffffffffffffffffffffff168373ffffffffffffffffffffffffffffffffffffffff16145b1562000148576040517fe6c4247b00000000000000000000000000000000000000000000000000000000815260040160405180910390fd5b8573ffffffffffffffffffffffffffffffffffffffff1660e08173ffffffffffffffffffffffffffffffffffffffff1660601b815250508473ffffffffffffffffffffffffffffffffffffffff166101008173ffffffffffffffffffffffffffffffffffffffff1660601b815250508373ffffffffffffffffffffffffffffffffffffffff166101208173ffffffffffffffffffffffffffffffffffffffff1660601b815250508273ffffffffffffffffffffffffffffffffffffffff1660c08173ffffffffffffffffffffffffffffffffffffffff1660601b815250508162ffffff1660808162ffffff1660e81b815250508062ffffff1660a08162ffffff1660e81b81525050505050505050620003a2565b6000815190506200026d816200036e565b92915050565b600081519050620002848162000388565b92915050565b60008060008060008060c08789031215620002aa57620002a962000369565b5b6000620002ba89828a016200025c565b9650506020620002cd89828a016200025c565b9550506040620002e089828a016200025c565b9450506060620002f389828a016200025c565b93505060806200030689828a0162000273565b92505060a06200031989828a0162000273565b9150509295509295509295565b600062000333826200033a565b9050919050565b600073ffffffffffffffffffffffffffffffffffffffff82169050919050565b600062ffffff82169050919050565b600080fd5b620003798162000326565b81146200038557600080fd5b50565b62000393816200035a565b81146200039f57600080fd5b50565b60805160e81c60a05160e81c60c05160601c60e05160601c6101005160601c6101205160601c6120fc620004b360003960006111400152600081816104030152818161062301528181610761015281816108560152818161099101528181610b0301528181610ed30152611031015260008181610343015281816104f5015281816106dc01528181610947015281816109b301528181610a0701528181610e8901528181610ef50152610f480152600081816103070152818161069a01528181610a4301528181610bb00152610f8a01526000818161067901528181610d240152610fab01526000818161037f015281816106bb0152818161087a01528181610a7f0152610f6901526120fc6000f3fe60806040526004361061008a5760003560e01c80633cbd7005116100595780633cbd70051461015957806354c49a2a146101845780635d9dfdde146101c1578063a53fb10b146101ec578063c6bbd5a71461022957610091565b8063013b2ff81461009657806321e093b1146100c65780632405620a146100f15780632c76d7a61461012e57610091565b3661009157005b600080fd5b6100b060048036038101906100ab919061161a565b610254565b6040516100bd9190611d24565b60405180910390f35b3480156100d257600080fd5b506100db6104f3565b6040516100e89190611b18565b60405180910390f35b3480156100fd57600080fd5b506101186004803603810190610113919061165a565b610517565b6040516101259190611d24565b60405180910390f35b34801561013a57600080fd5b50610143610854565b6040516101509190611c0e565b60405180910390f35b34801561016557600080fd5b5061016e610878565b60405161017b9190611d09565b60405180910390f35b34801561019057600080fd5b506101ab60048036038101906101a691906116c1565b61089c565b6040516101b89190611d24565b60405180910390f35b3480156101cd57600080fd5b506101d6610d22565b6040516101e39190611d09565b60405180910390f35b3480156101f857600080fd5b50610213600480360381019061020e919061165a565b610d46565b6040516102209190611d24565b60405180910390f35b34801561023557600080fd5b5061023e61113e565b60405161024b9190611bf3565b60405180910390f35b60008073ffffffffffffffffffffffffffffffffffffffff168373ffffffffffffffffffffffffffffffffffffffff1614156102bc576040517fe6c4247b00000000000000000000000000000000000000000000000000000000815260040160405180910390fd5b60003414156102f7576040517fb813f54900000000000000000000000000000000000000000000000000000000815260040160405180910390fd5b60006040518061010001604052807f000000000000000000000000000000000000000000000000000000000000000073ffffffffffffffffffffffffffffffffffffffff1681526020017f000000000000000000000000000000000000000000000000000000000000000073ffffffffffffffffffffffffffffffffffffffff1681526020017f000000000000000000000000000000000000000000000000000000000000000062ffffff1681526020018573ffffffffffffffffffffffffffffffffffffffff16815260200160c8426103d19190611dab565b8152602001348152602001848152602001600073ffffffffffffffffffffffffffffffffffffffff16815250905060007f000000000000000000000000000000000000000000000000000000000000000073ffffffffffffffffffffffffffffffffffffffff1663414bf38934846040518363ffffffff1660e01b815260040161045b9190611ced565b6020604051808303818588803b15801561047457600080fd5b505af1158015610488573d6000803e3d6000fd5b50505050506040513d601f19601f820116820180604052508101906104ad9190611741565b90507f87890b0a30955b1db16cc894fbe24779ae05d9f337bfe8b6dfc0809b5bf9da1134826040516104e0929190611d3f565b60405180910390a1809250505092915050565b7f000000000000000000000000000000000000000000000000000000000000000081565b60008073ffffffffffffffffffffffffffffffffffffffff168573ffffffffffffffffffffffffffffffffffffffff16148061057f5750600073ffffffffffffffffffffffffffffffffffffffff168373ffffffffffffffffffffffffffffffffffffffff16145b156105b6576040517fe6c4247b00000000000000000000000000000000000000000000000000000000815260040160405180910390fd5b60008214156105f1576040517fb813f54900000000000000000000000000000000000000000000000000000000815260040160405180910390fd5b61061e3330848673ffffffffffffffffffffffffffffffffffffffff16611162909392919063ffffffff16565b6106697f0000000000000000000000000000000000000000000000000000000000000000838573ffffffffffffffffffffffffffffffffffffffff166111eb9092919063ffffffff16565b60006040518060a00160405280857f00000000000000000000000000000000000000000000000000000000000000007f00000000000000000000000000000000000000000000000000000000000000007f00000000000000000000000000000000000000000000000000000000000000007f000000000000000000000000000000000000000000000000000000000000000060405160200161070f959493929190611a8d565b60405160208183030381529060405281526020018773ffffffffffffffffffffffffffffffffffffffff16815260200160c84261074c9190611dab565b815260200184815260200186815250905060007f000000000000000000000000000000000000000000000000000000000000000073ffffffffffffffffffffffffffffffffffffffff1663c04b8d59836040518263ffffffff1660e01b81526004016107b89190611ccb565b602060405180830381600087803b1580156107d257600080fd5b505af11580156107e6573d6000803e3d6000fd5b505050506040513d601f19601f8201168201806040525081019061080a9190611741565b90507f017190d3d99ee6d8dd0604ef1e71ff9802810c6485f57c9b2ed6169848dd119f85858360405161083f93929190611bbc565b60405180910390a18092505050949350505050565b7f000000000000000000000000000000000000000000000000000000000000000081565b7f000000000000000000000000000000000000000000000000000000000000000081565b60008073ffffffffffffffffffffffffffffffffffffffff168473ffffffffffffffffffffffffffffffffffffffff161415610904576040517fe6c4247b00000000000000000000000000000000000000000000000000000000815260040160405180910390fd5b600082141561093f576040517fb813f54900000000000000000000000000000000000000000000000000000000815260040160405180910390fd5b61098c3330847f000000000000000000000000000000000000000000000000000000000000000073ffffffffffffffffffffffffffffffffffffffff16611162909392919063ffffffff16565b6109f77f0000000000000000000000000000000000000000000000000000000000000000837f000000000000000000000000000000000000000000000000000000000000000073ffffffffffffffffffffffffffffffffffffffff166111eb9092919063ffffffff16565b60006040518061010001604052807f000000000000000000000000000000000000000000000000000000000000000073ffffffffffffffffffffffffffffffffffffffff1681526020017f000000000000000000000000000000000000000000000000000000000000000073ffffffffffffffffffffffffffffffffffffffff1681526020017f000000000000000000000000000000000000000000000000000000000000000062ffffff1681526020013073ffffffffffffffffffffffffffffffffffffffff16815260200160c842610ad19190611dab565b8152602001848152602001858152602001600073ffffffffffffffffffffffffffffffffffffffff16815250905060007f000000000000000000000000000000000000000000000000000000000000000073ffffffffffffffffffffffffffffffffffffffff1663414bf389836040518263ffffffff1660e01b8152600401610b5a9190611ced565b602060405180830381600087803b158015610b7457600080fd5b505af1158015610b88573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190610bac9190611741565b90507f000000000000000000000000000000000000000000000000000000000000000073ffffffffffffffffffffffffffffffffffffffff16632e1a7d4d826040518263ffffffff1660e01b8152600401610c079190611d24565b600060405180830381600087803b158015610c2157600080fd5b505af1158015610c35573d6000803e3d6000fd5b505050507f74e171117e91660f493740924d8bad0caf48dc4fbccb767fb05935397a2c17ae8482604051610c6a929190611d3f565b60405180910390a160008673ffffffffffffffffffffffffffffffffffffffff1682604051610c9890611b03565b60006040518083038185875af1925050503d8060008114610cd5576040519150601f19603f3d011682016040523d82523d6000602084013e610cda565b606091505b5050905080610d15576040517f3794aeaf00000000000000000000000000000000000000000000000000000000815260040160405180910390fd5b8193505050509392505050565b7f000000000000000000000000000000000000000000000000000000000000000081565b60008060009054906101000a900460ff1615610d8e576040517f29f745a700000000000000000000000000000000000000000000000000000000815260040160405180910390fd5b60016000806101000a81548160ff021916908315150217905550600073ffffffffffffffffffffffffffffffffffffffff168573ffffffffffffffffffffffffffffffffffffffff161480610e0f5750600073ffffffffffffffffffffffffffffffffffffffff168373ffffffffffffffffffffffffffffffffffffffff16145b15610e46576040517fe6c4247b00000000000000000000000000000000000000000000000000000000815260040160405180910390fd5b6000821415610e81576040517fb813f54900000000000000000000000000000000000000000000000000000000815260040160405180910390fd5b610ece3330847f000000000000000000000000000000000000000000000000000000000000000073ffffffffffffffffffffffffffffffffffffffff16611162909392919063ffffffff16565b610f397f0000000000000000000000000000000000000000000000000000000000000000837f000000000000000000000000000000000000000000000000000000000000000073ffffffffffffffffffffffffffffffffffffffff166111eb9092919063ffffffff16565b60006040518060a001604052807f00000000000000000000000000000000000000000000000000000000000000007f00000000000000000000000000000000000000000000000000000000000000007f00000000000000000000000000000000000000000000000000000000000000007f000000000000000000000000000000000000000000000000000000000000000089604051602001610fdf959493929190611a8d565b60405160208183030381529060405281526020018773ffffffffffffffffffffffffffffffffffffffff16815260200160c84261101c9190611dab565b815260200184815260200186815250905060007f000000000000000000000000000000000000000000000000000000000000000073ffffffffffffffffffffffffffffffffffffffff1663c04b8d59836040518263ffffffff1660e01b81526004016110889190611ccb565b602060405180830381600087803b1580156110a257600080fd5b505af11580156110b6573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906110da9190611741565b90507f0a7cb8f6e1d29e616c1209a3f418c17b3a9137005377f6dd072217b1ede2573b85858360405161110f93929190611bbc565b60405180910390a1809250505060008060006101000a81548160ff021916908315150217905550949350505050565b7f000000000000000000000000000000000000000000000000000000000000000081565b6111e5846323b872dd60e01b85858560405160240161118393929190611b5c565b604051602081830303815290604052907bffffffffffffffffffffffffffffffffffffffffffffffffffffffff19166020820180517bffffffffffffffffffffffffffffffffffffffffffffffffffffffff8381831617835250505050611349565b50505050565b6000811480611284575060008373ffffffffffffffffffffffffffffffffffffffff1663dd62ed3e30856040518363ffffffff1660e01b8152600401611232929190611b33565b60206040518083038186803b15801561124a57600080fd5b505afa15801561125e573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906112829190611741565b145b6112c3576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004016112ba90611cab565b60405180910390fd5b6113448363095ea7b360e01b84846040516024016112e2929190611b93565b604051602081830303815290604052907bffffffffffffffffffffffffffffffffffffffffffffffffffffffff19166020820180517bffffffffffffffffffffffffffffffffffffffffffffffffffffffff8381831617835250505050611349565b505050565b60006113ab826040518060400160405280602081526020017f5361666545524332303a206c6f772d6c6576656c2063616c6c206661696c65648152508573ffffffffffffffffffffffffffffffffffffffff166114109092919063ffffffff16565b905060008151111561140b57808060200190518101906113cb9190611714565b61140a576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040161140190611c8b565b60405180910390fd5b5b505050565b606061141f8484600085611428565b90509392505050565b60608247101561146d576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040161146490611c4b565b60405180910390fd5b6114768561153c565b6114b5576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004016114ac90611c6b565b60405180910390fd5b6000808673ffffffffffffffffffffffffffffffffffffffff1685876040516114de9190611aec565b60006040518083038185875af1925050503d806000811461151b576040519150601f19603f3d011682016040523d82523d6000602084013e611520565b606091505b509150915061153082828661155f565b92505050949350505050565b6000808273ffffffffffffffffffffffffffffffffffffffff163b119050919050565b6060831561156f578290506115bf565b6000835111156115825782518084602001fd5b816040517f08c379a00000000000000000000000000000000000000000000000000000000081526004016115b69190611c29565b60405180910390fd5b9392505050565b6000813590506115d581612081565b92915050565b6000815190506115ea81612098565b92915050565b6000813590506115ff816120af565b92915050565b600081519050611614816120af565b92915050565b6000806040838503121561163157611630611f38565b5b600061163f858286016115c6565b9250506020611650858286016115f0565b9150509250929050565b6000806000806080858703121561167457611673611f38565b5b6000611682878288016115c6565b9450506020611693878288016115f0565b93505060406116a4878288016115c6565b92505060606116b5878288016115f0565b91505092959194509250565b6000806000606084860312156116da576116d9611f38565b5b60006116e8868287016115c6565b93505060206116f9868287016115f0565b925050604061170a868287016115f0565b9150509250925092565b60006020828403121561172a57611729611f38565b5b6000611738848285016115db565b91505092915050565b60006020828403121561175757611756611f38565b5b600061176584828501611605565b91505092915050565b61177781611e01565b82525050565b61178681611e01565b82525050565b61179d61179882611e01565b611ed3565b82525050565b60006117ae82611d68565b6117b88185611d7e565b93506117c8818560208601611ea0565b6117d181611f3d565b840191505092915050565b60006117e782611d68565b6117f18185611d8f565b9350611801818560208601611ea0565b80840191505092915050565b61181681611e58565b82525050565b61182581611e6a565b82525050565b600061183682611d73565b6118408185611d9a565b9350611850818560208601611ea0565b61185981611f3d565b840191505092915050565b6000611871602683611d9a565b915061187c82611f68565b604082019050919050565b6000611894600083611d8f565b915061189f82611fb7565b600082019050919050565b60006118b7601d83611d9a565b91506118c282611fba565b602082019050919050565b60006118da602a83611d9a565b91506118e582611fe3565b604082019050919050565b60006118fd603683611d9a565b915061190882612032565b604082019050919050565b600060a083016000830151848203600086015261193082826117a3565b9150506020830151611945602086018261176e565b5060408301516119586040860182611a6f565b50606083015161196b6060860182611a6f565b50608083015161197e6080860182611a6f565b508091505092915050565b610100820160008201516119a0600085018261176e565b5060208201516119b3602085018261176e565b5060408201516119c66040850182611a3a565b5060608201516119d9606085018261176e565b5060808201516119ec6080850182611a6f565b5060a08201516119ff60a0850182611a6f565b5060c0820151611a1260c0850182611a6f565b5060e0820151611a2560e0850182611a2b565b50505050565b611a3481611e1f565b82525050565b611a4381611e3f565b82525050565b611a5281611e3f565b82525050565b611a69611a6482611e3f565b611ef7565b82525050565b611a7881611e4e565b82525050565b611a8781611e4e565b82525050565b6000611a99828861178c565b601482019150611aa98287611a58565b600382019150611ab9828661178c565b601482019150611ac98285611a58565b600382019150611ad9828461178c565b6014820191508190509695505050505050565b6000611af882846117dc565b915081905092915050565b6000611b0e82611887565b9150819050919050565b6000602082019050611b2d600083018461177d565b92915050565b6000604082019050611b48600083018561177d565b611b55602083018461177d565b9392505050565b6000606082019050611b71600083018661177d565b611b7e602083018561177d565b611b8b6040830184611a7e565b949350505050565b6000604082019050611ba8600083018561177d565b611bb56020830184611a7e565b9392505050565b6000606082019050611bd1600083018661177d565b611bde6020830185611a7e565b611beb6040830184611a7e565b949350505050565b6000602082019050611c08600083018461180d565b92915050565b6000602082019050611c23600083018461181c565b92915050565b60006020820190508181036000830152611c43818461182b565b905092915050565b60006020820190508181036000830152611c6481611864565b9050919050565b60006020820190508181036000830152611c84816118aa565b9050919050565b60006020820190508181036000830152611ca4816118cd565b9050919050565b60006020820190508181036000830152611cc4816118f0565b9050919050565b60006020820190508181036000830152611ce58184611913565b905092915050565b600061010082019050611d036000830184611989565b92915050565b6000602082019050611d1e6000830184611a49565b92915050565b6000602082019050611d396000830184611a7e565b92915050565b6000604082019050611d546000830185611a7e565b611d616020830184611a7e565b9392505050565b600081519050919050565b600081519050919050565b600082825260208201905092915050565b600081905092915050565b600082825260208201905092915050565b6000611db682611e4e565b9150611dc183611e4e565b9250827fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff03821115611df657611df5611f09565b5b828201905092915050565b6000611e0c82611e1f565b9050919050565b60008115159050919050565b600073ffffffffffffffffffffffffffffffffffffffff82169050919050565b600062ffffff82169050919050565b6000819050919050565b6000611e6382611e7c565b9050919050565b6000611e7582611e7c565b9050919050565b6000611e8782611e8e565b9050919050565b6000611e9982611e1f565b9050919050565b60005b83811015611ebe578082015181840152602081019050611ea3565b83811115611ecd576000848401525b50505050565b6000611ede82611ee5565b9050919050565b6000611ef082611f5b565b9050919050565b6000611f0282611f4e565b9050919050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052601160045260246000fd5b600080fd5b6000601f19601f8301169050919050565b60008160e81b9050919050565b60008160601b9050919050565b7f416464726573733a20696e73756666696369656e742062616c616e636520666f60008201527f722063616c6c0000000000000000000000000000000000000000000000000000602082015250565b50565b7f416464726573733a2063616c6c20746f206e6f6e2d636f6e7472616374000000600082015250565b7f5361666545524332303a204552433230206f7065726174696f6e20646964206e60008201527f6f74207375636365656400000000000000000000000000000000000000000000602082015250565b7f5361666545524332303a20617070726f76652066726f6d206e6f6e2d7a65726f60008201527f20746f206e6f6e2d7a65726f20616c6c6f77616e636500000000000000000000602082015250565b61208a81611e01565b811461209557600080fd5b50565b6120a181611e13565b81146120ac57600080fd5b50565b6120b881611e4e565b81146120c357600080fd5b5056fea264697066735822122028effbcd83dac6e039c3988574ddee3db7f7c68ef58a7545ca1c974c999d8a4d64736f6c63430008070033";

type VersaTokenConsumerUniV3ConstructorParams =
  | [signer?: Signer]
  | ConstructorParameters<typeof ContractFactory>;

const isSuperArgs = (
  xs: VersaTokenConsumerUniV3ConstructorParams
): xs is ConstructorParameters<typeof ContractFactory> => xs.length > 1;

export class VersaTokenConsumerUniV3__factory extends ContractFactory {
  constructor(...args: VersaTokenConsumerUniV3ConstructorParams) {
    if (isSuperArgs(args)) {
      super(...args);
    } else {
      super(_abi, _bytecode, args[0]);
    }
  }

  override deploy(
    VersaToken_: string,
    uniswapV3Router_: string,
    quoter_: string,
    WETH9Address_: string,
    VersaPoolFee_: BigNumberish,
    tokenPoolFee_: BigNumberish,
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<VersaTokenConsumerUniV3> {
    return super.deploy(
      VersaToken_,
      uniswapV3Router_,
      quoter_,
      WETH9Address_,
      VersaPoolFee_,
      tokenPoolFee_,
      overrides || {}
    ) as Promise<VersaTokenConsumerUniV3>;
  }
  override getDeployTransaction(
    VersaToken_: string,
    uniswapV3Router_: string,
    quoter_: string,
    WETH9Address_: string,
    VersaPoolFee_: BigNumberish,
    tokenPoolFee_: BigNumberish,
    overrides?: Overrides & { from?: string | Promise<string> }
  ): TransactionRequest {
    return super.getDeployTransaction(
      VersaToken_,
      uniswapV3Router_,
      quoter_,
      WETH9Address_,
      VersaPoolFee_,
      tokenPoolFee_,
      overrides || {}
    );
  }
  override attach(address: string): VersaTokenConsumerUniV3 {
    return super.attach(address) as VersaTokenConsumerUniV3;
  }
  override connect(signer: Signer): VersaTokenConsumerUniV3__factory {
    return super.connect(signer) as VersaTokenConsumerUniV3__factory;
  }

  static readonly bytecode = _bytecode;
  static readonly abi = _abi;
  static createInterface(): VersaTokenConsumerUniV3Interface {
    return new utils.Interface(_abi) as VersaTokenConsumerUniV3Interface;
  }
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): VersaTokenConsumerUniV3 {
    return new Contract(
      address,
      _abi,
      signerOrProvider
    ) as VersaTokenConsumerUniV3;
  }
}
