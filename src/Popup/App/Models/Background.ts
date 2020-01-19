import { TabInfo } from '../../../Shared';

export interface Background {
  observedTabs: Array<TabInfo>;
  addObservedTab: Function,
}