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
  action(tabId: number, eventTarget?: JQuery<EventTarget>): void,
  event: string,
}

@injectable()
export class PopupService {
  private mainHtml = require('./Template/main.html');
  private wrongPageHtml = require('./Template/wrong.html');
  private authPageHtml = require('./Template/auth.html');

  private cachedCurrentTab?: chrome.tabs.Tab;

  renderContent(
    bg: BackgroundApp,
    currTab?: chrome.tabs.Tab,
  ): void {
    // Internal local cache to be used in case if the tab is removed from observation
    // Keep it saved even before auth so that after auth it could be used
    const currentTab = this.getCurrentTab(currTab);
    
    console.log(bg.isAuthenticated());

    // Just additional check just in case
    if (!bg.isAuthenticated()) {
      this.renderAuthPage(false);
      this.registerAuthJQueryEvents(bg);

      return;
    }

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

  renderAuthPage(failed: boolean) {
    this.render(Mustache.render(this.authPageHtml, {
      failed
    }));
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
    const actionsMap: ActionMapObject[] = [
      {
        condition: mainTemplate.currentNotObserved,
        elementSelector: '#addCurrentButton',
        event: 'click',
        action: (tabId: number) => {
          bg.addObservedTab(tabId);
        }
      },
      {
        condition: true,
        elementSelector: '.tab-remove-btn',
        event: 'click',
        action: (tabId: number) => {
          bg.removeObservedTab(tabId);
        },
      },
      {
        condition: true,
        elementSelector: '.tab-start-btn',
        event: 'click',
        action: (tabId: number) => {
          bg.startTabSearching(tabId);
        }
      },
      {
        condition: true,
        elementSelector: '.tab-stop-btn',
        event: 'click',
        action: (tabId: number) => {
          bg.stopTabSearching(tabId);
        }
      },
      {
        condition: true,
        elementSelector: '.tab-switch-btn',
        event: 'click',
        action: (tabId: number) => {
          bg.activateTab(tabId);
        }
      },
      {
        condition: true,
        elementSelector: '[name="date-till-filter"]',
        event: 'change',
        action: (tabId: number, eventTarget: JQuery<EventTarget>) => {
          const filters = bg.observedTabs[bg.getIndexByTabId(tabId)].filters;
          const val = eventTarget.val();

          if (val) {
            filters.dateTillFilter = val.toString()
          }

          bg.updateFilters(tabId, filters);
        }
      }
    ]
    
    actionsMap.forEach((actionMap: ActionMapObject) => {
      if(actionMap.condition) {
        $(actionMap.elementSelector).off().on(actionMap.event, (event: Event) => {
          if(event.target) {
            const eventTarget = $(event.target);
            const tabId = eventTarget.attr('data-tab-id');

            actionMap.action(parseInt(tabId ? tabId : '-1'), eventTarget);

            this.renderContent(bg);
          }
        });
      }
    });
  }

  private registerAuthJQueryEvents(bg: BackgroundApp): void {
      $('#authForm').off().on('submit', (event: Event) => {
        event.preventDefault();
        
        if(event.target) {
          const form = $(event.target);

          form.find('[type="submit"]').attr('disabled', 'disabled');

          const login = form.find('[name="auth-login"]').attr('disabled', 'disabled').val();
          const password = form.find('[name="auth-password"]').attr('disabled', 'disabled').val();

          if (login && password) {
            bg.authenticate(login.toString(), password.toString()).then(
              (isSuccess: boolean) => {
                if (isSuccess) {
                  this.renderContent(bg)
                } else {
                  this.renderAuthPage(true);
                  this.registerAuthJQueryEvents(bg);
                }
              }
            );
          }
        }
      });
  }

  private getCurrentTab(currentTab?: chrome.tabs.Tab ): chrome.tabs.Tab | undefined {
    if (currentTab) {
      this.cachedCurrentTab = currentTab;
    }

    return this.cachedCurrentTab;
  };

  private render(content: string): void {
    const popup = $('#app-wrapper');

    if(popup.length) {
      popup.html(content);
    } else {
      // TODO Error case
    }
  }
}
