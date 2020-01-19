import { injectable } from "tsyringe";

@injectable()
export class TabsService {
  registerOnCloseEvents(fn: Function): void {
    chrome.tabs.onRemoved.addListener((tabId: number) => {
      fn(tabId);
    });
  }

  changeTabTitle(id: number, removed?: boolean): void {
    let newTitle = id.toString();

    if (removed) {
      newTitle = newTitle + ' (Not Observed)';
    }

    chrome.tabs.executeScript(id, { code: 'document.title = " ' + newTitle + ' "' });
  }
}
