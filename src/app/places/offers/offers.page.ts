import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { IonItemSliding } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { Place } from '../place.model';
import { PlacesService } from '../places.service';

@Component({
  selector: 'app-offers',
  templateUrl: './offers.page.html',
  styleUrls: ['./offers.page.scss'],
})
export class OffersPage implements OnInit, OnDestroy {

  offers: Place[];
  isLoading = false;
  private placesSub: Subscription;

  constructor(private placesService: PlacesService,
    private router: Router) { }

  ngOnInit() {
    this.placesSub = this.placesService.places.subscribe(places => {
      this.offers = places
    })
  }

  ionViewWillEnter() {
    this.isLoading = true
    this.placesService.fetchPlaces().subscribe(() => {
      this.isLoading = false
    })
    this.isLoading = false
  }

  // ionViewWillEnter() {
  //   this.offers = this.placesService.getPlaces()
  // }

  onEdit(offerId: number, slidingItem: IonItemSliding) {
    slidingItem.close()
    this.router.navigate(['/', 'places', 'offers', 'edit-offer', offerId])
    // console.log("Editing ", offerId);
  }

  ngOnDestroy() {
    if (this.placesSub) {
      this.placesSub.unsubscribe()
    }
  }

}
