import { injectable } from 'tsyringe';
import dayjs from 'dayjs';
import { AuthService, AuthData } from './Services';
import { TabsService, SearchService } from '../../Shared/Services';
import { TabInfo, TabStatus, TabFilters } from '../../Shared/Models/TabInfo';

@injectable()
export class App {
  private authData: AuthData;

  observedTabs: Array<TabInfo> = [];
  onResultFound: (bgApp: this) => void;

  constructor(
    private tabsService: TabsService,
    private searchService: SearchService,
    private authService: AuthService,
  ) {
    this.onResultFound = (bgApp: this) => {
      console.log('background onResultFound has not been overridden', bgApp);
    };

    this.authData = {
      encryption: '',
    } as AuthData;
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
        destinationStatesFilter: [],
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
    const searchItems: Array<{ tabId: number, filters: TabFilters }> = [];

    if (searchedTabs.length) {
      const searchIds = this.getSearchedTabs().map((obj: TabInfo) => obj.id);
      searchIds.forEach((searchId: number) => {
        searchItems.push({
          tabId: searchId,
          filters: this.observedTabs[this.getIndexByTabId(searchId)].filters,
        });
      });

      this.searchService.search(searchItems)
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

  authenticate(login: string, password: string): Promise<boolean> {
    return new Promise<boolean>((resolve) => {
      this.authService.findMatch(login, password).then((response: { isSuccess: boolean, encryption: string }) => {
        if (response.isSuccess) {
          this.authData.encryption = response.encryption;
          this.authData.expiresAt = dayjs().add(1, 'day');
        }

        resolve(response.isSuccess);
      });
    });
  }

  isAuthenticated(): boolean {
    const isAuthenticated = !!this.authData.encryption 
      && !!this.authData.expiresAt 
      && this.authData.expiresAt.isAfter(dayjs());

    if (!isAuthenticated) {
      // Flush the data if the authentication expired
      this.observedTabs = [];
      this.authData = {
        encryption: '',
      } as AuthData;
    }

    return isAuthenticated;
  }

  private getSearchedTabs(): TabInfo[] {
    return this.observedTabs.filter((obj: TabInfo) => Boolean(obj.searchStatus));
  }
}
