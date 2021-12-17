import { Component, OnInit } from '@angular/core';
import { AlertController, ModalController } from '@ionic/angular';
import { Capacitor, Plugins } from '@capacitor/core';

@Component({
  selector: 'app-map-modal',
  templateUrl: './map-modal.component.html',
  styleUrls: ['./map-modal.component.scss'],
})
export class MapModalComponent implements OnInit {

  currentPosition: { lat: number, lng: number }

  constructor(private modalCtrl: ModalController,
    private alertCtrl: AlertController) { }

  async ngOnInit() {
    this.currentPosition = { lat: 34, lng: 52 }
    if (!Capacitor.isPluginAvailable('Geolocation')) {
      this.alertCtrl.create({
        header: "An Error Occured",
        message: "please make sure you have action to geolocation"
      })
    } else {
      const coordinates = await Plugins.Geolocation.getCurrentPosition()
      console.log('Current', coordinates);
    }
  }

  onCancel() {
    this.modalCtrl.dismiss()
  }

}
