import { TabInfo } from '../../../Shared';
import { TabsService } from '../../../Shared/Services';

export interface Background {
  observedTabs: TabInfo[];
  addObservedTab: Function;
  removeObservedTab: Function;
  tabsService: TabsService
}