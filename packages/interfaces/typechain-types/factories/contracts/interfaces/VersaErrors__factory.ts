/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */

import { Contract, Signer, utils } from "ethers";
import type { Provider } from "@ethersproject/providers";
import type {
  VersaErrors,
  VersaErrorsInterface,
} from "../../../contracts/interfaces/VersaErrors";

const _abi = [
  {
    inputs: [
      {
        internalType: "address",
        name: "caller",
        type: "address",
      },
    ],
    name: "CallerIsNotConnector",
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
    inputs: [],
    name: "InvalidAddress",
    type: "error",
  },
  {
    inputs: [],
    name: "VersaTransferError",
    type: "error",
  },
];

export class VersaErrors__factory {
  static readonly abi = _abi;
  static createInterface(): VersaErrorsInterface {
    return new utils.Interface(_abi) as VersaErrorsInterface;
  }
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): VersaErrors {
    return new Contract(address, _abi, signerOrProvider) as VersaErrors;
  }
}
