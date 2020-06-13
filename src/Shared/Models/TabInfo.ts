export enum TabStatus {
  idle = 'idle',
  searching = 'searching',
  found = 'found'
}

export interface TabOriginStateInfo {
  stateName: string,
  city: string,
  time: string,
  radius: number,
  destinationStates: Array<string>,
}

export interface TabFilters {
  originStatesFilter: Array<TabOriginStateInfo>,
  destinationStatesFilter: Array<string>,
  autoBook: boolean,
  stopsCount: number,
  withLogs: boolean,
}

export interface PrintInfo {
  loadId: string,
  loadLength: number,
  loadHtml?: JQuery<HTMLElement>
}

export interface TabInfo {
  id: number,
  status: TabStatus,
  searchStatus: boolean,
  isFound: boolean,
  filters: TabFilters,
  printInfo: PrintInfo,
}

export const defaultTabInfo: Omit<TabInfo, 'id'> = {
  status: TabStatus.idle,
  searchStatus: false,
  isFound: false,
  filters: {
    originStatesFilter: [],
    destinationStatesFilter: [],
    autoBook: false,
    stopsCount: 4,
    withLogs: false,
  } as TabFilters,
  printInfo: {
    loadId: '',
    loadLength: 0,
  },
}