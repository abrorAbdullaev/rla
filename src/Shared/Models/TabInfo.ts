export enum TabSearchStatus {
  idle = 'idle',
  searching = 'searching',
}

export interface TabInfo {
  id: number,
  searchStatus: TabSearchStatus
}
