import { injectable } from "tsyringe";

@injectable()
export class TabsService {
  registerOnCloseEvents(fn: Function): void {
    chrome.tabs.onRemoved.addListener((tabId: number) => {
      fn(tabId);
    });
  }

  changeTabTitle(id: number, appendix?: string): void {
    let newTitle = appendix ? id.toString() + ' ' + appendix : id.toString();
    chrome.tabs.executeScript(id, { code: 'document.title = " ' + newTitle + ' "' });
  }
}
