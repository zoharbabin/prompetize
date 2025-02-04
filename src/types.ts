export interface ExtensionMessage {
  type: string;
  data?: any;
}

export type PerformSomeAction = (data: any) => Promise<any>;