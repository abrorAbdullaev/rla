import { TabInfo } from "../../../Shared";

export interface MainTemplate {
  observedTabs: TabInfo[],
  currentNotObserved?: boolean,
  currentTab?: chrome.tabs.Tab,
}