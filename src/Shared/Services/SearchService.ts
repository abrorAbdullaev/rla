import $ from 'jquery';
import dayjs from 'dayjs-ext';
import states from 'states-us';
import { injectable } from "tsyringe";
import { TabFilters, TabOriginStateInfo } from '../Models';
import { LocationService } from './LocationService';

@injectable()
export class SearchService {
  private sound: HTMLAudioElement;
  private locationService: LocationService;
  
  constructor() {
    this.locationService = new LocationService();
    this.sound = new Audio('./assets/sound/horn.mp3');
    this.sound.load();
  }

  search(searchItems: Array<{ tabId: number, filters: TabFilters }>): Promise<Array<{ tabId: number, loadCardItem: JQuery<HTMLElement>, autoBook: boolean }>> {
    return new Promise((resolve) => {
      let response = [] as Array<{ tabId: number, loadCardItem: JQuery<HTMLElement>, autoBook: boolean }>;

      this.getSearchedTabsContents(searchItems.map((searchItem) => searchItem.tabId))
        .then((tabsContents) => {
          tabsContents.forEach(({ tabId, content }) => {
            let tabHtmlContent: JQuery<HTMLElement> = $(content);
            let toursList = tabHtmlContent.find('.tour-listing--loadboard:first .tour-listing__card');

            // Not found
            if (tabHtmlContent.find('.no-tours-found').length) {
              toursList = $([]);
            }
        
            if (toursList.length) {
              const currentSearchedTabFilters = searchItems.find((searchItem) => searchItem.tabId == tabId)?.filters;

              if (currentSearchedTabFilters?.withLogs && currentSearchedTabFilters?.stopsCount > 0) {
                console.log('Starting stops count filter with items: ', toursList);
              }

              if (currentSearchedTabFilters && currentSearchedTabFilters?.stopsCount > 0) {
                toursList = this.applyStopsCountFilter(toursList, currentSearchedTabFilters.stopsCount);
              }

              if (currentSearchedTabFilters?.withLogs && currentSearchedTabFilters?.stopsCount > 0) {
                console.log('Finished stops count filter with items: ', toursList);
              }

              // TODO Optimize for better readability
              if (currentSearchedTabFilters && currentSearchedTabFilters.originStatesFilter.length) {
                if (currentSearchedTabFilters.withLogs) {
                  console.log('starting origin states filter with items: ', toursList);
                }

                this.applyOriginStatesFilter(toursList, currentSearchedTabFilters.originStatesFilter, currentSearchedTabFilters.withLogs).then((toursList) => {
                  if (currentSearchedTabFilters.withLogs) { 
                    console.log('Finished origin states filter with items: ', toursList);
                  }

                  if (toursList.length) {
                    response.push({ 
                      tabId,
                      loadCardItem: toursList.first(),
                      autoBook: !!currentSearchedTabFilters && !!currentSearchedTabFilters.autoBook,
                    });

                    this.sound.play();
                    resolve(response);
                  } else {
                    if (currentSearchedTabFilters.withLogs) { 
                      console.log('executing refresh as no loads have been found!');
                    }

                    if (this.canRefresh(tabHtmlContent)) {
                      if (currentSearchedTabFilters.withLogs) { 
                        console.log('Skipped refresh as it was not available');
                      }
     
                      this.executeRefresh(tabId);
                    }

                    resolve(response);
                  }
                });
              } else {
                // Origin Filter is not set
                if (currentSearchedTabFilters?.withLogs) { 
                  console.log('Skipping origin filters, as they are not set, current result: ', toursList);
                }

                if (toursList.length) {
                  response.push({ 
                    tabId,
                    loadCardItem: toursList.first(),
                    autoBook: !!currentSearchedTabFilters && !!currentSearchedTabFilters.autoBook,
                  });

                  this.sound.play();
                  resolve(response);
                } else {
                  if (this.canRefresh(tabHtmlContent)) {
                    this.executeRefresh(tabId);
                  }

                  resolve(response);
                }
              }
            } else {
              if(this.canRefresh(tabHtmlContent)) {
                this.executeRefresh(tabId);
              }

              resolve(response);
            }
          });
        });
    });
  }

  private getSearchedTabsContents(tabIds: number[]): Promise<Array<{ tabId: number, content: any }>> {
    let resultsCount = 0;
    let response: Array<{ tabId: number, content: any }> = [];
    
    return new Promise<Array<{ tabId: number, content: any }>>((resolve) => {
      tabIds.forEach((tabId) => {
        chrome.tabs.executeScript(tabId, { 'code': 'document.getElementById("application").innerHTML' }, (resp) => {
          response.push({ tabId, content: resp[0]});
          resultsCount++;

          // Iterations finished
          if(resultsCount === tabIds.length) {
            resolve(response);
          }
        });
      });
    });
  }

  private canRefresh(htmlContent: JQuery<any>): boolean {
    return htmlContent.find('.no-tours-found').length > 0
      || htmlContent.find('.tour-listing--loadboard').length > 0
  }

  private executeRefresh(tabId: number): void {
    chrome.tabs.executeScript(tabId, { 'code': 'document.getElementsByClassName("loadboard-reload__refresh-icon--reload-icon")[0].click();' });
  }

  /**
   * ============================ 
   *  FILTERS
   * ============================
   */

  private applyDestinationStatesFilter(toursList: JQuery<HTMLElement>, destinationStatesFilter: Array<string>): JQuery<HTMLElement> {
    toursList = toursList.filter((_: any, tourCard: HTMLElement) => {
      const tourDestinationInfo: string = $(tourCard)
        .find('.tour-header__work-opportunity-stop-row .run-stop:last .city')
        .text();

      const destinationState = states.find((state) => {
        const matchPattern = new RegExp('\\s' + state.name.toLowerCase() + '\\s|\\s' + state.abbreviation.toLowerCase() + '\\s');
        return tourDestinationInfo.toLowerCase().match(matchPattern);
      });
      
      return !!(destinationState && destinationStatesFilter.includes(destinationState.abbreviation));
    });

    return toursList;
  }

