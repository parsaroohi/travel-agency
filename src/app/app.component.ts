import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Plugins, Capacitor } from '@capacitor/core'
import { Subscription } from 'rxjs';
import { AuthService } from './auth/auth.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent implements OnInit, OnDestroy {

  private authSub: Subscription
  private previousAuthState = false

  constructor(private authServie: AuthService,
    private router: Router) {
    if (Capacitor.isPluginAvailable('SplashScreen')) {
      Plugins.SplashScreen.hide()
    }
  }

  ngOnInit() {
    this.authSub = this.authServie.userIsAuthenticated.subscribe(isAuth => {
      if (!isAuth && this.previousAuthState !== isAuth) {
        this.router.navigateByUrl('/auth')
      }
      this.previousAuthState = isAuth
    })
  }

  ngOnDestroy() {
    if (this.authSub) {
      this.authSub.unsubscribe()
    }
  }

  onLogout() {
    this.authServie.logout()
  }
}
