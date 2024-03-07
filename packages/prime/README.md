# Common

This library was generated with [Angular CLI](https://github.com/angular/angular-cli) version 9.1.11.

## 📦 Install <a name = "install"></a>

To install the package, just run:

```
$ npm install @lib/prime@https://git.uniwork.ltd/Infrastructure/prime.git --save
```

or the following if you are using yarn

```
$ yarn add @lib/prime@https://git.uniwork.ltd/Infrastructure/prime.git
```

## 🔨 Setup <a name = "setup"></a>

Include the library in your module (such as app.module.ts):

```javascript
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { LibCommonModule } from '@lib/common';
import { LibPrimeModule } from '@lib/prime'; // <-- import it
import { AppComponent } from './app.component';

@NgModule({
  declarations: [AppComponent],
  imports: [BrowserModule, LibCommonModule, LibPrimeModule], // <-- and include it
  bootstrap: [AppComponent],
})
export class MyAppModule {}
```
