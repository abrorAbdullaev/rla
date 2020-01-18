import { injectable } from "tsyringe";

@injectable()
export class TabsService {
  getAllTabs(): Promise<chrome.tabs.Tab[]> {
    return new Promise((resolve) => {
      chrome.tabs.query({}, (tabs) => {
        resolve(tabs);
      });  
    });
  }
}
