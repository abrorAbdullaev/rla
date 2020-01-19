import { injectable } from "tsyringe";
import * as Mustache from 'mustache';
import $ from 'jquery';
import { MainTemplate, Background } from "../Models";

declare var require: {
  (path: string): any;
  <T>(path: string): T;
  (paths: string[], callback: (...modules: any[]) => void): void;
  ensure: (paths: string[], callback: (require: <T>(path: string) => T) => void) => void;
};

@injectable()
export class PopupService {
  private mainHtml = require('../Template/main.html');
  private wrongPageHtml = require('../Template/wrong.html');

  renderContent(
    currentTab?: chrome.tabs.Tab,
    bg?: Background,
  ): void {
    const mainTemplate = {
      observedTabs: bg ? bg.observedTabs : [],
    } as MainTemplate;

    if(bg && !bg.observedTabs.filter(({ id }) => currentTab && id == currentTab.id).length) {
      mainTemplate['currentNotObserved'] = true;
      mainTemplate['currentTab'] = currentTab;
    }

    this.render(Mustache.render(this.mainHtml, mainTemplate));
    this.registerJQueryEvents(mainTemplate, currentTab, bg,);
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
    currentTab?: chrome.tabs.Tab,
    bg?: Background,
  ): void {
    if (bg && currentTab) {
      if(mainTemplate.currentNotObserved) {
        $('#addCurrentButton').off().on('click', () => {
          if (bg && currentTab) {
            bg.addObservedTab(currentTab.id);
            this.renderContent(currentTab, bg);
          }
        });
      }
      
      $('.tab-remove-btn').off().on('click', (event: Event) => {
        if(event.target) {
          bg.removeObservedTab($(event.target).attr('data-tab-id'));
          this.renderContent(currentTab, bg);
        }
      });

      $('.tab-start-btn').off().on('click', (event: Event) => {
        if(event.target) {
          bg.startTabSearching($(event.target).attr('data-tab-id'));
          this.renderContent(currentTab, bg);
        }
      });

      $('.tab-stop-btn').off().on('click', (event: Event) => {
        if(event.target) {
          bg.stopTabSearching($(event.target).attr('data-tab-id'));
          this.renderContent(currentTab, bg);
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
