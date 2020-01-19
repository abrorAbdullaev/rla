export enum TabStatus {
  idle = 'idle',
  searching = 'searching',
}

export interface TabInfo {
  id: number,
  status: TabStatus,
  searchStatus: boolean,
}
