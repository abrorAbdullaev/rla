import { injectable } from 'tsyringe';
import { TabsService } from './Services';
import { TabInfo, TabStatus } from '../../Shared/Models/TabInfo';
import { isTokenDescriptor } from 'tsyringe/dist/typings/providers/injection-token';

@injectable()
export class App {
  observedTabs: Array<TabInfo> = [];

  constructor(
    private tabsService: TabsService,
  ) {}

  init(): void {
    console.log(this.tabsService);

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

    this.changeTabTitle(numericId);
  }

  removeObservedTab(id: number | string): void {
    const numericId = typeof id === 'string' 
      ? parseInt(id, 10)
      : id;

    const ind = this.observedTabs.findIndex((obj: TabInfo) => obj.id === numericId);
    this.observedTabs.splice(ind, 1);
  }

  private changeTabTitle(id: number):void {
    console.log(this.tabsService);
    // this.tabsService.changeTabTitle(id);
  }
}
