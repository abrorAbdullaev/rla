import { injectable } from 'tsyringe';
import dayjs from 'dayjs-ext';
import { AuthService, AuthData } from './Services';
import { TabsService, SearchService } from '../../Shared/Services';
import { TabInfo, TabStatus, TabFilters, defaultTabInfo, PrintInfo } from '../../Shared/Models/TabInfo';
import { BookingService } from '../../Shared/Services/BookingService';

@injectable()
export class App {
  private authData: AuthData;

  observedTabs: Array<TabInfo> = [];
  onResultFound: (bgApp: this) => void;

  constructor(
    private tabsService: TabsService,
    private searchService: SearchService,
    private authService: AuthService,
    private bookingService: BookingService,
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
      ...defaultTabInfo
    });

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

  updateFilters(tabId: number, filters: TabFilters) : void {
    const ind = this.getIndexByTabId(tabId);
    this.observedTabs[ind].filters = filters;
  }

  updatePrintInfo(tabId: number, printInfo: PrintInfo) {
    const ind = this.getIndexByTabId(tabId);
    this.observedTabs[ind].printInfo = printInfo;
  }

  startSearch() {
    const searchedTabs = this.getSearchedTabs();
    const searchItems: Array<{ tabId: number, filters: TabFilters }> = [];

    if (searchedTabs.length) {
      const searchIds = searchedTabs.map((obj: TabInfo) => obj.id);
      
      searchIds.forEach((searchId: number) => {
        searchItems.push({
          tabId: searchId,
          filters: this.observedTabs[this.getIndexByTabId(searchId)].filters,
        });
      });

      this.searchService.search(searchItems)
        .then((response: Array<{ tabId: number, loadCardItem: JQuery<HTMLElement>, autoBook: boolean }>) => {
          if(response.length) {
            response.forEach(({ tabId, loadCardItem, autoBook }) => {
              this.stopTabSearching(tabId, true);

              // Auto book
              if (autoBook) {
                const loadId = loadCardItem.find('.tour-header').attr('id');
                this.tabsService.changeTabTitle(tabId, '( Booking! )');

                if (loadId) {
                  this.bookingService.bookLoad(tabId, loadId).then((response: boolean) => {
                    if (response) {
                      this.tabsService.changeTabTitle(tabId, '( !Booked! )');
                      this.updatePrintInfo(tabId, {
                        loadId,
                        loadLength: 10.00,
                        loadHtml: loadCardItem
                      } as PrintInfo);
                    } else {
                      this.tabsService.changeTabTitle(tabId, '( !Could not book! )');
                    }
                  });
                }
              } else {
                this.tabsService.changeTabTitle(tabId, '( !Found! )');
              }

              this.onResultFound(this);
            });
          }

          setTimeout(() => {
            this.startSearch();
          }, 500);
      });
    }
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
