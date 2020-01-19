import { injectable } from 'tsyringe';
import { TabsService } from '../../Shared/Services';
import { TabInfo, TabStatus } from '../../Shared/Models/TabInfo';

@injectable()
export class App {
  observedTabs: Array<TabInfo> = [];

  constructor(
    public tabsService: TabsService,
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

    this.tabsService.changeTabTitle(numericId, true);
  }
}
