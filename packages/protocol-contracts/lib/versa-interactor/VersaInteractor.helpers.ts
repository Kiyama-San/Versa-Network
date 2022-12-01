import { VersaInteractorMock, VersaInteractorMock__factory } from "../../typechain-types";
import { getContract } from "../contracts.helpers";

export const getVersaInteractorMock = async (VersaToken: string) =>
  getContract<VersaInteractorMock__factory, VersaInteractorMock>({
    contractName: "VersaInteractorMock",
    deployParams: [VersaToken],
  });
