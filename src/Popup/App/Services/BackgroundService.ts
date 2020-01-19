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

        resolve({ 
          observedTabs: observedTabs, 
          addObservedTab: addObservedTab 
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