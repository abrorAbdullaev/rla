import $ from 'jquery';
import dayjs from 'dayjs-ext';
import states from 'states-us';
import { injectable } from "tsyringe";
import { TabFilters, TabOriginStateInfo } from '../Models';

@injectable()
export class SearchService {
  private sound: HTMLAudioElement;
  
  constructor() {
    this.sound = new Audio('./assets/sound/horn.mp3');
    this.sound.load();
  }

  search(searchItems: Array<{ tabId: number, filters: TabFilters }>): Promise<Array<{ tabId: number, loadCardItem: JQuery<HTMLElement>, autoBook: boolean }>> {
    return new Promise((resolve) => {
      let response = [] as Array<{ tabId: number, loadCardItem: JQuery<HTMLElement>, autoBook: boolean }>;

      this.getSearchedTabsContents(searchItems.map((searchItem) => searchItem.tabId))
        .then((tabsContents) => {
          tabsContents.forEach(({ tabId, content }) => {
            let tabHtmlContent: JQuery<HTMLElement> = $(content);
            let toursList = tabHtmlContent.find('.tour-listing__card');
        
            if (toursList.length) {
              const currentSearchedTabFilters = searchItems.find((searchItem) => searchItem.tabId == tabId)?.filters;

              if (currentSearchedTabFilters && currentSearchedTabFilters.originStatesFilter.length) {
                toursList = this.applyOriginStatesFilter(toursList, currentSearchedTabFilters.originStatesFilter);
              }

              if (currentSearchedTabFilters && currentSearchedTabFilters.destinationStatesFilter.length) {
                toursList = this.applyDestinationStatesFilter(toursList, currentSearchedTabFilters.destinationStatesFilter);
              }

              if (currentSearchedTabFilters && currentSearchedTabFilters.stopsCount > 0) {
                toursList = this.applyStopsCountFilter(toursList, currentSearchedTabFilters.stopsCount);
              }

              if (toursList.length) {
                response.push({ 
                  tabId,
                  loadCardItem: toursList.first(),
                  autoBook: !!currentSearchedTabFilters && !!currentSearchedTabFilters.autoBook,
                });
              }
            }
            
            if (!toursList.length && this.canRefresh(tabHtmlContent)) {
              this.executeRefresh(tabId);
            }
          });

          if (response.length) {
            this.sound.play();
          }

          resolve(response);
        });
    });
  }

  private getSearchedTabsContents(tabIds: number[]): Promise<Array<{ tabId: number, content: any }>> {
    let resultsCount = 0;
    let response: Array<{ tabId: number, content: any }> = [];
    
    return new Promise<Array<{ tabId: number, content: any }>>((resolve) => {
      tabIds.forEach((tabId) => {
        chrome.tabs.executeScript(tabId, { 'code': 'document.getElementById("application").innerHTML' }, (resp) => {
          response.push({ tabId, content: resp[0]});
          resultsCount++;

          // Iterations finished
          if(resultsCount === tabIds.length) {
            resolve(response);
          }
        });
      });
    });
  }

  private canRefresh(htmlContent: JQuery<any>): boolean {
    return htmlContent.find('.no-tours-found').length > 0
      || htmlContent.find('.tour-listing--loadboard').length > 0
  }

  private executeRefresh(tabId: number): void {
    chrome.tabs.executeScript(tabId, { 'code': 'document.getElementsByClassName("loadboard-reload__refresh-icon--reload-icon")[0].click();' });
  }

  /**
   * ============================ 
   *  FILTERS
   * ============================
   */

  private applyDestinationStatesFilter(toursList: JQuery<HTMLElement>, destinationStatesFilter: Array<string>): JQuery<HTMLElement> {
    toursList = toursList.filter((_: any, tourCard: HTMLElement) => {
      const tourDestinationInfo: string = $(tourCard)
        .find('.tour-header__work-opportunity-stop-row .run-stop:last .city')
        .text();

      const destinationState = states.find((state) => {
        const matchPattern = new RegExp('\\s' + state.name.toLowerCase() + '\\s|\\s' + state.abbreviation.toLowerCase() + '\\s');
        return tourDestinationInfo.toLowerCase().match(matchPattern);
      });
      
      return !!(destinationState && destinationStatesFilter.includes(destinationState.abbreviation));
    });

    return toursList;
  }

  private applyOriginStatesFilter(toursList: JQuery<HTMLElement>, originStatesFilter: Array<TabOriginStateInfo>): JQuery<HTMLElement> {
    toursList = toursList.filter((_: any, tourCard: HTMLElement) => {
      const tourOriginInfo: string = $(tourCard)
      .find('.tour-header__work-opportunity-stop-row .run-stop:first .city')
      .text();

      const tourOriginState = states.find((state) => {
        const matchPattern = new RegExp('\\s' + state.name.toLowerCase() + '\\s|\\s' + state.abbreviation.toLowerCase() + '\\s');
        return tourOriginInfo.toLowerCase().match(matchPattern);
      });

      const matchedOriginState = originStatesFilter.find((originStatesInfo) => 
        originStatesInfo.stateName.toLowerCase() === tourOriginState?.abbreviation.toLowerCase());

      if (!!matchedOriginState) {
        let citiesMatch = true;
        let timeMatch = true;

        if (!!matchedOriginState.city) {
          const matchPattern = new RegExp('\\s' + matchedOriginState.city.toLowerCase() + ',');
          citiesMatch = !!tourOriginInfo.toLowerCase().match(matchPattern);
        }

        if (!!matchedOriginState.time) {
          const tourStartDate = $(tourCard)
            .find('.tour-header__work-opportunity-stop-row .run-stop:first .tour-header__secondary')
            .text();

            if (!tourStartDate) {
              timeMatch = false;
            } else {
              const currentYear = dayjs().year();
              const allowedStartDate = dayjs(matchedOriginState.time);
              const startDate = dayjs(tourStartDate).set('year', currentYear);

              timeMatch = startDate.isBefore(allowedStartDate);
            }
        }

        return citiesMatch && timeMatch;
      }

      return false;
    });
    
    return toursList;
  }

  private applyStopsCountFilter(toursList: JQuery<HTMLElement>, maxStopsCount: number): JQuery<HTMLElement> {
    toursList = toursList.filter((_: any, tourCard: HTMLElement) => {
      const stopsCount: number = parseInt($(tourCard).find('.run-stop:last .tour-card__stop-number-circle').text(), 10);

      return !isNaN(stopsCount) && stopsCount <= maxStopsCount;
    });
    
    return toursList;
  }
}