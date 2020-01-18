import { injectable } from 'tsyringe';

@injectable()
export class App {
  init(): void {
    console.log('initialized');
  }

  liveCheck(): void {
    setInterval(() => {
      console.log('Live Check: ');
    }, 5000);
  }
}
