import { injectable } from 'tsyringe';
import { TabsService } from './Services';
import { TabInfo, TabSearchStatus } from '../../Shared/Models/TabInfo';

@injectable()
export class App {
  detectedTabs: Array<TabInfo> = [];

  constructor(
    private readonly tabsService: TabsService,
  ) {}

  init(): void {
    this.tabsService.getAllTabs().then((tabs) => {
      tabs.filter(({ id }) => Boolean(id))
        .forEach((tab) => {
          if(tab.url && tab.id && tab.url.includes('https://relay.amazon.com/tours/loadboard')) {
            this.addTabInfo(tab.id);
          }
        });
    });
  }

  liveCheck(): void {
    setInterval(() => {
      console.log('Live Check:', this.detectedTabs);
    }, 5000);
  }

  private addTabInfo(id: number) {
    this.detectedTabs.push({
      id: id,
      searchStatus: TabSearchStatus.idle,
    } as TabInfo);
  } 
}
