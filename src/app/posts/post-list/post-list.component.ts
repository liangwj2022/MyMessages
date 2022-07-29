import { Component, OnDestroy, OnInit} from "@angular/core";
import { PageEvent } from "@angular/material/paginator";
import { Subscription } from "rxjs";
import { AuthService } from "src/app/auth/auth.service";

import { Post } from "../post.model";
import { PostsService } from "../posts.service";

@Component({
    selector: "app-post-list",
    templateUrl: "./post-list.component.html",
    styleUrls: ['./post-list.component.css']
})

export class PostListComponent implements OnInit, OnDestroy{
    posts:Post[] = [];
    isLoading = false;
    userIsAuthenticated = false;
    totalPosts = 0;
    currentPage = 1;
    postsPerPage = 2;
    pageSizeOptions = [1,2,5,10];
    userId: string | null;
    private postsSubscription: Subscription;
    private authStatusSubscription: Subscription;

    constructor(
        public postsService: PostsService,
        private authService: AuthService
    ){}

    ngOnInit(): void {
        this.isLoading = true;
        this.postsService.getPosts(this.postsPerPage, this.currentPage);
        this.userId = this.authService.getUserId();
        this.postsSubscription = this.postsService.getPostsUpdateListener()
        .subscribe((postData: {posts: Post[], postCount: number}) => {
            this.isLoading = false;
            this.posts = postData.posts;
            this.totalPosts = postData.postCount;
        });
        this.userIsAuthenticated = this.authService.getIsAuth();
        this.authStatusSubscription = this.authService.getAuthStatusListener()
        .subscribe(isAuthenticated => {
            this.userIsAuthenticated = isAuthenticated;
            this.userId = this.authService.getUserId();
        });
    }

    onChangedPage(pageData: PageEvent){
        this.isLoading = true;
        this.currentPage = pageData.pageIndex + 1; //start from 0, but backend starts at page 1
        this.postsPerPage = pageData.pageSize;
        this.postsService.getPosts(this.postsPerPage, this.currentPage);
    }

    onDelete(postId: string){
        this.isLoading = true;
        this.postsService.deletePost(postId).subscribe(
            () => {
                this.postsService.getPosts(this.postsPerPage, this.currentPage);
            }
        );
    }

    ngOnDestroy(): void {
        this.postsSubscription.unsubscribe();
        this.authStatusSubscription.unsubscribe();
    }
}