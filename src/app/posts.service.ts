import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { map, catchError, tap } from 'rxjs/operators';
import { Subject, throwError } from 'rxjs';

import { Post } from './post.model';


@Injectable({providedIn: 'root'})
export class PostsService {
    error = new Subject<string>();

    constructor(private http: HttpClient) {}

    createAndStorePost(title: string, content: string) {
        const postData: Post = {title: title, content: content}
        this.http
        .post<{name: string}>(
            'https://academind-http-requests-default-rtdb.firebaseio.com/posts.json',
            postData,
            {
                observe: 'response'
            }
        )
        .subscribe(responseData => {
            console.log(responseData);
        }, error => {
            this.error.next(error.message);
        });
    }

    fetchPosts() {
        return this.http
        .get<{[key: string]: Post}>(
            'https://academind-http-requests-default-rtdb.firebaseio.com/posts.json',
            {
                headers: new HttpHeaders({ 'Custom-Header': 'Hello' }),
                params: new HttpParams().set('print', 'pretty')
            }
            )
        .pipe(
            map(responseData => {
                const postsArray: Post[] = [];
                for (const key in responseData) {
                    if (responseData.hasOwnProperty(key)) {
                        postsArray.push({...responseData[key], id: key})
                    }
                }
                return postsArray;
            }),
            catchError(errorRes => {
                // send to analytics server, etc
                return throwError(errorRes);
            })
        );
    }

    deletePosts() {
        return this.http.delete('https://academind-http-requests-default-rtdb.firebaseio.com/posts.json',
        {
            observe: 'events'
        }
        ).pipe(tap(event => {
            console.log(event);
        }))
    }
}