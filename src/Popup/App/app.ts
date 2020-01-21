import { injectable } from "tsyringe";

import { Background } from "./Models";
import { PopupService, BackgroundService } from './Services';

@injectable()
export class App {
  private bg?: Background;
  private currentTab?: chrome.tabs.Tab;

  constructor(
    private readonly popupService: PopupService,
    private readonly backgroundService: BackgroundService,
  ) {
    this.popupService.parseTemplate();
  }

  init(): void {
    Promise.all([
      this.backgroundService.getBackground(), 
      this.backgroundService.getCurrentTab(),
      this.isPageRelay()
    ])
    .then(([ bg, currentTab, isRelay]) => {
        this.popupService.hideLoader();

        if(!isRelay) {
          this.popupService.renderWrongPage();
          return;
        }

        this.bg = bg;
        this.currentTab = currentTab;
        
        this.popupService.renderContent(this.bg, this.currentTab);
    });
  }

  private isPageRelay(): Promise<boolean> {
    return new Promise<boolean>((resolve) => {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const tab = tabs[0];

        resolve(Boolean(tab && tab.url && tab.url.includes('relay.amazon.com/tours/loadboard')));
      });
    });
  }
}
