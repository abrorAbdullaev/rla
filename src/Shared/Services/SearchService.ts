import $ from 'jquery';
import { injectable } from "tsyringe";

@injectable()
export class SearchService {
  private sound: HTMLAudioElement;
  
  constructor() {
    this.sound = new Audio('./assets/sound/horn.mp3');
    this.sound.load();
  }

  search(tabIds: Array<number>): Promise<Array<{ tabId: number }>> {
    return new Promise((resolve) => {
      let response = [] as Array<{ tabId: number }>;

      this.getSearchedTabsContents(tabIds).then((tabsContents) => {
        tabsContents.forEach(({tabId, content}) => {
          const tabHtmlContent: JQuery<any> = $(content).first();

          if (tabHtmlContent.find('.tour-listing__card').length) {
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
    return Promise.all(
      tabIds.map((tabId) => ({
        tabId: tabId,
        content: chrome.tabs.executeScript(tabId, { 'code': 'document.getElementById("application").innerHTML' })
      }))
    );
  }

  private canRefresh(htmlContent: JQuery<any>): boolean {
    return htmlContent.find('.no-tours-found').length > 0
      || htmlContent.find('.tour-listing--loadboard').length > 0
  }

  private executeRefresh(tabId: number): void {
    chrome.tabs.executeScript(tabId, { 'code': 'document.getElementsByClassName("reload-icon")[0].click();' });
  }
}