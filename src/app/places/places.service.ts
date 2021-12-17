import { Injectable } from '@angular/core';
import { BehaviorSubject, of } from 'rxjs';
import { AuthService } from '../auth/auth.service';
import { Place } from './place.model';
import { take, map, tap, delay, switchMap } from 'rxjs/operators'
import { HttpClient } from '@angular/common/http';

interface PlaceData {
  title: string,
  description: string,
  imageUrl: string,
  price: number,
  availableFrom: Date,
  availableTo: Date,
  userId: string
}

@Injectable({
  providedIn: 'root'
})
export class PlacesService {

  places = new BehaviorSubject<Place[]>([]);

  constructor(private authService: AuthService,
    private http: HttpClient) { }

  getPlaces() {
    return this.places.asObservable();
  }

  uploadImage(image: File) {
    const uploadData = new FormData()
    uploadData.append('image', image)
    return this.authService.token.pipe(
      take(1), switchMap(token => {
        return this.http.post<{ imageUrl: string, imagePath: string }>('Firbase_Function_URL', uploadData,
          {
            headers: {
              Authorization: 'Bearer ' + token
            }
          })
      })
    )
  }

  fetchPlaces() {
    return this.authService.token.pipe(
      take(1), switchMap(token => {
        return this.http.get<{ [key: string]: PlaceData }>
          (`https://ionic-angular-project-38d2a-default-rtdb.firebaseio.com/offered-places.json?auth=${token}`)

      }), map(resData => {
        const places = []
        for (const key in resData) {
          if (resData.hasOwnProperty(key)) {
            places.push(new Place(
              key,
              resData[key].title,
              resData[key].description,
              resData[key].imageUrl,
              resData[key].price,
              new Date(resData[key].availableFrom),
              new Date(resData[key].availableTo),
              resData[key].userId
            ))
          }
        }
        return places
      }),
      tap(places => {
        this.places.next(places)
      })
    )
  }

  getPlaceById(placeId: string) {
    return this.authService.token.pipe(
      take(1), switchMap(token => {
        return this.http.get<PlaceData>(
          `https://ionic-angular-project-38d2a-default-rtdb.firebaseio.com/offered-places/${placeId}.json?auth=${token}`,
        )
      }), map(response => {
        return new Place(
          placeId,
          response.title,
          response.description,
          response.imageUrl,
          response.price,
          new Date(response.availableFrom),
          new Date(response.availableTo),
          response.userId
        )
      }))
  }

  addPlace(title: string,
    description: string,
    price: number,
    fromDate: Date,
    toDate: Date,
    imageUrl: string) {
    let genId: string
    let newPlace: Place
    let fetchedUserId: string
    return this.authService.userId.pipe(take(1),
      switchMap(userId => {
        fetchedUserId = userId
        return this.authService.token
      }),
      switchMap(
        token => {
          if (!fetchedUserId) {
            throw new Error('No User Id Found')
          }
          newPlace = new Place(Math.random().toString(),
            title, description, imageUrl,
            price, fromDate, toDate,
            fetchedUserId)
          return this.http.post<{ name: string }>(
            `https://ionic-angular-project-38d2a-default-rtdb.firebaseio.com/offered-places.json?auth=${token}`,
            {
              ...newPlace, id: null
            })
        }
      ), switchMap(resData => {
        genId = resData.name
        return this.places;
      }),
      take(1),
      tap(places => {
        newPlace.id = genId
        this.places.next(places.concat(newPlace))
      })
    )

    // return this.places.pipe(take(1), delay(1500), tap(places => {
    //   this.places.next(places.concat(newPlace));
    // }))
  }

  updatePlace(placeId: string,
    title: string,
    description: string) {

    let updatedPlaces: Place[];
    let fetchedToken: string
    return this.authService.token.pipe(
      take(1),
      switchMap(token => {
        fetchedToken = token
        return this.places
      }),
      take(1),
      switchMap(places => {
        if (!places || places.length == 0) {
          return this.fetchPlaces()
        } else {
          return of(places)
        }
      }),
      switchMap(places => {
        const updatePlaceIndex = places.findIndex(place => place.id === placeId)
        updatedPlaces = [...places]
        const oldPlace = updatedPlaces[updatePlaceIndex]
        updatedPlaces[updatePlaceIndex] = new Place(
          oldPlace.id,
          title,
          description,
          oldPlace.imageUrl,
          oldPlace.price,
          oldPlace.availableFrom,
          oldPlace.availableTo,
          oldPlace.userId
        )

        return this.http.put(
          `https://ionic-angular-project-38d2a-default-rtdb.firebaseio.com/offered-places/${placeId}.json?auth=${fetchedToken}`,
          {
            ...updatedPlaces[updatePlaceIndex], id: null
          }
        )
      })
      ,
      tap(() => {
        this.places.next(updatedPlaces)
      })
    )
  }

}

// new Place("1", "Tehran", "Iran's capital city", "https://wallpaperaccess.com/full/1291459.jpg", 2000, new Date('2019-01-01'), new Date('2019-12-32'), 1),
//       new Place("2", "New York", "One of the greatest cities in the world",
//         "https://wallpapercave.com/wp/wp3594884.jpg", 200000, new Date('2019-01-01'), new Date('2019-12-32'), 2),
//       new Place("3", "Tokyo", "Japan's capital city",
//         "https://ak.picdn.net/shutterstock/videos/7043482/thumb/1.jpg", 20000, new Date('2019-01-01'), new Date('2019-12-32'), 1)
