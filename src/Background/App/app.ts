import { injectable } from 'tsyringe';
import { TabsService, SearchService } from '../../Shared/Services';
import { TabInfo, TabStatus } from '../../Shared/Models/TabInfo';

@injectable()
export class App {
  observedTabs: Array<TabInfo> = [];

  constructor(
    public tabsService: TabsService,
    public searchService: SearchService,
  ) {}

  init(): void {
    this.tabsService.registerOnCloseEvents((tabId: number) => {
      this.removeObservedTab(tabId, true);
    });

    this.tabsService.registerRemoveOnUpdate((tabId: number) => {
      this.removeObservedTab(tabId, true);
    });
  }
  
  addObservedTab(id: number | string): void {
    const numericId = typeof id === 'string' 
      ? parseInt(id, 10)
      : id;

    this.observedTabs.push({
      id: numericId,
      status: TabStatus.idle,
      searchStatus: false,
      isFound: false,
    } as TabInfo);

    this.tabsService.changeTabTitle(numericId);
  }

  removeObservedTab(id: number | string, withoutTitleUpdate?: boolean): void {    
    const numericId = typeof id === 'string'
      ? parseInt(id, 10)
      : id;

    const ind = this.observedTabs.findIndex((obj: TabInfo) => obj.id === numericId);

    if(ind > 0) {
      this.observedTabs.splice(ind, 1);
    }
  
    if(!withoutTitleUpdate) {
      this.tabsService.changeTabTitle(numericId, '(Not Observed)');
    }
  }

  startTabSearching(id: number | string, fn?: Function): void {
    const numericId = typeof id === 'string'
    ? parseInt(id, 10)
    : id;

    const ind = this.observedTabs.findIndex((obj: TabInfo) => obj.id === numericId);
 
    this.observedTabs[ind].status = TabStatus.searching;
    this.observedTabs[ind].searchStatus = true;
    this.observedTabs[ind].isFound = false;

    this.tabsService.changeTabTitle(numericId, '(Searching)');
    
    // Start search loop only if the started tab is the first one on the searched list
    if(this.observedTabs.filter((obj: TabInfo) => obj.searchStatus).length === 1) {
      this.startSearch(this.observedTabs.filter((obj: TabInfo) => Boolean(obj.searchStatus)), fn);
    }
  }

  stopTabSearching(id: number | string): void {
    const numericId = typeof id === 'string'
    ? parseInt(id, 10)
    : id;

    const ind = this.observedTabs.findIndex((obj: TabInfo) => obj.id === numericId);

    this.observedTabs[ind].status = TabStatus.idle;
    this.observedTabs[ind].searchStatus = false;
    
    this.tabsService.changeTabTitle(numericId);
  }

  startSearch(searchedTabs: TabInfo[], onFound?: Function) {
    if(searchedTabs.length) {
      this.searchService.search(searchedTabs.map((obj: TabInfo) => obj.id)).then((response: Array<{ id: number }>) => {
        if(response.length) {
          response.forEach((resp: { id: number }) => {
            let ind = this.observedTabs.findIndex((obj: TabInfo) => obj.id === resp.id);

            this.observedTabs[ind].status = TabStatus.found;
            this.observedTabs[ind].searchStatus = false;
            this.observedTabs[ind].isFound = true;

            this.tabsService.changeTabTitle(resp.id, '( !Found! )');
          });

          onFound && onFound();
        }
        
        this.startSearch(this.observedTabs.filter((obj: TabInfo) => obj.searchStatus,), onFound);
      });
    }
  }

  activateTab(id: number | string) {
    const numericId = typeof id === 'string'
    ? parseInt(id, 10)
    : id;

    this.tabsService.switchToTab(numericId);
  }
}
