import { injectable } from "tsyringe";
import * as Mustache from 'mustache';
import $ from 'jquery';
import { MainTemplate } from "../../Popup/App/Models";
import { App as BackgroundApp } from '../../Background/App/App';

declare var require: {
  (path: string): any;
  <T>(path: string): T;
  (paths: string[], callback: (...modules: any[]) => void): void;
  ensure: (paths: string[], callback: (require: <T>(path: string) => T) => void) => void;
};

@injectable()
export class PopupService {
  private mainHtml = require('./Template/main.html');
  private wrongPageHtml = require('./Template/wrong.html');

  renderContent(
    bg?: BackgroundApp,
    currentTab?: chrome.tabs.Tab,
  ): void {
    const mainTemplate = {
      observedTabs: bg ? bg.observedTabs : [],
    } as MainTemplate;

    if(bg && currentTab && !bg.observedTabs.filter(({ id }) => id == currentTab.id).length) {
      mainTemplate['currentNotObserved'] = true;
      mainTemplate['currentTab'] = currentTab;
    }

    this.render(Mustache.render(this.mainHtml, mainTemplate));
    this.registerJQueryEvents(mainTemplate, bg);
  }

  renderWrongPage() {
    this.render(Mustache.render(this.wrongPageHtml, {}));
  }

  hideLoader(): void {
    const spinner = $('#initialization-spinner');
    spinner.removeClass('d-flex').addClass('d-none');
  }

  parseTemplate(): void {
    Mustache.parse(this.mainHtml);
  }

  private registerJQueryEvents(
    mainTemplate: MainTemplate,
    bg?: BackgroundApp,
  ): void {
    if (bg) {
      if(mainTemplate.currentNotObserved) {
        $('#addCurrentButton').off().on('click', (event: Event) => {
          if (event.target) {
            const tabId = $(event.target).attr('data-tab-id');

            bg.addObservedTab(parseInt(tabId ? tabId : '0'));
            this.renderContent(bg);
          }
        });
      }
      
      $('.tab-remove-btn').off().on('click', (event: Event) => {
        if(event.target) {
          const tabId = $(event.target).attr('data-tab-id');

          bg.removeObservedTab(parseInt(tabId ? tabId : '0'));
          this.renderContent(bg);
        }
      });

      $('.tab-start-btn').off().on('click', (event: Event) => {
        if(event.target) {
          const tabId = $(event.target).attr('data-tab-id');

          bg.startTabSearching(parseInt(tabId ? tabId : '0'), () => {
            console.log('InsideBitches');
          });

          this.renderContent(bg);
        }
      });

      $('.tab-stop-btn').off().on('click', (event: Event) => {
        if(event.target) {
          const tabId = $(event.target).attr('data-tab-id');

          bg.stopTabSearching(parseInt(tabId ? tabId : '0'));
          this.renderContent(bg);
        }
      });

      $('.tab-switch-btn').off().on('click', (event: Event) => {
        if(event.target) {
          const tabId = $(event.target).attr('data-tab-id');

          bg.activateTab(parseInt(tabId ? tabId : '0'));
        }
      });
    }
  }

  private render(content: string): void {
    const popup = $('#app-wrapper');

    if(popup.length) {
      popup.html(content);
    } else {
      // TODO Error case
    }
  }
}
