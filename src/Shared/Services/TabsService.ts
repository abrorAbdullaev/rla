import { injectable } from "tsyringe";

@injectable()
export class TabsService {
  registerOnCloseEvents(fn: Function): void {
    chrome.tabs.onRemoved.addListener((tabId: number) => {
      fn(tabId);
    });
  }

  registerOnUpdateEvents(fn: Function): void {
    chrome.tabs.onUpdated.addListener((tabId: number, changeInfo: chrome.tabs.TabChangeInfo) => {        
      if( changeInfo.url && !changeInfo.url.includes('https://relay.amazon.com/tours/loadboard')) {
        chrome.browserAction.setIcon({ path: "./assets/icons/16-on.png" });

        fn(tabId);
      }

      if( changeInfo.status === 'loading' ) {
        fn(tabId);
      }
    })
  }

  changeTabTitle(id: number, appendix?: string): void {
    let newTitle = appendix ? id.toString() + ' ' + appendix : id.toString();
    chrome.tabs.executeScript(id, { code: 'document.title = " ' + newTitle + ' "' });
  }
}
