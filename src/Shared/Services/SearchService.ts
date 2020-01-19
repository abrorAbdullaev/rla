import { injectable } from "tsyringe";

@injectable()
export class SearchService {
  search(ids: Array<number>): Promise<Array<{ id: number }>> {
    return new Promise((resolve) => {
      let response = [] as Array<{ id: number }>;
      // let promises = Array<Promise<any>>();
      let resultsCount = 0;

      ids.forEach((id: number) => {
        chrome.tabs.executeScript(id, { 'code': 'document.getElementById("application").innerHTML'}, (result) => {
          let tabListHtml = result[0];
          resultsCount++;

          if(resultsCount == ids.length) {
            resolve(response);
          }
        })
      })
    });
  }
}