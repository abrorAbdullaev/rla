import { TabInfo } from '../../../Shared';
import { TabsService, SearchService } from '../../../Shared/Services';

export interface Background {
  observedTabs: TabInfo[];
  addObservedTab: Function;
  removeObservedTab: Function;
  startTabSearching: Function;
  stopTabSearching: Function;
  startSearch: Function;
  tabsService: TabsService;
  searchService: SearchService;
}