import $ from 'jquery';
import { injectable } from "tsyringe";

@injectable()
export class SearchService {
  private sound: HTMLAudioElement;
  
  constructor() {
    this.sound = new Audio('./assets/sound/horn.mp3');
    this.sound.load();
  }

  search(ids: Array<number>): Promise<Array<{ id: number }>> {
    return new Promise((resolve) => {
      let response = [] as Array<{ id: number }>;
      // let promises = Array<Promise<any>>();
      let resultsCount = 0;

      ids.forEach((id: number) => {
        chrome.tabs.executeScript(id, { 'code': 'document.getElementById("application").innerHTML'}, (result) => {
          let respHtml = $(result[0]);
          resultsCount++;

          if(respHtml.find('.tour-listing__card').length) {
            response.push({ id });
          } else {
            if(respHtml.find('.no-tours-found').length || respHtml.find('.tour-listing--loadboard').length) {
              this.executeRefresh(id);
            }
          }

          if(resultsCount == ids.length) {
            // Play the sound if the results are found
            response.length && this.sound.play();
            resolve(response);
          }
        })
      })
    });
  }

  private executeRefresh(tabId: number): void {
    chrome.tabs.executeScript(tabId, { 'code': 'document.getElementsByClassName("reload-icon")[0].click();' });
  }
}