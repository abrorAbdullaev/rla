import { injectable } from "tsyringe";

import { App as BackgroundApp } from '../../Background/App/App';
import { PopupService, BackgroundService } from './Services';

@injectable()
export class App {
  private bgApp?: BackgroundApp;
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
    .then(([ bgWindow, currentTab, isRelay]) => {
        this.popupService.hideLoader();

        if(!isRelay) {
          this.popupService.renderWrongPage();
          return;
        }

        this.bgApp = bgWindow.app;
        this.currentTab = currentTab;
        
        this.popupService.renderContent(this.bgApp, this.currentTab);
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
