import { injectable } from 'tsyringe';
import { TabsService, SearchService } from '../../Shared/Services';
import { TabInfo, TabStatus, TabFilters } from '../../Shared/Models/TabInfo';

@injectable()
export class App {
  observedTabs: Array<TabInfo> = [];
  onResultFound: (bgApp: this) => void;

  constructor(
    public tabsService: TabsService,
    public searchService: SearchService,
  ) {
    this.onResultFound = (bgApp: this) => {
      console.log('background onResultFound has not been overridden', bgApp);
    };
  }

  init(): void {
    this.tabsService.registerOnCloseEvents((tabId: number) => {
      this.removeObservedTab(tabId, true);
    });

    this.tabsService.registerOnUpdateEvents((tabId: number) => {
      this.removeObservedTab(tabId, true);
    });
  }
  
  addObservedTab(tabId: number): void {
    this.observedTabs.push({
      id: tabId,
      status: TabStatus.idle,
      searchStatus: false,
      isFound: false,
      filters: {
        dateTillFilter: '',
      } as TabFilters
    } as TabInfo);

    this.tabsService.changeTabTitle(tabId);
  }

  removeObservedTab(tabId: number, withoutTitleUpdate?: boolean): void {    
    const ind = this.getIndexByTabId(tabId);

    if (ind >= 0) {
      this.observedTabs.splice(ind, 1);
    }
    
    if (!withoutTitleUpdate) {
      this.tabsService.changeTabTitle(tabId, '(Not Observed)');
    }
  }

  startTabSearching(tabId: number): void {
    const ind = this.getIndexByTabId(tabId);
 
    this.observedTabs[ind].status = TabStatus.searching;
    this.observedTabs[ind].searchStatus = true;
    this.observedTabs[ind].isFound = false;

    this.tabsService.changeTabTitle(tabId, '(Searching)');

    if (this.getSearchedTabs().length === 1) {
      this.startSearch();
    }
  }

  stopTabSearching(tabId: number, resultsFound?: boolean): void {
    const ind = this.getIndexByTabId(tabId);

    this.observedTabs[ind].status = TabStatus.idle;
    this.observedTabs[ind].searchStatus = false;

    if (resultsFound) {
      this.observedTabs[ind].status = TabStatus.found;
      this.observedTabs[ind].isFound = true;
    }
    
    this.tabsService.changeTabTitle(tabId);
  }

  updateFilters(tabId: number, filters: TabFilters) {
    const ind = this.getIndexByTabId(tabId);
    this.observedTabs[ind].filters = filters;
  }

  startSearch() {
    const searchedTabs = this.getSearchedTabs();

    if (this.getSearchedTabs().length) {
      this.searchService.search(searchedTabs.map((obj: TabInfo) => obj.id))
        .then((response: Array<{ tabId: number }>) => {
          if(response.length) {
            response.forEach(({ tabId }) => {
              this.stopTabSearching(tabId, true);
              this.onResultFound(this);
              this.tabsService.changeTabTitle(tabId, '( !Found! )');
            });
          }

          this.startSearch();
      });
    }
  }

  activateTab(id: number) {
    this.tabsService.switchToTab(id);
  }

  getIndexByTabId(tabId: number): number {
    return this.observedTabs.findIndex((obj: TabInfo) => obj.id === tabId);
  }

  private getSearchedTabs(): TabInfo[] {
    return this.observedTabs.filter((obj: TabInfo) => Boolean(obj.searchStatus));
  }
}
