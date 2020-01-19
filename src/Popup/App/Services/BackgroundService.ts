import { injectable } from "tsyringe";
import { Background } from "../Models";

declare global {
  // ToDo Make interface for app
  interface Window { app: any }
}

@injectable()
export class BackgroundService {
  getBackground(): Promise<Background> {
    return new Promise<Background>((resolve) => {
      chrome.runtime.getBackgroundPage((bg) => {
        const observedTabs = bg ? bg.app.observedTabs : [];
        const addObservedTab = bg ? bg.app.addObservedTab : () => {
          console.log('bg observed add function is not found');
        }
        const removeObservedTab = bg ? bg.app.removeObservedTab: () => {
          console.log('bg observed remove function is not found');
        }
        const tabsService = bg ? bg.app.tabsService: {};

        resolve({ 
          observedTabs: observedTabs, 
          addObservedTab: addObservedTab,
          removeObservedTab: removeObservedTab,
          tabsService: tabsService,
        } as Background);
      });
    });
  }

  getCurrentTab(): Promise<chrome.tabs.Tab> {
    return new Promise<chrome.tabs.Tab>((resolve) => {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs: chrome.tabs.Tab[]) => {
        resolve(tabs[0]);
      });
    });
  }
}