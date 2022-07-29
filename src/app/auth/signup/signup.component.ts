import { Component, OnInit, OnDestroy } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Subscription } from 'rxjs';
import { AuthService } from '../auth.service';

@Component({
    selector: 'app-signup',
    templateUrl: './signup.component.html',
    styleUrls: ['./signup.component.css']
})

export class SignupComponent implements OnInit, OnDestroy {
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

    onSignup(form: NgForm){
        if(form.invalid) return;
        this.isLoading = true;
        this.authService.createUser(form.value.email, form.value.password, form.value.username);
    }

    ngOnDestroy(): void {
        this.authStatusSubscription.unsubscribe();
    }
}