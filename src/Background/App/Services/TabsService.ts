import { injectable } from "tsyringe";

@injectable()
export class TabsService {
  registerOnCloseEvents(fn: Function): void {
    chrome.tabs.onRemoved.addListener((tabId: number) => {
      fn(tabId);
    });
  }

  changeTabTitle(id: number): void {
    chrome.tabs.executeScript(id, { code: 'document.title = ' + id });
  }
}
