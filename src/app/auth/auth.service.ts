import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Router } from "@angular/router";
import { Subject } from "rxjs";
import { environment } from "src/environments/environment";
import { AuthData } from "./auth-data.model";

@Injectable({providedIn: "root"})
export class AuthService {
    private isAuthenticated = false;
    private BACKEND_URL =  environment.apiUrl + "/users";
    private token: string | null;
    private tokenTimer: any;
    private userId: string | null;
    //push authentication status to components
    private authStatusListener = new Subject<boolean>();


    constructor(
        private http: HttpClient,
        private router: Router
    ){}
    
    getToken(){
        return this.token;
    }

    getIsAuth(){
        return this.isAuthenticated;
    }

    getUserId(){
        return this.userId;
    }

    getAuthStatusListener(){
        return this.authStatusListener.asObservable();
    }

    createUser(email:string, password:string, username: string){
        const authData: AuthData = {email, password, username};
        this.http.post(`${this.BACKEND_URL}/signup`, authData)
        .subscribe({
            complete: () => {this.router.navigate(['/'])},
            error: () => {this.authStatusListener.next(false)}
        });
    }

    signinUser(email:string, password:string){
        const authData: AuthData = {email, password, username:""};
        this.http.post<{token: string, expiresIn: number, userId: string}>(`${this.BACKEND_URL}/signin`, authData)
        .subscribe(response => {
            const token = response.token;   
            this.token = token;
            if(token){
                const expiresInDuration = response.expiresIn;
                this.setAuthTimer(expiresInDuration);
                this.isAuthenticated = true;
                this.userId = response.userId;
                this.authStatusListener.next(true);
                const now = new Date();
                const expirationDate = new Date(now.getTime() + expiresInDuration * 1000);               
                this.saveAuthData(token, expirationDate, response.userId);
                this.router.navigate(["/"]);
            }
        }, error => {
            this.authStatusListener.next(false);
        });
    }

    autoAuthUser(){
        const authInformation = this.getAuthData();
        const now = new Date();
        if (!authInformation) {
            return;
        } else {
            const expiresIn = authInformation.expirationDate.getTime() - now.getTime();
            if(expiresIn > 0){
                this.token = authInformation.token;
                this.isAuthenticated = true;
                this.userId = authInformation.userId;
                //expiresIn is in milliseconds
                this.setAuthTimer(expiresIn / 1000);
                this.authStatusListener.next(true);
            }
        }
    }

    logoutUser(){
        this.token = null;
        this.isAuthenticated = false;
        this.authStatusListener.next(false);
        this.userId = null;
        clearTimeout(this.tokenTimer);
        this.clearAuthData();
        this.router.navigate(["/"]);
    }

    private saveAuthData(token: string, expirationDate: Date, userId: string){
        localStorage.setItem("token", token);
        localStorage.setItem("expiration", expirationDate.toISOString());
        localStorage.setItem("userId", userId);
    }

    private clearAuthData(){
        localStorage.removeItem("token");
        localStorage.removeItem("expiration");
        localStorage.removeItem("userId");
    }

    private getAuthData(){
        const token = localStorage.getItem("token");
        const expirationDate = localStorage.getItem("expiration");
        const userId = localStorage.getItem("userId");
        if(!token || !expirationDate){
            return;
        }
        return {
            token: token,
            expirationDate: new Date(expirationDate),
            userId: userId
        }
    }

    private setAuthTimer(expiresInDuration: number){
        //setTimeout takes millisecond, so * 1000
        console.log("Setting Timer:" + expiresInDuration);
        
        this.tokenTimer = setTimeout(() => {
            this.logoutUser();
        }, expiresInDuration * 1000);
    }
}