import { Component, OnInit, Output, EventEmitter, ViewChild, ElementRef, Input } from '@angular/core';
import { Capacitor, Plugins } from '@capacitor/core'
import { CameraSource, CameraResultType } from '@capacitor/camera'
import { Platform } from '@ionic/angular';

@Component({
  selector: 'app-image-picker',
  templateUrl: './image-picker.component.html',
  styleUrls: ['./image-picker.component.scss'],
})
export class ImagePickerComponent implements OnInit {

  @Output() imagePick = new EventEmitter<string | File>()
  @ViewChild('filePicker', null) filePicker: ElementRef<HTMLInputElement>
  @Input() showPreview = false
  selectedImage: string
  userPicker = false

  constructor(private platform: Platform) { }

  ngOnInit() {
    if ((this.platform.is('mobile') && !this.platform.is('hybrid'))
      || (this.platform.is('desktop'))) {
      this.userPicker = true
    }
  }

  async onPickImage() {
    if (!Capacitor.isPluginAvailable('Camera')) {
      this.filePicker.nativeElement.click()
      return;
    }

    Plugins.Camera.getPhoto({
      quality: 50,
      source: CameraSource.Prompt,
      correctOrientataion: true,
      height: 320,
      width: 200,
      resultType: CameraResultType.Base64
    }).then(image => {
      this.selectedImage = image.base64String
      this.imagePick.emit(image.base64String)
    }).catch(err => {
      console.log(err);
      if (this.filePicker) {
        this.filePicker.nativeElement.click()
      }
      return false
    })
  }

  onFileChoosen(event) {
    const pickedFile = (event.target as HTMLInputElement).files[0]
    if (!pickedFile) {
      return
    }

    const fr = new FileReader()
    fr.onload = () => {
      const dataUrl = fr.result.toString()
      this.selectedImage = dataUrl
      this.imagePick.emit(pickedFile)
    }
    fr.readAsDataURL(pickedFile)
  }

}
