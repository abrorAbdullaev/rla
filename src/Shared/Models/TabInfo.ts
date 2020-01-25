export enum TabStatus {
  idle = 'idle',
  searching = 'searching',
  found = 'found'
}

export interface TabFilters {
  dateTillFilter: string,
  destinationStatesFilter: Array<string>,
  autoBook: boolean,
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
  expanded: boolean,
  filters: TabFilters,
  printInfo: PrintInfo,
}

export const defaultTabInfo: Omit<TabInfo, 'id'> = {
  status: TabStatus.idle,
  searchStatus: false,
  isFound: false,
  expanded: false,
  filters: {
    dateTillFilter: '',
    destinationStatesFilter: [],
    autoBook: false,
  } as TabFilters,
  printInfo: {
    loadId: '',
    loadLength: 0,
  }
}