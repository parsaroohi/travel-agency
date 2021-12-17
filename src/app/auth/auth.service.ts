import { HttpClient } from '@angular/common/http';
import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject, from } from 'rxjs';
import { map, take, tap } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { User } from './User.model';
import { Plugins } from '@capacitor/core';

export interface AuthResponseData {
  idToken: string
  email: string
  refreshToken: string
  expiresIn: string
  localId: string
}

@Injectable({
  providedIn: 'root'
})
export class AuthService implements OnDestroy {

  private _user = new BehaviorSubject<User>(null)
  private activeLogoutTimer: any

  get userId() {
    return this._user.asObservable().pipe(map(user => {
      if (user) {
        return user.id
      } else {
        return null
      }
    }))
  }

  get userIsAuthenticated() {
    return this._user.asObservable().pipe(map(user => {
      if (user) {
        return !!user.token
      } else {
        return false
      }
    }))
  }

  get token() {
    return this._user.asObservable().pipe(
      map(user => {
        if (user) {
          return user.token
        } else {
          return null
        }
      })
    )
  }

  constructor(private http: HttpClient) { }

  signUp(email: string, password: string) {
    return this.http.post<AuthResponseData>(
      `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${environment.googleApiKey}`,
      { email: email, password: password, returnSecureToken: true }
    ).pipe(tap(userData => {
      this.setUserData(userData)
    }))
  }

  login(email: string, password: string) {
    return this.http.post<AuthResponseData>(
      `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${environment.googleApiKey}`,
      { email, password, returnSecureToken: true }
    ).pipe(
      tap(this.setUserData.bind(this))
    )
  }

  logout() {
    if (this.activeLogoutTimer) {
      clearTimeout(this.activeLogoutTimer)
    }
    this._user.next(null)
    Plugins.Storage.remove({ key: 'authData' })
  }

  private setUserData(userData: AuthResponseData) {
    const expireTime = new Date(new Date().getTime() + (+userData.expiresIn * 1000))
    const user = new User(
      userData.localId,
      userData.email,
      userData.idToken,
      expireTime
    )
    this._user.next(user)
    this.autoLogout(user.tokenDuration)
    this.storeAuthData(
      userData.localId,
      userData.idToken,
      expireTime.toISOString(),
      userData.email
    )
  }

  private autoLogout(duration: number) {
    if (this.activeLogoutTimer) {
      clearTimeout(this.activeLogoutTimer)
    }
    this.activeLogoutTimer = setTimeout(() => {
      this.logout()
    }, duration);
  }

  autoLogin() {
    var data = Plugins.Storage.get('authData').value
    return from(Plugins.Storage.get('authData'))
      .pipe(take(1), map(authData => {
        if (!authData || !data) {
          return null;
        }
        const parsedData = JSON.parse(data) as {
          userId: string, token: string,
          tokenExpirationDate: string, email: string
        }
        const expirationDate = new Date(parsedData.tokenExpirationDate)
        if (expirationDate <= new Date()) {
          return null
        }
        const user = new User(
          parsedData.userId,
          parsedData.email,
          parsedData.token,
          expirationDate)
        return user
      }), tap(user => {
        this._user.next(user)
        this.autoLogout(user.tokenDuration)
      }), map(user => {
        return !!user
      }))
  }

  private storeAuthData(
    userId: string,
    token: string,
    tokenExpirationDate: string,
    email: string
  ) {
    var data = JSON.stringify({ userId, token, tokenExpirationDate, email })
    Plugins.Storage.set({ key: 'authData', value: data })
  }

  ngOnDestroy(): void {
    if (this.activeLogoutTimer) {
      clearTimeout(this.activeLogoutTimer)
    }
  }
}
