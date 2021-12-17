import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { OffersPageRoutingModule } from './offers-routing.module';

import { OffersPage } from './offers.page';
import { OfferItemComponent } from './offer-item/offer-item.component';
import { Map } from 'mapir-angular';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    OffersPageRoutingModule,
    Map
  ],
  declarations: [OffersPage, OfferItemComponent]
})
export class OffersPageModule { }
