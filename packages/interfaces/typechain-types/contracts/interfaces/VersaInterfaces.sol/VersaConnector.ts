/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import type {
  BaseContract,
  BigNumber,
  BigNumberish,
  BytesLike,
  CallOverrides,
  ContractTransaction,
  Overrides,
  PopulatedTransaction,
  Signer,
  utils,
} from "ethers";
import type { FunctionFragment, Result } from "@ethersproject/abi";
import type { Listener, Provider } from "@ethersproject/providers";
import type {
  TypedEventFilter,
  TypedEvent,
  TypedListener,
  OnEvent,
} from "../../../common";

export declare namespace VersaInterfaces {
  export type SendInputStruct = {
    destinationChainId: BigNumberish;
    destinationAddress: BytesLike;
    destinationGasLimit: BigNumberish;
    message: BytesLike;
    VersaValueAndGas: BigNumberish;
    VersaParams: BytesLike;
  };

  export type SendInputStructOutput = [
    BigNumber,
    string,
    BigNumber,
    string,
    BigNumber,
    string
  ] & {
    destinationChainId: BigNumber;
    destinationAddress: string;
    destinationGasLimit: BigNumber;
    message: string;
    VersaValueAndGas: BigNumber;
    VersaParams: string;
  };
}

export interface VersaConnectorInterface extends utils.Interface {
  functions: {
    "send((uint256,bytes,uint256,bytes,uint256,bytes))": FunctionFragment;
  };

  getFunction(nameOrSignatureOrTopic: "send"): FunctionFragment;

  encodeFunctionData(
    functionFragment: "send",
    values: [VersaInterfaces.SendInputStruct]
  ): string;

  decodeFunctionResult(functionFragment: "send", data: BytesLike): Result;

  events: {};
}

export interface VersaConnector extends BaseContract {
  connect(signerOrProvider: Signer | Provider | string): this;
  attach(addressOrName: string): this;
  deployed(): Promise<this>;

  interface: VersaConnectorInterface;

  queryFilter<TEvent extends TypedEvent>(
    event: TypedEventFilter<TEvent>,
    fromBlockOrBlockhash?: string | number | undefined,
    toBlock?: string | number | undefined
  ): Promise<Array<TEvent>>;

  listeners<TEvent extends TypedEvent>(
    eventFilter?: TypedEventFilter<TEvent>
  ): Array<TypedListener<TEvent>>;
  listeners(eventName?: string): Array<Listener>;
  removeAllListeners<TEvent extends TypedEvent>(
    eventFilter: TypedEventFilter<TEvent>
  ): this;
  removeAllListeners(eventName?: string): this;
  off: OnEvent<this>;
  on: OnEvent<this>;
  once: OnEvent<this>;
  removeListener: OnEvent<this>;

  functions: {
    send(
      input: VersaInterfaces.SendInputStruct,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;
  };

  send(
    input: VersaInterfaces.SendInputStruct,
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  callStatic: {
    send(
      input: VersaInterfaces.SendInputStruct,
      overrides?: CallOverrides
    ): Promise<void>;
  };

  filters: {};

  estimateGas: {
    send(
      input: VersaInterfaces.SendInputStruct,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;
  };

  populateTransaction: {
    send(
      input: VersaInterfaces.SendInputStruct,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;
  };
}