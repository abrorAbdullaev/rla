import { injectable } from "tsyringe";

@injectable()
export class BookingService{
  bookLoad(tabId: number, loadId: string): Promise<boolean> {
    return new Promise((resolve) => {
      console.log("document.getElementById('" + loadId +"');");
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

        // chrome.tabs.executeScript(tabId, {
        //   code: "document.getElementsByClassName('confirmation-body')[0]" +
        //   ".getElementsByClassName('confirmation-body__footer__confirm-button')[0].click();"
        // })

        resolve(true);
      });
      
      resolve(true);
    });
  }
}