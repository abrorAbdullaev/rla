import $ from 'jquery';
import { injectable } from "tsyringe";

@injectable()
export class BookingService{
  bookLoad(tabId: number, loadId: string): Promise<boolean> {
    return new Promise((resolve) => {
      chrome.tabs.executeScript(tabId, { 
        code: "document.getElementById('" + loadId +"')" +
          ".getElementsByClassName('tour-header__accept-button--loadboard')[0]" +
          ".getElementsByClassName('btn')[0].click();" +
          "document.getElementsByClassName('confirmation-body')[0]" +
          ".getElementsByClassName('confirmation-body__footer__confirm-button')[0];"
      }, (response: any[] | undefined) => {
        if (!response || !response[0]) {
          resolve(false);
          return;
        }

        chrome.tabs.executeScript(tabId, {
          code: "document.getElementsByClassName('confirmation-body')[0]" +
          ".getElementsByClassName('confirmation-body__footer__confirm-button')[0].click();"
        });

        resolve(true);

        // let counter: number = 0;
        // const interval = setInterval(() => {
        //   chrome.tabs.executeScript(tabId, {
        //     code: "document.getElementById('" +  loadId + "').innerHTML;"
        //   }, (resp: Array<HTMLElement>) => {
        //     const cardButtonsWrapper = $(resp[0]).find('.tour-header__loadboard-buttons');

        //     if (cardButtonsWrapper.length) {
        //       // Booked well
              
        //       clearInterval(interval);
        //       resolve(true);
        //     }

        //     if (counter === 5) {
        //       clearInterval(interval);
        //       resolve(false);
        //     }

        //     counter++;
        //   })
        // }, 1000);
      });      
    });
  }
}