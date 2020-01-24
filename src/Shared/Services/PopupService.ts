import { injectable } from "tsyringe";
import * as Mustache from 'mustache';
import $ from 'jquery';
import { MainTemplate, TabFilters } from "../Models";
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
  withoutUpdate?: boolean,
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
          bg.toggleExpanded(tabId, false);
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
          const val = eventTarget.val();
          const filters: TabFilters = {
            ...bg.observedTabs[bg.getIndexByTabId(tabId)].filters,
          };

          filters.dateTillFilter = val ? val.toString() : '';
          bg.updateFilters(tabId, filters);
        }
      },
      {
        condition: true,
        elementSelector: '.tab-collapse-btn',
        event: 'click',
        action: (tabId: number) => {
          bg.toggleExpanded(tabId);
        }
      },
      {
        condition: true,
        elementSelector: '.auto-book-checkbox',
        event: 'click',
        action: (tabId: number) => {
          const filters: TabFilters = {
            ...bg.observedTabs[bg.getIndexByTabId(tabId)].filters,
          };
          
          bg.updateFilters(tabId, {
            ...filters,
            autoBook: !filters.autoBook,
          } as TabFilters);
        }
      },
      {
        condition: true,
        elementSelector: '.destination-states-clean-btn',
        event: 'click',
        action: (tabId: number) => {
          const filters: TabFilters = {
            ...bg.observedTabs[bg.getIndexByTabId(tabId)].filters,
          };
          
          bg.updateFilters(tabId, {
            ...filters,
            destinationStatesFilter: [],
          } as TabFilters);
        }
      },
      {
        condition: true,
        elementSelector: '.destination-states-btn',
        event: 'click',
        action: (tabId: number) => {
          const filters = {
            ...bg.observedTabs[bg.getIndexByTabId(tabId)].filters,
          };

          const mapContainer: JQuery<HTMLElement> = jQuery('#map-container');
          const modalBackdrop: JQuery<HTMLElement> = $('.modal-backdrop');
          const selectedStatesList: JQuery<HTMLElement> = $('.selected-states');

          let states: Array<string> = [...filters.destinationStatesFilter];
        
          $('#settings-container').addClass('d-none')
          modalBackdrop.addClass('d-block');
          mapContainer.addClass('d-block');
          
          // The usmap is coming from outside library
          // @ts-ignore
          mapContainer.find('.inner-container').first().usmap({
            showLabels: true,
            click: (_: any, stateData: { name: string }) => {
              const ind: number = states.findIndex((state) => state == stateData.name);
              ind >= 0
                ? states.splice(ind, 1)
                : states.push(stateData.name);

              selectedStatesList.text(states.sort((a: string, b: string) => a.localeCompare(b)).join(', '));
            }
          });

          $('.states-clear-btn').off().on('click', () => {
            states = [];
            selectedStatesList.text(states.join(', '));
          });

          $('.states-cancel-btn').off().on('click', () => {
            this.renderContent(bg);
          });

          $('.states-apply-btn').off().on('click', () => {
            filters.destinationStatesFilter = states;

            bg.updateFilters(tabId, filters);
            this.renderContent(bg);
          });
          
          selectedStatesList.text(states.join(', '));
          modalBackdrop.addClass('show');
          mapContainer.addClass('show');
        },
        withoutUpdate: true,
      },
    ]
    
    actionsMap.forEach((actionMap: ActionMapObject) => {
      if(actionMap.condition) {
        $(actionMap.elementSelector).off().on(actionMap.event, (event: Event) => {
          if(event.target) {
            const eventTarget = $(event.target);
            const tabId = eventTarget.attr('data-tab-id');

            actionMap.action(parseInt(tabId ? tabId : '-1'), eventTarget);

            if (!actionMap.withoutUpdate) {
              this.renderContent(bg);
            }
          }
        });
      } else {
        $(actionMap.elementSelector).off();
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
