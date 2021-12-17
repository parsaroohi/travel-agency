import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ActionSheetController, AlertController, LoadingController, ModalController, NavController } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { switchMap, take } from 'rxjs/operators';
import { AuthService } from 'src/app/auth/auth.service';
import { BookingService } from 'src/app/bookings/booking.service';
import { CreateBookingComponent } from 'src/app/bookings/create-booking/create-booking.component';
import { Place } from '../../place.model';
import { PlacesService } from '../../places.service';

@Component({
  selector: 'app-place-detail',
  templateUrl: './place-detail.page.html',
  styleUrls: ['./place-detail.page.scss'],
})
export class PlaceDetailPage implements OnInit, OnDestroy {

  private place: Place;
  private placeSub: Subscription;
  isBookable = false;
  isLoading = false;

  constructor(private navCtrl: NavController,
    private modalCtrl: ModalController,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private placeService: PlacesService,
    private actionSheetCtrl: ActionSheetController,
    private bookingService: BookingService,
    private loadingCtrl: LoadingController,
    private authService: AuthService,
    private alertCtrl: AlertController
  ) { }

  ngOnInit() {
    this.activatedRoute.paramMap.subscribe(paramMap => {
      if (!paramMap.has('placeId')) {
        this.navCtrl.navigateBack('/places/discover')
        return;
      }
      this.isLoading = true
      let fetchedUserId
      this.authService.userId.pipe(take(1), switchMap(
        userId => {
          if (!userId) {
            throw new Error('No User Id Found')
          }
          fetchedUserId = userId
          return this.placeService.getPlaceById(paramMap.get('placeId'))
        }
      )).subscribe(place => {
        this.place = place
        this.isLoading = false
        this.isBookable = place.userId !== fetchedUserId
      }, error => {
        this.alertCtrl.create({
          header: "An Error Occured", message: 'Please Try Again Later',
          buttons: [
            {
              text: 'Ok', handler: () => { this.router.navigate(['/places/discover']) }
            }
          ]
        }).then(alertEl => { alertEl.present() })
      })
    })
  }

  onBookPlace() {
    // this.router.navigateByUrl('/places/discover')
    // this.navCtrl.navigateBack('/places/discover')
    // this.navCtrl.pop()

    this.actionSheetCtrl.create({
      header: "choose an action : ",
      buttons: [
        {
          text: 'select date',
          handler: () => {
            this.openBookingModal('select')
          }
        },
        {
          text: 'random date',
          handler: () => {
            this.openBookingModal('random')
          }
        },
        {
          text: 'cancel',
          role: 'destructive'
        }
      ]
    }).then(actionSheetEl => { actionSheetEl.present() })
  }

  openBookingModal(mode: 'select' | 'random') {
    console.log(mode);
    this.modalCtrl.create({
      component: CreateBookingComponent,
      componentProps: { selectedPlace: this.place, selectedMode: mode }
    })
      .then(modalEl => {
        modalEl.present()
        return modalEl.onDidDismiss()
      }).then(resultData => {
        console.log(resultData.data);
        if (resultData.role === 'confirmation') {
          this.loadingCtrl.create({
            message: 'Booking New Place'
          }).then(loadingEl => {
            loadingEl.present()
            const data = resultData.data.bookingData;
            this.bookingService.addBooking(this.place.id.toString(),
              this.place.title, this.place.imageUrl, data.firstName,
              data.lastName, data.guestNumber, data.startDate, data.endDate).subscribe(
                () => { loadingEl.dismiss() }
              )
          })
        }
      })
  }

  ngOnDestroy() {
    if (this.placeSub) {
      this.placeSub.unsubscribe()
    }
  }

}
