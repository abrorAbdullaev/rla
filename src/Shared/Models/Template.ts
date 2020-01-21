import { TabInfo } from "..";

export interface MainTemplate {
  observedTabs: TabInfo[],
  currentNotObserved: boolean,
  currentTab?: chrome.tabs.Tab,
}