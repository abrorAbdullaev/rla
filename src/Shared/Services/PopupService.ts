import { injectable } from "tsyringe";
import * as Mustache from 'mustache';
import $ from 'jquery';
import { MainTemplate } from "../Models";
import { App as BackgroundApp } from '../../Background/App/App';

declare var require: {
  (path: string): any;
  <T>(path: string): T;
  (paths: string[], callback: (...modules: any[]) => void): void;
  ensure: (paths: string[], callback: (require: <T>(path: string) => T) => void) => void;
};

interface ActionMapObject {
  condition: boolean,
  elementSelector: string,
  action(tabId: number): void,
}

@injectable()
export class PopupService {
  private mainHtml = require('./Template/main.html');
  private wrongPageHtml = require('./Template/wrong.html');

  renderContent(
    bg: BackgroundApp,
    currentTab?: chrome.tabs.Tab,
  ): void {
    const mainTemplate = {
      observedTabs: bg.observedTabs,
      currentNotObserved: false,
    } as MainTemplate;

    // If the currentTab
    if(currentTab && !bg.observedTabs.filter(({ id }) => id == currentTab.id).length) {
      mainTemplate['currentNotObserved'] = true;
      mainTemplate['currentTab'] = currentTab;
    }
  
    this.render(Mustache.render(this.mainHtml, mainTemplate));
    this.registerJQueryEvents(mainTemplate, bg);
  }

  renderWrongPage() {
    this.render(Mustache.render(this.wrongPageHtml, {}));
    this.hideLoader();
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
    bg: BackgroundApp,
  ): void {
    if (bg) {
      const actionsMap: ActionMapObject[] = [
        {
          condition: mainTemplate.currentNotObserved,
          elementSelector: '#addCurrentButton',
          action: (tabId: number) => {
            bg.addObservedTab(tabId);
          }
        },
        {
          condition: true,
          elementSelector: '.tab-remove-btn',
          action: (tabId: number) => {
            bg.removeObservedTab(tabId);
          },
        },
        {
          condition: true,
          elementSelector: '.tab-start-btn',
          action: (tabId: number) => {
            bg.startTabSearching(tabId);
          }
        },
        {
          condition: true,
          elementSelector: '.tab-stop-btn',
          action: (tabId: number) => {
            bg.stopTabSearching(tabId);
          }
        },
        {
          condition: true,
          elementSelector: '.tab-switch-btn',
          action: (tabId: number) => {
            bg.activateTab(tabId);
          }
        }
      ]
      
      actionsMap.forEach((actionMap: ActionMapObject) => {
        if(actionMap.condition) {
          $(actionMap.elementSelector).off().on('click', (event: Event) => {
            if(event.target) {
              const tabId = $(event.target).attr('data-tab-id');
              
              actionMap.action(parseInt(tabId ? tabId : '-1'));
              this.renderContent(bg);
            }
          });
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
