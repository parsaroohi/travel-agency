import { Component, OnDestroy, OnInit } from '@angular/core';
import { PlacesService } from '../places.service';
import { Place } from '../place.model';
import { MenuController } from '@ionic/angular';
import { SegmentChangeEventDetail } from '@ionic/core';
import { Subscription } from 'rxjs';
import { AuthService } from 'src/app/auth/auth.service';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-discover',
  templateUrl: './discover.page.html',
  styleUrls: ['./discover.page.scss'],
})
export class DiscoverPage implements OnInit, OnDestroy {

  loadedPlaces: Place[];
  relevantPlaces: Place[];
  listedLoadedPlaces: Place[];
  private placesSub: Subscription;
  isLoading = false

  constructor(private placeService: PlacesService,
    private menuCtrl: MenuController,
    private authService: AuthService) { }

  ngOnInit() {
    this.placesSub = this.placeService.places.subscribe(places => {
      this.loadedPlaces = places
      this.relevantPlaces = this.loadedPlaces
      this.listedLoadedPlaces = this.relevantPlaces.slice(1);
    });
  }

  ionViewWillEnter() {
    this.isLoading = true
    this.placeService.fetchPlaces().subscribe(
      () => { this.isLoading = false }
    )
  }

  onOpenMenu() {
    this.menuCtrl.toggle('menu_1')
  }

  onFilterUpdate(event: CustomEvent<SegmentChangeEventDetail>) {
    this.authService.userId.pipe(take(1)).subscribe(
      userId => {
        if (event.detail.value === 'all') {
          this.relevantPlaces = this.loadedPlaces
          this.listedLoadedPlaces = this.relevantPlaces.slice(1)
        } else {
          this.relevantPlaces = this.loadedPlaces.filter(
            place => place.userId !== userId
          )
          this.listedLoadedPlaces = this.relevantPlaces.slice(1)
        }
      }
    )
  }

  ngOnDestroy() {
    if (this.placesSub) {
      this.placesSub.unsubscribe()
    }
  }

}
