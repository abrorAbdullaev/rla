import { injectable } from "tsyringe";

@injectable()
export class PopupService {
  renderContent(content: string): void {
    const popup = document.getElementById('app-wrapper');

    console.log(document);

    if(popup) {
      popup.innerHTML = content;
    } else {
      // TODO Error case
    }
  }
}