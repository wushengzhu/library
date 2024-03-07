import { NgModule, ModuleWithProviders } from '@angular/core';
import { LibGridModule } from '@lib/prime/grid';

export * from '@lib/prime/grid';

const modules = [LibGridModule];

@NgModule({
  imports: [...modules],
  exports: [...modules],
})
export class LibPrimeModule {
  static forRoot(): ModuleWithProviders<LibPrimeModule> {
    return {
      ngModule: LibPrimeModule,
    };
  }
}
