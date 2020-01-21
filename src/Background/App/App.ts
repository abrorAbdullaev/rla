import { injectable } from 'tsyringe';
import { TabsService, SearchService } from '../../Shared/Services';
import { TabInfo, TabStatus } from '../../Shared/Models/TabInfo';

@injectable()
export class App {
  private searching: boolean = false;

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

    this.tabsService.registerRemoveOnUpdate((tabId: number) => {
      this.removeObservedTab(tabId, true);
    });
  }
  
  addObservedTab(id: number): void {
    this.observedTabs.push({
      id: id,
      status: TabStatus.idle,
      searchStatus: false,
      isFound: false,
    } as TabInfo);

    this.tabsService.changeTabTitle(id);
  }

  removeObservedTab(id: number, withoutTitleUpdate?: boolean): void {    
    const ind = this.observedTabs.findIndex((obj: TabInfo) => obj.id === id);

    this.observedTabs.splice(ind, 1);

    if(!withoutTitleUpdate) {
      this.tabsService.changeTabTitle(id, '(Not Observed)');
    }
  }

  startTabSearching(id: number): void {
    const ind = this.observedTabs.findIndex((obj: TabInfo) => obj.id === id);
 
    this.observedTabs[ind].status = TabStatus.searching;
    this.observedTabs[ind].searchStatus = true;
    this.observedTabs[ind].isFound = false;

    this.tabsService.changeTabTitle(id, '(Searching)');
    this.startSearch();
  }

  stopTabSearching(id: number, resultsFound?: boolean): void {
    const ind = this.observedTabs.findIndex((obj: TabInfo) => obj.id === id);

    this.observedTabs[ind].status = TabStatus.idle;
    this.observedTabs[ind].searchStatus = false;

    if (resultsFound) {
      this.observedTabs[ind].status = TabStatus.found;
      this.observedTabs[ind].isFound = true;
    }
    
    this.tabsService.changeTabTitle(id);
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

  getSearchedTabs(): TabInfo[] {
    return this.observedTabs.filter((obj: TabInfo) => Boolean(obj.searchStatus));
  }
}
