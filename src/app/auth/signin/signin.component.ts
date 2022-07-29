import { Component, OnInit, OnDestroy } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Subscription } from 'rxjs';
import { AuthService } from '../auth.service';

@Component({
    selector: 'app-signin',
    templateUrl: './signin.component.html',
    styleUrls: ['./signin.component.css']
})

export class SigninComponent implements OnInit, OnDestroy {
    isLoading = false;
    private authStatusSubscription: Subscription;
    constructor(
        private authService: AuthService
    ){};

    ngOnInit() {
        this.authStatusSubscription = this.authService.getAuthStatusListener()
        .subscribe(
            () => {
                this.isLoading = false;
            }
        );
    }

    onSignin(form: NgForm){
        if(form.invalid) return;
        this.isLoading = true;
        this.authService.signinUser(form.value.email, form.value.password);     
    }

    ngOnDestroy(): void {
        this.authStatusSubscription.unsubscribe();
    }
}