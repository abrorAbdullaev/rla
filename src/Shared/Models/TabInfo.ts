export enum TabStatus {
  idle = 'idle',
  searching = 'searching',
  found = 'found'
}

export interface TabInfo {
  id: number,
  status: TabStatus,
  searchStatus: boolean,
  isFound: boolean,
}
