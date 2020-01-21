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
    bg?: Background,
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
    bg?: Background,
  ): void {
    if (bg) {
      if(mainTemplate.currentNotObserved) {
        $('#addCurrentButton').off().on('click', (event: Event) => {
          if (event.target) {
            bg.addObservedTab($(event.target).attr('data-tab-id'));
            this.renderContent(bg);
          }
        });
      }
      
      $('.tab-remove-btn').off().on('click', (event: Event) => {
        if(event.target) {
          bg.removeObservedTab($(event.target).attr('data-tab-id'));
          this.renderContent(bg);
        }
      });

      $('.tab-start-btn').off().on('click', (event: Event) => {
        if(event.target) {
          bg.startTabSearching($(event.target).attr('data-tab-id'), () => {
            this.renderContent(bg);
          });

          this.renderContent(bg);
        }
      });

      $('.tab-stop-btn').off().on('click', (event: Event) => {
        if(event.target) {
          bg.stopTabSearching($(event.target).attr('data-tab-id'));
          this.renderContent(bg);
        }
      });

      $('.tab-switch-btn').off().on('click', (event: Event) => {
        if(event.target) {
          bg.activateTab($(event.target).attr('data-tab-id'));
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
