import { Component, OnDestroy, OnInit } from '@angular/core';
import { IonItemSliding, LoadingController } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { Booking } from './booking.model';
import { BookingService } from './booking.service';

@Component({
  selector: 'app-bookings',
  templateUrl: './bookings.page.html',
  styleUrls: ['./bookings.page.scss'],
})
export class BookingsPage implements OnInit, OnDestroy {

  loadedBooking: Booking[];
  private bookSub: Subscription;
  isLoading = false;

  constructor(private bookingService: BookingService,
    private loadingCtrl: LoadingController) { }

  ngOnInit() {
    this.bookSub = this.bookingService.bookings.subscribe(bookings => {
      this.loadedBooking = bookings
    })
  }

  ionViewWillEnter() {
    this.isLoading = true
    this.bookingService.fetchBookings().subscribe(() => {
      this.isLoading = false
    })
  }

  onCancelBooking(offerId: string, slidingEl: IonItemSliding) {
    slidingEl.close()
    this.loadingCtrl.create({
      message: 'Canceling Booking'
    }).then(loadingEl => {
      loadingEl.present()
      this.bookingService.cancelBooking(offerId).subscribe(
        () => { loadingEl.dismiss() }
      )
    })
  }

  ngOnDestroy() {
    if (this.bookSub) {
      this.bookSub.unsubscribe()
    }
  }

}
