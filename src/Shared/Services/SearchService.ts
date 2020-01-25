import $ from 'jquery';
import dayjs from 'dayjs';
import states from 'states-us';
import { injectable } from "tsyringe";
import { TabFilters } from '../Models';

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
            let tabHtmlContent: JQuery<any> = $(content);
            let toursList = tabHtmlContent.find('.tour-listing__card');
        
            if (toursList.length) {
              const currentSearchedTabFilters = searchItems.find((searchItem) => searchItem.tabId == tabId)?.filters;

              if (currentSearchedTabFilters && !!currentSearchedTabFilters.dateTillFilter && dayjs(currentSearchedTabFilters.dateTillFilter).isValid()) {
                toursList = this.applyDateTillFilter(toursList, currentSearchedTabFilters.dateTillFilter);
              }
  
              if (currentSearchedTabFilters && currentSearchedTabFilters.destinationStatesFilter.length) {
                toursList = this.applyDestinationStatesFilter(toursList, currentSearchedTabFilters.destinationStatesFilter);
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
    chrome.tabs.executeScript(tabId, { 'code': 'document.getElementsByClassName("reload-icon")[0].click();' });
  }

  /**
   * ============================ 
   *  FILTERS
   * ============================
   */

  private applyDateTillFilter(toursList: JQuery<any>, dateTillFilter: string): JQuery<any> {
    const currentYear = dayjs().get('year');
    const allowedStartDate = dayjs(dateTillFilter);

    toursList = toursList.filter((_: any, tourCard: HTMLElement) => {
      const tourStartDate = $(tourCard)
        .find('.tour-header__work-opportunity-stop-row .run-stop:first .tour-header__secondary')
        .text();

      if (!tourStartDate) {
        return false;
      }

      const startDate = dayjs(tourStartDate).set('year', currentYear);
      return startDate.isBefore(allowedStartDate);
    });

    return toursList;
  }

  private applyDestinationStatesFilter(toursList: JQuery<any>, destinationStatesFilter: Array<string>): JQuery<any> {
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
}