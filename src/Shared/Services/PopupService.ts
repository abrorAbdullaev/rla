import { injectable } from "tsyringe";
import * as Mustache from 'mustache';
import $ from 'jquery';
// import csc from 'country-state-city';
// import states from 'states-us';
import { MainTemplate, TabFilters, TabInfo, TabOriginStateInfo } from "../Models";
import { App as BackgroundApp } from '../../Background/App/App';
import dayjs from 'dayjs-ext';
// import states from 'states-us';

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
      cityNameHints: [],
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
        elementSelector: '.tab-print-btn',
        event: 'click',
        action: (tabId: number) => {
          const ind: number = bg.getIndexByTabId(tabId);
          const tabInfo: TabInfo = bg.observedTabs[ind];

          const doc = this.getPrintableObject(tabInfo);
          doc.save(dayjs().format('DD-MM-YYYY|HH:mm').toString() + '.pdf');
        }
      },
      {
        condition: true,
        elementSelector: '[name="stops-count-filter"]',
        event: 'change',
        action: (tabId: number, eventTarget: JQuery<EventTarget>) => {
          const val = eventTarget.val();
          const filters: TabFilters = {
            ...bg.observedTabs[bg.getIndexByTabId(tabId)].filters,
          }

          filters.stopsCount = val ? parseInt(val.toString(), 10) : 4;
          bg.updateFilters(tabId, filters);
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
        elementSelector: '[name="origin-city-name"]',
        event: 'change',
        action: (tabId: number, eventTarget: JQuery<Element>) => {
          const cityName = eventTarget.val();
          const stateName = eventTarget.attr('data-state-name');
          const filters: TabFilters = {
            ...bg.observedTabs[bg.getIndexByTabId(tabId)].filters,
          };

          const originFilterInd = filters.originStatesFilter.findIndex((originStateInfo) => {
            const formattedStateName = originStateInfo.stateName.toLowerCase();
            const targetStateName = stateName ? stateName.toLowerCase() : '';

            return formattedStateName === targetStateName;
          });

          filters.originStatesFilter[originFilterInd].city = cityName ? cityName.toString() : '';

          bg.updateFilters(tabId, {
            ...filters,
          } as TabFilters);
        }
      },
      // {
      //   condition: true,
      //   elementSelector: '[name="origin-city-name"]',
      //   event: 'keyup',
      //   withoutUpdate: true,
      //   action: (_, eventTarget: JQuery<Element>) => {
      //     const cityName = eventTarget.val();
      //     const stateName = eventTarget.attr('data-state-name');

      //     if (cityName && cityName.toString().length > 2 && stateName) {
      //       const cityHints = this.getCityHints(stateName, cityName.toString());

      //       console.log(cityHints);
      //     }
      //   }
      // },
      {
        condition: true,
        elementSelector: '[name="origin-state-date-till"]',
        event: 'change',
        action: (tabId: number, eventTarget: JQuery<Element>) => {
          const val = eventTarget.val();
          const stateName = eventTarget.attr('data-state-name');
          const filters: TabFilters = {
            ...bg.observedTabs[bg.getIndexByTabId(tabId)].filters,
          };
          const originFilterInd = filters.originStatesFilter.findIndex((originStateInfo) => {
            const formattedStateName = originStateInfo.stateName.toLowerCase();
            const targetStateName = stateName ? stateName.toLowerCase() : '';

            return formattedStateName === targetStateName;
          });
            
          filters.originStatesFilter[originFilterInd].time = val ? val.toString() : '';

          bg.updateFilters(tabId, {
            ...filters,
          } as TabFilters);
        }
      },
      {
        condition: true,
        elementSelector: '[name="origin-state-radius"]',
        event: 'change',
        action: (tabId: number, eventTarget: JQuery<Element>) => {
          const val = eventTarget.val();
          const stateName = eventTarget.attr('data-state-name');
          const filters: TabFilters = {
            ...bg.observedTabs[bg.getIndexByTabId(tabId)].filters,
          };

          const originFilterInd = filters.originStatesFilter.findIndex((originStateInfo) => {
            const formattedStateName = originStateInfo.stateName.toLowerCase();
            const targetStateName = stateName ? stateName.toLowerCase() : '';

            return formattedStateName === targetStateName;
          });
            
          filters.originStatesFilter[originFilterInd].radius = val ? parseInt(val.toString(), 10) : 0;

          bg.updateFilters(tabId, {
            ...filters,
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
      {
        condition: true,
        elementSelector: '.origin-states-clean-btn',
        event: 'click',
        action: (tabId: number) => {
          const filters: TabFilters = {
            ...bg.observedTabs[bg.getIndexByTabId(tabId)].filters,
          };
          
          bg.updateFilters(tabId, {
            ...filters,
            originStatesFilter: [],
          } as TabFilters);
        }
      },
      {
        condition: true,
        elementSelector: '.origin-states-btn',
        event: 'click',
        action: (tabId: number) => {
          const filters = {
            ...bg.observedTabs[bg.getIndexByTabId(tabId)].filters,
          };

          const mapContainer: JQuery<HTMLElement> = jQuery('#map-container');
          const modalBackdrop: JQuery<HTMLElement> = $('.modal-backdrop');
          const selectedStatesList: JQuery<HTMLElement> = $('.selected-states');

          let states: Array<TabOriginStateInfo> = [...filters.originStatesFilter];
        
          $('#settings-container').addClass('d-none')
          modalBackdrop.addClass('d-block');
          mapContainer.addClass('d-block');
          
          // The usmap is coming from outside library
          // @ts-ignore
          mapContainer.find('.inner-container').first().usmap({
            showLabels: true,
            click: (_: any, stateData: { name: string }) => {
              const ind: number = states.findIndex((state) => state.stateName == stateData.name);
              
              ind >= 0
                ? states.splice(ind, 1)
                : states.push({
                  stateName: stateData.name,
                  city: '',
                  time: '',
                } as TabOriginStateInfo);

                selectedStatesList.text(
                  states.map((state) => state.stateName)
                    .sort((a: string, b: string) => a.localeCompare(b)).join(', '),
                );
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
            filters.originStatesFilter = states;

            bg.updateFilters(tabId, filters);
            this.renderContent(bg);
          });
          
          selectedStatesList.text(states.map((state) => state.stateName).join(', '));
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

  private getPrintableObject(tabInfo: TabInfo): any {
    // Comes from outside source
    // TODO Make types
    // @ts-ignore
    const doc = new jsPDF();

    const rowHeight:  number = 10;
    const leftOffset: number = 15;

    let top: number = 15;

    const configs = {
      'width': 500,
      'elementHandlers': {
        '#editor': function (element: any, renderer: any) {
            return true;
        }
      }
    }
  
    doc.fromHTML("<h1>Relay Auto Booked Load Info</h1>", 65, top, configs);
    top += 2 * rowHeight;

    doc.fromHTML("<h2>Applied Filters</h2>", leftOffset, top, configs);
    top += rowHeight;

    // TODO Move to array
    doc.fromHTML("<span><strong>Date Till Filter:</strong></span>", leftOffset, top, configs);
    // TODO Add from origin state filter
    // doc.fromHTML("<span>" + tabInfo.filters.dateTillFilter + "</span>", leftOffset + 60, top, configs);
    top += 5;
    doc.line(leftOffset, top, leftOffset + 100, top);
    top += 3;

    doc.fromHTML("<span><strong>Destination States Filter:</strong></span>", leftOffset, top, configs);
    doc.fromHTML("<span>" + tabInfo.filters.destinationStatesFilter.join(', ') + "</span>", leftOffset + 60, top, configs);
    top += 5;
    doc.line(leftOffset, top, leftOffset + 100, top);
    top += 3;

    doc.fromHTML("<span><strong>Auto Booking:</strong></span>", leftOffset, top, configs);
    doc.fromHTML("<span>" + tabInfo.filters.autoBook + "</span>", leftOffset + 60, top, configs);
    top += 5;
    doc.line(leftOffset, top, leftOffset + 100, top);
    top += 3;

    if (tabInfo.printInfo.loadHtml) {
      const loadHtml = tabInfo.printInfo.loadHtml;

      top += rowHeight;
      doc.fromHTML("<h2>Booked Load</h2>", leftOffset, top, configs);
      top += rowHeight;

      doc.fromHTML("<span><strong>Price Information</strong></span>", leftOffset, top, configs);
      top += 5
      doc.fromHTML(loadHtml.find('.tour-header__loadboard-payout--desktop').html(), leftOffset, top, configs);

      top += 10
      doc.fromHTML("<span><strong>Origin Information</strong></span>", leftOffset, top, configs);
      doc.fromHTML("<span><strong>Destination Information</strong></span>", leftOffset + 70, top, configs);
      
      top += 5
      doc.fromHTML(loadHtml.find('.run-stop').first().html(), 
        leftOffset, top, configs);
      doc.fromHTML(loadHtml.find('.run-stop').last().html(), 
      leftOffset + 70, top, configs);

      top += 5 + rowHeight;
      doc.fromHTML("<span><strong>Distance Information</strong></span>", leftOffset, top, configs);
      top += 5;
      doc.fromHTML(loadHtml.find('.tour-header__distance-trailer-row').html(), leftOffset, top, configs);

      top += 2 * rowHeight;
      doc.fromHTML("<h2>Raw Data</h2>", leftOffset, top, configs);
      top += rowHeight;
      doc.fromHTML(loadHtml.html(), leftOffset, top, configs);
    }

    return doc;
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

  // TODO Move to separate service
  // private getCityHints(stateAbr: string, cityName: string) {
  //   const resultCityHints = [];

  //   const stateName = states.find((state) => state.abbreviation.toLowerCase() == stateAbr.toLowerCase())?.name;
  
  //   // US country id 231
  //   const originState = csc.getStatesOfCountry('231').find((state) => state.name.toLowerCase() == stateName?.toLowerCase()); 
  //   const cities = csc.getCitiesOfState(originState ? originState.id : '');
    
  //   return cities;
  // }
}
