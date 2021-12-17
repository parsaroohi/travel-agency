import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { AlertController, LoadingController } from '@ionic/angular';
import { Observable } from 'rxjs';
import { AuthResponseData, AuthService } from './auth.service';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.page.html',
  styleUrls: ['./auth.page.scss'],
})
export class AuthPage implements OnInit {

  isLoading = false;
  isLogin = false;
  signUpOrLogin = "SignUp";

  constructor(private authService: AuthService,
    private router: Router,
    private loadingCtrl: LoadingController,
    private alertCtrl: AlertController) { }

  ngOnInit() {
  }

  onLogin(email: string, password: string) {
    this.isLoading = true
    this.loadingCtrl.create({
      keyboardClose: true,
      message: 'Loading...'
    }).then(loadingEl => {
      loadingEl.present()
      let authObs: Observable<AuthResponseData>
      if (this.isLogin) {
        authObs = this.authService.login(email, password)
      } else {
        authObs = this.authService.signUp(email, password)
      }
      authObs.subscribe(result => {
        console.log(result);
        this.isLoading = false
        loadingEl.dismiss()
        this.router.navigateByUrl('/places/discover')
      },
        err => {
          console.log(err);
          loadingEl.dismiss()
          const code = err.error.error.message
          let message = 'Could Not Sign You Up'
          if (code === 'EMAIL_EXISTS') {
            message = 'The Email Address Already Exists'
          } else if (code === 'EMAIL_NOT_FOUND') {
            message = 'Email Address Could Not Be Found'
          } else if (code === 'INVALID_PASSWORD') {
            message = 'Password Is Incorrect'
          }
          this.showAlert(message)
        })
    })
  }

  onSubmit(form: NgForm) {
    // console.log(form);
    if (!form.valid) {
      return;
    }
    const email = form.value.email;
    const password = form.value.password;
    this.onLogin(email, password)
    form.reset()
  }

  onSwitchAuthMode() {
    this.isLogin = !this.isLogin;
    if (this.signUpOrLogin === "Login") {
      this.signUpOrLogin = "SignUp"
    } else {
      this.signUpOrLogin = "Login"
    }
  }

  private showAlert(message: string) {
    this.alertCtrl.create({
      header: 'Authentication Failed',
      message: message,
      buttons: [
        'Ok'
      ]
    }).then(alertEl => {
      alertEl.present()
    })
  }

}
