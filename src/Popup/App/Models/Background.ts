import { TabInfo } from '../../../Shared';
import { TabsService } from '../../../Shared/Services';

export interface Background {
  observedTabs: TabInfo[];
  addObservedTab: Function;
  removeObservedTab: Function;
  startTabSearching: Function;
  stopTabSearching: Function;
  tabsService: TabsService;
}