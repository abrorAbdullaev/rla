import * as Mustache from 'mustache';
import { injectable } from "tsyringe";
import $ from 'jquery';

import { Background, MainTemplate } from "./Models";
import { PopupService, BackgroundService } from './Services';

declare var require: {
  (path: string): any;
  <T>(path: string): T;
  (paths: string[], callback: (...modules: any[]) => void): void;
  ensure: (paths: string[], callback: (require: <T>(path: string) => T) => void) => void;
};

@injectable()
export class App {
  private bg: Background | null = null;
  private currentTab: chrome.tabs.Tab | null = null;
  private mainHtml = require('./Template/main.html');
  private wrongPageHtml = require('./Template/wrong.html');

  constructor(
    private readonly popupService: PopupService,
    private readonly backgroundService: BackgroundService,
  ) {}

  init(): void {
    
    Promise.all([
      this.backgroundService.getBackground(), 
      this.backgroundService.getCurrentTab(),
      this.isPageRelay()
    ])
    .then(([ bg, currentTab, isRelay]) => {
        this.popupService.hideLoader();

        if(!isRelay) {
          this.popupService.renderContent(Mustache.render(this.wrongPageHtml, {}));
          return;
        }

        this.bg = bg;
        this.currentTab = currentTab;
        
        const mainTemplate = {
          observedTabs: this.bg ? this.bg.observedTabs : [],
        } as MainTemplate;

        if(this.bg && !this.bg.observedTabs.filter(({ id }) => this.currentTab && id == this.currentTab.id).length) {
          mainTemplate['currentNotObserved'] = true;
          mainTemplate['currentTab'] = this.currentTab;
        }

        this.renderMainTemplate(mainTemplate);
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

  private renderMainTemplate(mainTemplate: MainTemplate): void {
    this.popupService.renderContent(Mustache.render(this.mainHtml, mainTemplate));

    if (mainTemplate.currentNotObserved) {
      $('#addCurrentButton').off().on('click', () => {
        
        if (this.bg && this.currentTab) {
          this.bg?.addObservedTab(this.currentTab.id);

          console.log(this.bg);
        }
      });
    }
  }
}
