import { Network, NetworkInfo } from './models/network.js';
import {
  checkPathExists, createDir, deleteDir, writeToFileFromBase64,
} from '../utils/fs_helper.js';
import {
  LARCH_DEFAULT_PROVIDER_NAME,
  ZOMBIENET_NETWORKS_COLLECTION_DIR, ZOMBIENET_VERSION,
} from '../config.js';
import { ExecRun } from './models/exec_run.js';
import { runZombienet } from './zombienet.js';
import { AppError } from '../utils/declaration.js';

const getNetworkPath = (networkName: string): string => `${ZOMBIENET_NETWORKS_COLLECTION_DIR}/${networkName}`;

export const updateNetworkStatus = async (id: any): Promise<void> => {
  const network = new Network();
  const execRun = new ExecRun(id);
  const statusCode = await execRun.showNetworkState(id);
  let state: string = 'failed';
  if (statusCode === 0) {
    state = 'running';
  }
  if (statusCode === 1) {
    state = 'in-progress';
  }
  await network.updateStatus(id, state);
};

export const runZombienetForTest = async (
  networkName: string,
): Promise<void> => {
  const network = new Network();
  const result = await network.testNetwork(networkName);
  return result;
};

export const displayZombienetRunOutput = async (
  networkId: string,
): Promise<void> => {
  const execRun = new ExecRun(networkId);
  const result = await execRun.getRunInfoById(networkId);
  return result;
};

export const displayZombienetTestRunOutput = async (
  networkId: string,
): Promise<void> => {
  const execRun = new ExecRun(networkId);
  const result = await execRun.getRunInfoById(networkId);
  return result;
};

export const showNetworkProgress = async (
  networkName: string,
): Promise<void> => {
  const network = new Network(networkName);
  const result = await network.findNetworkProgress();
  return result;
};

export const deleteNetwork = async (
  networkName: string,
): Promise<void> => {
  const network = new Network(networkName);
  const networkExists = await network.exists();
  if (!networkExists) {
    throw new AppError({
      kind: 'NETWORK_NOT_FOUND',
      message: `Network with network name ${networkName} does not exists`,
    });
  }
  const networkInfo = await network.get();
  const networkPath = getNetworkPath(networkInfo.name);
  if (await checkPathExists(networkPath)) await deleteDir(networkPath);
  if (await checkPathExists(networkInfo.networkDirectory)) {
    await deleteDir(networkInfo.networkDirectory);
  }
  await network.remove();
};

export const createNetwork = async (networkInfo: NetworkInfo): Promise<{
  name: string; runId: string;
}> => {
  const runInfo = new ExecRun();
  const network = new Network(networkInfo.name);
  const networkExists = await network.exists();
  if (networkExists) {
    throw new AppError({
      kind: 'NETWORK_EXISTS',
      message: `Network with network name ${networkInfo.name} already exists`,
    });
  }
  await network.set({ ...networkInfo, networkState: 'creating' });

  const networkDirPath = `${ZOMBIENET_NETWORKS_COLLECTION_DIR}/${networkInfo.name}`;
  const networkConfigPath = `${networkDirPath}/${networkInfo.configFilename}`;
  await createDir(networkDirPath);
  await createDir(networkInfo.networkDirectory);
  await writeToFileFromBase64(networkConfigPath, networkInfo.configContent);
  if (networkInfo.testFilename && networkInfo.testContent) {
    const networkTestConfigPath = `${networkDirPath}/${networkInfo.testFilename}`;
    await writeToFileFromBase64(networkTestConfigPath, networkInfo.testContent);
  }
  await runZombienet({
    spawn: true,
    networkConfigPath: `${networkDirPath}/${networkInfo.configFilename}`,
    // @ts-ignore
    provider: networkInfo.networkProvider ?? LARCH_DEFAULT_PROVIDER_NAME,
    dir: networkInfo.networkDirectory,
  }, ZOMBIENET_VERSION, networkInfo.name);

  return {
    name: networkInfo.name,
    runId: runInfo.id,
  };
};

export const testNetwork = async (networkName: string): Promise<{
  name: string; runId: string;
}> => {
  const runInfo = new ExecRun();
  const network = new Network(networkName);
  const networkExists = await network.exists();
  if (!networkExists) {
    throw new AppError({
      kind: 'NETWORK_NOT_FOUND',
      message: `Network with network name ${networkName} does not exists`,
    });
  }
  const networkInfo = await network.get();
  const networkDirPath = `${ZOMBIENET_NETWORKS_COLLECTION_DIR}/${networkInfo.name}`;

  await runZombienet({
    test: true,
    testConfigPath: `${networkDirPath}/${networkInfo.testFilename}`,
    // @ts-ignore
    provider: networkInfo.networkProvider ?? LARCH_DEFAULT_PROVIDER_NAME,
    dir: networkInfo.networkDirectory,
  }, ZOMBIENET_VERSION, runInfo.id);

  return {
    name: networkInfo.name,
    runId: runInfo.id,
  };
};
