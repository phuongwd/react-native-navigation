import { TurboModule, TurboModuleRegistry } from 'react-native';

export interface Spec extends TurboModule {
  readonly getConstants: () => {
    topBarHeight: number;
    statusBarHeight: number;
    bottomTabsHeight: number;
    backButtonId: string;
  };

  setRoot(commandId: string, layout: Object): Promise<string>;

  setDefaultOptions(options: Object): void;

  mergeOptions(componentId: string, options: Object): void;

  push(commandId: string, componentId: string, layout: Object): Promise<string>;

  pop(commandId: string, componentId: string, options?: Object): Promise<string>;

  popTo(commandId: string, componentId: string, options?: Object): Promise<string>;

  popToRoot(commandId: string, componentId: string, options?: Object): Promise<string>;

  setStackRoot(
    commandId: string,
    componentId: string,
    layout: Array<Object>
  ): Promise<string>;

  showModal(commandId: string, layout: Object): Promise<string>;

  dismissModal(commandId: string, componentId: string, options?: Object): Promise<string>;

  dismissAllModals(commandId: string, options?: Object): Promise<string>;

  showOverlay(commandId: string, layout: Object): Promise<string>;

  dismissOverlay(commandId: string, componentId: string): Promise<string>;

  dismissAllOverlays(commandId: string): Promise<string>;

  getLaunchArgs(commandId: string): Promise<Array<string>>;
}

const commands = TurboModuleRegistry.get<Spec>('RNNTurboModule')!;

export default commands;
