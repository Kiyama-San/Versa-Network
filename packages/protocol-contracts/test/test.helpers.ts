import { VersaTokenConsumer__factory } from "@Versachain/interfaces/typechain-types";
import { BigNumber, ContractReceipt } from "ethers";

type CustomErrorParamType = BigNumber | number | string;
export const getCustomErrorMessage = (errorMethod: string, params?: [CustomErrorParamType]) => {
  const stringParams = params
    ? params
        .map((p: CustomErrorParamType) => {
          if (typeof p === "number") {
            return p;
          }

          return `"${p.toString()}"`;
        })
        .join(", ")
    : "";
  return `VM Exception while processing transaction: reverted with custom error '${errorMethod}(${stringParams})'`;
};

export const parseVersaConsumerLog = (logs: ContractReceipt["logs"]) => {
  const iface = VersaTokenConsumer__factory.createInterface();

  const eventNames = logs.map((log) => {
    try {
      const parsedLog = iface.parseLog(log);

      return parsedLog.name;
    } catch (e: any) {
      return "NO_Versa_LOG";
    }
  });

  return eventNames;
};
