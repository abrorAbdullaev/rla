import { injectable } from "tsyringe";
import $ from 'jquery';

@injectable()
export class PopupService {
  renderContent(content: string): void {
    const popup = $('#app-wrapper');

    if(popup.length) {
      popup.html(content);
    } else {
      // TODO Error case
    }
  }

  hideLoader(): void {
    const spinner = $('#initialization-spinner');
    spinner.removeClass('d-flex').addClass('d-none');
  }
}
