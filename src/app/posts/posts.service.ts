import { Injectable } from "@angular/core";
import {  Subject, throwError } from "rxjs";
import { HttpClient, HttpErrorResponse } from "@angular/common/http";
import { Router } from "@angular/router";
import { catchError, map } from 'rxjs/operators';
import { environment } from "src/environments/environment";
import { Post } from "./post.model";


@Injectable({providedIn: "root"})
export class PostsService{
    private posts: Post[] = [];
    private postsUpdated = new Subject<{posts: Post[], postCount: number}>();
    private BACKEND_URL = environment.apiUrl + "/posts";

    constructor(
        private http: HttpClient,
        private router: Router
    ){}

    getPosts(postsPerPage: number, currentPage: number){
        const queryParams = `?pageSize=${postsPerPage}&page=${currentPage}`;
        this.http.get<{posts: any, maxPosts: number}>(`${this.BACKEND_URL}${queryParams}`)
        .pipe(
            catchError(this.handleError)
        )
        .pipe(map(
            (postData) => {
              return {
                posts: postData.posts.map(
                  (post: { title: any; content: any; _id: any; imagePath: any; creator: any; }) => {
                    return {
                      title: post.title,
                      content: post.content,
                      _id: post._id,
                      imagePath: post.imagePath,
                      creator: post.creator,
                    };
                  }
                ),
                maxPosts: postData.maxPosts,
              };
            }
          ))
        .subscribe((transformedPostData) => {
            this.posts = transformedPostData.posts;
            this.postsUpdated.next({ posts: [...this.posts], postCount: transformedPostData.maxPosts});
        });
    }

    getPostsUpdateListener(){
        return this.postsUpdated.asObservable();
    }

    getPost(postId: string | null){
        return this.http.get<{
            _id: string,
            title: string,
            content: string,
            imagePath: string,
            creator: string
          }>(`${this.BACKEND_URL}/${postId}`);
    }

    addPost(title: string, content: string, image: File){
        const postData = new FormData();
        postData.append("title", title);
        postData.append("content", content);
        postData.append("image", image, title);
        this.http.post<Post>(`${this.BACKEND_URL}`, postData)
        .pipe(
            catchError(this.handleError)
        )
        .subscribe(
            (responseData) => {
                this.router.navigate(["/"]);
            }
        );
    }

    updatePost(id: string, title: string, content: string, image: File | string){
        let postData: Post | FormData;
        if(typeof(image) === "object"){//formdata 
            postData = new FormData();
            postData.append("_id", id);
            postData.append("title", title);
            postData.append("content", content);
            postData.append("image", image, title);
        }else{//normal json data
            postData = {_id: id, title: title, content: content, imagePath: image, creator: ""};
        }
        this.http.put<Post>(`${this.BACKEND_URL}/${id}`, postData)
        .subscribe(response => {
            this.router.navigate(["/"]);
        });   
    }

    deletePost(postId: string){
        return this.http.delete(`${this.BACKEND_URL}/${postId}`);
    }

    private handleError(error: HttpErrorResponse) {
        if (error.error instanceof ErrorEvent) {
          // A client-side or network error occurred. Handle it accordingly.
          console.error('An error occurred:', error.error.message);
        } else {
          // The backend returned an unsuccessful response code.
          // The response body may contain clues as to what went wrong,
          console.error(
            `Backend returned code ${error.status}, ` +
            `body was: ${error.error}`);
        }
        // return an observable with a user-facing error message
        return throwError(() => new Error('Something bad happened; please try again later.'));
    }
}