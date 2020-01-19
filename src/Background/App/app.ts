import { injectable } from 'tsyringe';
import { TabsService } from './Services';
import { TabInfo, TabSearchStatus } from '../../Shared/Models/TabInfo';

@injectable()
export class App {
  observedTabs: Array<TabInfo> = [];

  constructor(
    private readonly tabsService: TabsService,
  ) {}

  init(): void {
    // this.tabsService.getAllTabs().then((tabs) => {
    //   tabs.filter(({ id }) => Boolean(id))
    //     .forEach((tab) => {
    //       if(tab.url && tab.id && tab.url.includes('https://relay.amazon.com/tours/loadboard')) {
    //         this.addObservedTab(tab.id);
    //       }
    //     });
    // });
  }
  
  addObservedTab(id: number) {
    console.log(id);

    this.observedTabs.push({
      id: id,
      searchStatus: TabSearchStatus.idle,
    } as TabInfo);
  }
}
