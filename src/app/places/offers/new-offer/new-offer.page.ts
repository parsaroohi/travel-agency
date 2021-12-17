import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { LoadingController } from '@ionic/angular';
import { switchMap } from 'rxjs/operators';
import { PlacesService } from '../../places.service';

function base64toBlob(base64Data, contentType) {
  contentType = contentType || ''
  const sliceSize = 1024
  const byteCharacters = window.atob(base64Data)
  const bytesLength = byteCharacters.length
  const sliceCount = Math.ceil(bytesLength / sliceSize)
  const byteArrays = new Array(sliceCount)
  for (let sliceIndex = 0; sliceIndex < sliceCount; ++sliceIndex) {
    const begin = sliceIndex * sliceSize
    const end = Math.min(begin + sliceSize, bytesLength)
    const bytes = new Array(end - begin)
    for (let offset = begin, i = 0; offset < end; ++i, ++offset) {
      bytes[i] = byteCharacters[offset].charCodeAt(0)
    }
    byteArrays[sliceIndex] = new Uint8Array(bytes)
  }
  return new Blob(byteArrays, { type: contentType })
}

@Component({
  selector: 'app-new-offer',
  templateUrl: './new-offer.page.html',
  styleUrls: ['./new-offer.page.scss'],
})
export class NewOfferPage implements OnInit {

  form: FormGroup

  constructor(private placeService: PlacesService,
    private router: Router,
    private loadingCtrl: LoadingController) {
    this.form = new FormGroup({
      title: new FormControl(null, { updateOn: 'blur', validators: [Validators.required] }),
      description: new FormControl(null, { updateOn: 'blur', validators: [Validators.required, Validators.maxLength(200)] }),
      price: new FormControl(null, { updateOn: 'blur', validators: [Validators.required, Validators.min(1)] }),
      dateFrom: new FormControl(null, { updateOn: 'blur', validators: [Validators.required] }),
      dateTo: new FormControl(null, { updateOn: 'blur', validators: [Validators.required] }),
      image: new FormControl(null)
    })
  }

  ngOnInit() {
  }

  onCreateOffer() {
    if (!this.form.valid ||
      !this.form.get('image').value) {
      return;
    }

    console.log(this.form.value);

    this.loadingCtrl.create({
      message: 'Creating Place'
    }).then(loadingEl => {
      loadingEl.present()
      this.placeService.uploadImage(this.form.get('image').value)
        .pipe(switchMap(uploadResponse => {
          return this.placeService.addPlace(
            this.form.value.title,
            this.form.value.description,
            +this.form.value.price,
            new Date(this.form.value.dateFrom),
            new Date(this.form.value.dateTo),
            uploadResponse.imageUrl
          )
        }))
        .subscribe(() => {
          loadingEl.dismiss()
          this.form.reset()
          this.router.navigate(['/places/offers'])
        })
    })


  }

  onImagePicked(imageData: string | File) {
    let imageFile
    if (typeof imageData === 'string') {
      try {
        imageFile = base64toBlob(imageData.replace('data:image/jpeg;base64', ''), 'image/jpeg')
      } catch (error) {
        console.log(error);
        return
      }
    } else {
      imageFile = imageData
    }

    this.form.patchValue({ image: imageFile })
  }

}
