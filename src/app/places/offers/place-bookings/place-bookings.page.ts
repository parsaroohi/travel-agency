import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NavController } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { Place } from '../../place.model';
import { PlacesService } from '../../places.service';

@Component({
  selector: 'app-place-bookings',
  templateUrl: './place-bookings.page.html',
  styleUrls: ['./place-bookings.page.scss'],
})
export class PlaceBookingsPage implements OnInit, OnDestroy {

  place: Place;
  private placeSub: Subscription;

  constructor(private route: ActivatedRoute,
    private navCtrl: NavController,
    private placeService: PlacesService) { }

  ngOnInit() {
    this.route.paramMap.subscribe(paramMap => {
      if (!paramMap.has('placeId')) {
        this.navCtrl.navigateBack('/palces/offers')
        return;
      }
      this.placeSub = this.placeService.getPlaceById(paramMap.get('placeId')).subscribe(place => {
        this.place = place
      })
    })
  }

  ngOnDestroy() {
    if (this.placeSub) {
      this.placeSub.unsubscribe()
    }
  }

}
