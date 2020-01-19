import { TabInfo } from '../../../Shared';

export interface Background {
  observedTabs: TabInfo[];
  addObservedTab: Function,
  removeObservedTab: Function,
}