  private applyOriginStatesFilter(toursList: JQuery<HTMLElement>, originStatesFilter: Array<TabOriginStateInfo>, withLogs?: boolean): Promise<JQuery<HTMLElement>> {
    return new Promise<JQuery<HTMLElement>>((resolve) => {
      let response: Array<HTMLElement> = [];
      let currentItemIndex = 0;

      const iterate = () => {
        if (currentItemIndex >= toursList.length) {
          resolve($(response));
          return;
        }

        if (withLogs) {
          console.log('%c Starting the origin filters for: ', 'background: #222; color: #bada55');
          console.log($(toursList[currentItemIndex])
          .find('.tour-header__work-opportunity-stop-row .run-stop:first')
          .text());
        }

        const tourOriginInfo: string = $(toursList[currentItemIndex])
          .find('.tour-header__work-opportunity-stop-row .run-stop:first .city')
          .text();

        if (withLogs) {
          console.log('tour origin info: ', tourOriginInfo);
        }

        const tourOriginState = states.find((state) => {
          const matchPattern = new RegExp('\\s' + state.name.toLowerCase() + '\\s|\\s' + state.abbreviation.toLowerCase() + '\\s');
          return tourOriginInfo.toLowerCase().match(matchPattern);
        });

        const matchedOriginState = originStatesFilter.find((originStatesInfo) => 
          originStatesInfo.stateName.toLowerCase() === tourOriginState?.abbreviation.toLowerCase());

        if (!!matchedOriginState) {
          let timeMatch = true;
          let destinationMatch = true;

          if (!!matchedOriginState.time) {          
            const tourStartDate = $(toursList[currentItemIndex])
              .find('.tour-header__work-opportunity-stop-row .run-stop:first .tour-header__secondary')
              .text();
 
              if (withLogs) { 
                console.log('Starting time check, filters: ', matchedOriginState.time, tourStartDate);
              }
              
              if (!tourStartDate) {
                timeMatch = false;
              } else {
                const currentYear = dayjs().year();
                const allowedStartDate = dayjs(matchedOriginState.time);
                const startDate = dayjs(tourStartDate).set('year', currentYear);
 
                if (withLogs) {
                  console.log('actual match times: ', startDate, allowedStartDate);
                }

                timeMatch = startDate.isBefore(allowedStartDate);
              }
          }

          if (withLogs) {
            console.log('Time check passed with result: ', timeMatch);
          }

          if (!!matchedOriginState.destinationStates && timeMatch) {
            if (withLogs) {
              console.log('Starting destination filter', matchedOriginState.destinationStates.join(', '));
            }

            const tourDestinationInfo: string = $(toursList[currentItemIndex])
              .find('.tour-header__work-opportunity-stop-row .run-stop:last .city')
              .text();

            const destinationState = states.find((state) => {
              const matchPattern = new RegExp('\\s' + state.name.toLowerCase() + '\\s|\\s' + state.abbreviation.toLowerCase() + '\\s');
              return tourDestinationInfo.toLowerCase().match(matchPattern);
            });
            
            destinationMatch = !!(destinationState && matchedOriginState.destinationStates.includes(destinationState.abbreviation));
          }

          if (!!matchedOriginState.city && timeMatch && destinationMatch) {
            if (withLogs) {
              console.log('Starting city (distance) filter', matchedOriginState.city);
            }
            
            Promise.all([
              this.locationService.getLocationLatLong(matchedOriginState.city),
              this.locationService.getLocationLatLong(tourOriginInfo.split(/(?<=^\S+)\s/)[1]),
            ]).then(([filterCityLocation, tourCityLocation]) => {
              if (withLogs) {
                console.log('location of city from filters ', filterCityLocation);
                console.log('tour city location ', tourCityLocation);
              }

              if (!!filterCityLocation || !!tourCityLocation) {
                const distance = this.locationService.calculateDistance(filterCityLocation, tourCityLocation);

                if (withLogs) {
                  console.log('distance: ', distance);
                }

                // I know with this code your eyes are dropping with blood, sorry (
                if (!!matchedOriginState.radius) {
                  if (distance < matchedOriginState.radius && distance >= 0) {
                    console.log('load has passed all filters');
                    console.log('radius: ', matchedOriginState.radius, ' distance: ', distance);
                    response.push(toursList[currentItemIndex]);
                  } else if (withLogs) {
                    console.log('Radius was set and distance didn`t pass the filter');
                  }
                } else if (distance < 100 && distance >= 0) {
                  response.push(toursList[currentItemIndex]);
                } else if (withLogs) {
                  console.log('Radius was set and distance didn`t pass the filter');
                }
              }

              currentItemIndex++;
            });
          } else {
            if (timeMatch) {
              response.push(toursList[currentItemIndex]);
            }
            
            currentItemIndex++;
          }
        } else {
          console.log('skipping the load as the origin state didn\'t match');
          currentItemIndex++;
        }

        iterate();
      }

      iterate();
    });
  }

  private applyStopsCountFilter(toursList: JQuery<HTMLElement>, maxStopsCount: number): JQuery<HTMLElement> {
    toursList = toursList.filter((_: any, tourCard: HTMLElement) => {
      const stopsCount: number = parseInt($(tourCard).find('.run-stop:last .tour-card__stop-number-circle').text(), 10);

      return !isNaN(stopsCount) && stopsCount <= maxStopsCount;
    });
    
    return toursList;
  }
}