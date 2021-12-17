import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { ModalController } from '@ionic/angular';
import { Place } from 'src/app/places/place.model';

@Component({
  selector: 'app-create-booking',
  templateUrl: './create-booking.component.html',
  styleUrls: ['./create-booking.component.scss'],
})
export class CreateBookingComponent implements OnInit {

  @Input() selectedPlace: Place;
  @Input() selectedMode: 'select' | 'random';
  @ViewChild('f', null) form: NgForm
  startDate: string;
  endDate: string;

  constructor(private modalCtrl: ModalController) { }

  ngOnInit() {
    const availableFrom = this.selectedPlace.availableFrom
    const availableTo = this.selectedPlace.availableTo
    if (this.selectedMode === 'random') {
      this.startDate = new Date(availableFrom.getTime() +
        Math.random() * (availableTo.getTime() - 7 * 24 * 60 * 60 * 1000 - availableFrom.getTime()))
        .toISOString()
      this.endDate = new Date(new Date(this.startDate).getTime() +
        Math.random() * (6 * 24 * 60 * 60 * 1000))
        .toISOString()
    }
  }

  onCancel() {
    this.modalCtrl.dismiss(null, 'cancel')
  }

  onBookPlace() {
    if (!this.form.valid || !this.dateValid()) { return; }
    this.modalCtrl.dismiss({
      bookingData: {
        firstName: this.form.value['first-name'],
        lastName: this.form.value['last-name'],
        guestNumber: +this.form.value['guest-numbers'],
        startDate: new Date(this.form.value['date-from']),
        endDate: new Date(this.form.value['date-to']),
      }
    }, 'confirmation')
  }

  dateValid() {
    const startDate = new Date(this.form.value['date-from'])
    const endDate = new Date(this.form.value['date-to'])

    return endDate > startDate;
  }

}
