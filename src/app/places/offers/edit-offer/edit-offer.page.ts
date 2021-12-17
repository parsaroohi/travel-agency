import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertController, LoadingController, NavController } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { Place } from '../../place.model';
import { PlacesService } from '../../places.service';

@Component({
  selector: 'app-edit-offer',
  templateUrl: './edit-offer.page.html',
  styleUrls: ['./edit-offer.page.scss'],
})
export class EditOfferPage implements OnInit, OnDestroy {

  place: Place;
  form: FormGroup;
  placeId: string;
  isLoading = false;
  private placeSub: Subscription;

  constructor(private route: ActivatedRoute,
    private placeService: PlacesService,
    private navCtrl: NavController,
    private router: Router,
    private loadingCtrl: LoadingController,
    private alertCtrl: AlertController) { }

  ngOnInit() {
    //get offer id from url
    this.route.paramMap.subscribe(paramMap => {
      if (!paramMap.has('placeId')) {
        this.navCtrl.navigateBack('/places/offers')
        return;
      }
      this.placeId = paramMap.get('placeId')
      this.isLoading = true
      this.placeSub = this.placeService.getPlaceById(paramMap.get('placeId')).subscribe(place => {
        this.place = place
        this.form = new FormGroup({
          title: new FormControl(this.place.title,
            { updateOn: 'blur', validators: [Validators.required] }),
          description: new FormControl(this.place.description,
            { updateOn: 'blur', validators: [Validators.required, Validators.maxLength(200)] }),
        })
        this.isLoading = false
      }, error => {
        this.alertCtrl.create({
          header: "An Error Occured", message: 'Please Try Again Later',
          buttons: [
            {
              text: 'Ok', handler: () => { this.router.navigate(['/places/offers']) }
            }
          ]
        }).then(alertEl => { alertEl.present() })
      })
    })
  }

  onUpdateOffer() {
    if (!this.form.valid) {
      return;
    }

    this.loadingCtrl.create({
      message: 'Updating Place'
    }).then(loadingEl => {
      loadingEl.present()
      this.placeService.updatePlace(this.place.id,
        this.form.value.title, this.form.value.description).subscribe(
          () => {
            loadingEl.dismiss()
            this.form.reset()
            this.router.navigate(['/places/offers'])
          }
        )
    })

  }

  ngOnDestroy() {
    if (this.placeSub) {
      this.placeSub.unsubscribe()
    }
  }

}
