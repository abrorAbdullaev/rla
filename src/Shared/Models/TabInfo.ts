export enum TabStatus {
  idle = 'idle',
  searching = 'searching',
  found = 'found'
}

export interface TabFilters {
  dateTillFilter: string,
  destinationStatesFilter: Array<string>,
}

export interface TabInfo {
  id: number,
  status: TabStatus,
  searchStatus: boolean,
  isFound: boolean,
  expanded: boolean,
  filters: TabFilters,
}

export const defaultTabInfo: Omit<TabInfo, 'id'> = {
  status: TabStatus.idle,
  searchStatus: false,
  isFound: false,
  expanded: false,
  filters: {
    dateTillFilter: '',
    destinationStatesFilter: [],
  } as TabFilters
}