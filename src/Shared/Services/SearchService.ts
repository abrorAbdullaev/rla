import $ from 'jquery';
import dayjs from 'dayjs';
import { injectable } from "tsyringe";
import { TabFilters } from '../Models';

@injectable()
export class SearchService {
  private sound: HTMLAudioElement;
  
  constructor() {
    this.sound = new Audio('./assets/sound/horn.mp3');
    this.sound.load();
  }

  search(searchItems: Array<{ tabId: number, filters: TabFilters }>): Promise<Array<{ tabId: number }>> {
    return new Promise((resolve) => {
      let response = [] as Array<{ tabId: number }>;

      this.getSearchedTabsContents(searchItems.map((searchItem) => searchItem.tabId))
        .then((tabsContents) => {
          tabsContents.forEach(({ tabId, content }) => {
            let tabHtmlContent: JQuery<any> = $(content);
            const toursList = tabHtmlContent.find('.tour-listing__card');
            
            const currentSearchedTabFilters = searchItems.find((searchItem) => searchItem.tabId == tabId)?.filters;

            if (currentSearchedTabFilters && !!currentSearchedTabFilters.dateTillFilter && dayjs(currentSearchedTabFilters.dateTillFilter).isValid()) {
              tabHtmlContent = this.applDateTillFilter(tabHtmlContent, currentSearchedTabFilters.dateTillFilter);
            }

            if (toursList.length) {
              response.push({ tabId });
            } else if (this.canRefresh(tabHtmlContent)) {
              this.executeRefresh(tabId);
            }
          });

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

  // TODO Test this out
  private applDateTillFilter(htmlContent: JQuery<any>, dateTilleFilter: string): JQuery<any> {
    htmlContent.filter((_: number, tourItem: HTMLElement) => {
      const tourStarDate = $(tourItem).find('.tour-header__work-opportunity-stop-row .run-stop')
        .first()
        .find('.run-stop-details .tour-header__secondary')
        .first().text();

      return dayjs(tourStarDate).isBefore(dayjs(dateTilleFilter));
    });

    return htmlContent;
  }
}