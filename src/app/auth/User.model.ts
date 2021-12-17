
export class User {
  /**
   *
   */
  constructor(
    public id: string,
    public email: string,
    private _token: string,
    private tokenExpirationDate: Date
  ) {

  }

  get token() {
    if (!this.tokenExpirationDate || this.tokenExpirationDate <= new Date()) {
      return null
    }
    return this._token
  }

  get tokenDuration() {
    if (!this._token) {
      return 0
    }
    const time = this.tokenExpirationDate.getTime() - new Date().getTime()
    if (time > 0) {
      return time
    }
    return 0
  }
}
