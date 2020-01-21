import { injectable } from 'tsyringe';
import { TabsService, SearchService, PopupService } from '../../Shared/Services';
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

    if(ind >= 0) {
      this.observedTabs.splice(ind, 1);

      if(!withoutTitleUpdate) {
        this.tabsService.changeTabTitle(id, '(Not Observed)');
      }
    }
  }

  startTabSearching(id: number, callBackOnFound?: Function): void {
    const ind = this.observedTabs.findIndex((obj: TabInfo) => obj.id === id);
 
    this.observedTabs[ind].status = TabStatus.searching;
    this.observedTabs[ind].searchStatus = true;
    this.observedTabs[ind].isFound = false;

    this.tabsService.changeTabTitle(id, '(Searching)');

    // Start search loop only if the started tab is the first one on the searched list
    if(this.observedTabs.filter((obj: TabInfo) => obj.searchStatus).length === 1) {
      this.startSearch(this.observedTabs.filter((obj: TabInfo) => Boolean(obj.searchStatus)), callBackOnFound);
    }
  }

  stopTabSearching(id: number): void {
    const ind = this.observedTabs.findIndex((obj: TabInfo) => obj.id === id);

    this.observedTabs[ind].status = TabStatus.idle;
    this.observedTabs[ind].searchStatus = false;
    
    this.tabsService.changeTabTitle(id);
  }

  startSearch(searchedTabs: TabInfo[], callBackOnFound?: Function) {
    if(searchedTabs.length) {
      this.searchService.search(searchedTabs.map((obj: TabInfo) => obj.id)).then((response: Array<{ id: number }>) => {
        if(response.length) {
          response.forEach((resp: { id: number }) => {
            let ind = this.observedTabs.findIndex((obj: TabInfo) => obj.id === resp.id);

            this.observedTabs[ind].status = TabStatus.found;
            this.observedTabs[ind].searchStatus = false;
            this.observedTabs[ind].isFound = true;

            console.log(callBackOnFound);

            if(callBackOnFound) {
              callBackOnFound();
            }

            this.tabsService.changeTabTitle(resp.id, '( !Found! )');
          });
        }
        
        this.startSearch(this.observedTabs.filter((obj: TabInfo) => obj.searchStatus,));
      });
    }
  }

  activateTab(id: number) {
    this.tabsService.switchToTab(id);
  }
}
