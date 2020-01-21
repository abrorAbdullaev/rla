import { injectable } from "tsyringe";

import { App as BackgroundApp } from '../../Background/App/App';
import { PopupService, BackgroundService } from './Services';

@injectable()
export class App {
  private bgApp: Promise<BackgroundApp>;
  private currentTab: Promise<chrome.tabs.Tab>;

  constructor(
    private readonly popupService: PopupService,
    private readonly backgroundService: BackgroundService,
  ) {
    this.bgApp = this.backgroundService.getBackground();
    this.currentTab = this.backgroundService.getCurrentTab();
  }

  init(): void {
    this.isPageRelay().then((isPageRelay) => {
      if (isPageRelay) {
        Promise.all([
          this.bgApp,
          this.currentTab
        ]).then(([bgApp, currentTab]) => {
          /**
           * Do overrides of background here or assign callbacks
           */
          bgApp.onResultFound = (bgApp: BackgroundApp) => {
            this.popupService.renderContent(bgApp);
          }

          this.popupService.parseTemplate();
          
          // Render content via the reference from background
          // can be also done via current object this.popupService.renderContent(bgpp, currentTab)
          this.popupService.renderContent(bgApp, currentTab)
          this.popupService.hideLoader();
        })
      } else {
        this.popupService.renderWrongPage();
      }
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
