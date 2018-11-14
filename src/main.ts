import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { environment } from './environments/environment';
import { RulesBuilderModule } from './app/rules-builder/rules-builder.module';

if (environment.production) {
  enableProdMode();
}

platformBrowserDynamic().bootstrapModule(RulesBuilderModule)
  .catch(err => console.error(err));
