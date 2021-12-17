import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { BehaviorSubject } from "rxjs";
import { delay, map, switchMap, take, tap } from "rxjs/operators";
import { AuthService } from "../auth/auth.service";
import { Booking } from "./booking.model";

interface BookingData {
  bookingFrom: string
  bookingTo: string
  firstName: string
  guestName: number
  lastName: string
  placeId: string
  placeImage: string
  placeTitle: string
  userId: string
}

@Injectable({
  providedIn: "root"
})


export class BookingService {
  private _booking = new BehaviorSubject<Booking[]>([])

  constructor(private authService: AuthService,
    private http: HttpClient) { }

  get bookings() {
    return this._booking.asObservable()
  }

  addBooking(
    placeId: string,
    placeTitle: string,
    placeImg: string,
    firstName: string,
    lastName: string,
    guestNumber: number,
    dateFrom: Date,
    dateTo: Date
  ) {
    let generatedId: string
    let newBooking: Booking
    let fetchedUserId: string
    return this.authService.userId.pipe(take(1), switchMap(userId => {
      if (!userId) {
        throw new Error('No User Id Found')
      }
      fetchedUserId = userId
      return this.authService.token
    }),
      take(1),
      switchMap(token => {
        newBooking = new Booking(Math.random().toString(),
          Math.random().toString(), fetchedUserId, placeTitle, placeImg,
          guestNumber, firstName, lastName, dateFrom, dateTo)
        return this.http.post<{ name: string }>(
          `https://ionic-angular-project-38d2a-default-rtdb.firebaseio.com/bookings.json?auth=${token}`,
          { ...newBooking, id: null })
      }),
      switchMap(response => {
        generatedId = response.name
        return this.bookings
      }), take(1), tap(bookings => {
        newBooking.id = generatedId
        this._booking.next(bookings.concat(newBooking))
      })
    )
  }

  cancelBooking(offerId: string) {
    return this.authService.token.pipe(
      take(1),
      switchMap(token => {
        return this.http.delete(
          `https://ionic-angular-project-38d2a-default-rtdb.firebaseio.com/bookings/${offerId}.json?auth=${token}`)
      }), switchMap(() => {
        return this.bookings
      }), take(1), tap(bookings => {
        this._booking.next(bookings.filter(b => b.id !== offerId))
      }))
  }

  fetchBookings() {
    let fetchedUserId: string
    return this.authService.userId.pipe(
      take(1), switchMap(userId => {
        if (!userId) {
          throw new Error('User Not Found')
        }
        fetchedUserId = userId
        return this.authService.token
      })
    ).pipe(
      take(1),
      switchMap(token => {
        return this.http.get<{ [key: string]: BookingData }>(
          `https://ionic-angular-project-38d2a-default-rtdb.firebaseio.com/bookings.json?orderBy="userId"&equalTo="${fetchedUserId}"&auth=${token}`
        )
      }),
      map(bookingData => {
        {
          const bookings = []
          for (const key in bookingData) {
            if (bookingData.hasOwnProperty(key)) {
              bookings.push(new Booking(key,
                bookingData[key].placeId,
                bookingData[key].userId,
                bookingData[key].placeTitle,
                bookingData[key].placeImage,
                bookingData[key].guestName,
                bookingData[key].firstName,
                bookingData[key].lastName,
                new Date(bookingData[key].bookingFrom),
                new Date(bookingData[key].bookingTo)
              ))
            }
          }
          return bookings
        }
      }), tap(bookings => {
        this._booking.next(bookings)
      })
    )
  }

}
