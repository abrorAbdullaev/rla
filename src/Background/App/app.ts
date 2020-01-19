import { injectable } from 'tsyringe';
import { TabsService, SearchService } from '../../Shared/Services';
import { TabInfo, TabStatus } from '../../Shared/Models/TabInfo';

@injectable()
export class App {
  private idleIntervalId: number = -1;

  observedTabs: Array<TabInfo> = [];
  // interval: number = this.idleIntervalId;

  constructor(
    public tabsService: TabsService,
    public searchService: SearchService,
  ) {}

  init(): void {
    this.tabsService.registerOnCloseEvents((tabId: number) => {
      this.removeObservedTab(tabId);
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
    } as TabInfo);

    this.tabsService.changeTabTitle(numericId);
  }

  removeObservedTab(id: number | string): void {
    const numericId = typeof id === 'string'
      ? parseInt(id, 10)
      : id;

    const ind = this.observedTabs.findIndex((obj: TabInfo) => obj.id === numericId);
    this.observedTabs.splice(ind, 1);

    this.tabsService.changeTabTitle(numericId, '(Not Observed)');
  }

  startTabSearching(id: number | string): void {
    const numericId = typeof id === 'string'
    ? parseInt(id, 10)
    : id;

    const ind = this.observedTabs.findIndex((obj: TabInfo) => obj.id === numericId);
 
    this.observedTabs[ind].status = TabStatus.searching;
    this.observedTabs[ind].searchStatus = true;

    this.tabsService.changeTabTitle(numericId, '(Searching)');
    this.startSearch(this.observedTabs.filter((obj: TabInfo) => Boolean(obj.searchStatus)));
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

  startSearch(searchedTabs: TabInfo[]) {
    if(searchedTabs.length) {
      console.log('searching');
      this.searchService.search(searchedTabs.map((obj: TabInfo) => obj.id)).then((response: Array<{ id: number }>) => {
        this.startSearch(this.observedTabs.filter((obj: TabInfo) => obj.searchStatus));
      });
    }
  }
}
