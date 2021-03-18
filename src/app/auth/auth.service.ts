import { HttpClient, HttpErrorResponse } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Router } from "@angular/router";
import { BehaviorSubject, Subject, throwError } from "rxjs";
import { catchError, tap } from "rxjs/operators";
import { User } from "./user.model";

export interface AuthResponseData{
    idToken	:string;
    email:	string;
    refreshToken:	string;
    expiresIn:	string;
    localId:	string;
    registered?: string
}

@Injectable({providedIn:'root'})
export class AuthService{

    user = new BehaviorSubject<User>(null);
    private tokenExpirationTimer: any;

    constructor(private http: HttpClient, private router: Router){}

    logout(){
        this.user.next(null);
        location.reload;
        this.router.navigate(['/auth']);
        localStorage.removeItem('userData');
        if(this.tokenExpirationTimer){
            clearTimeout(this.tokenExpirationTimer);
        }
    }

    autoLogout(expirationDuration: number){
        this.tokenExpirationTimer= setTimeout(()=>{
            this.logout()
        },expirationDuration);
        this.tokenExpirationTimer=null;
    }

    autoLogin(){
        const userData:{
            email:string,
            id:string,
            _token:string,
            _tokenExpirationDate:string
        } = JSON.parse(localStorage.getItem('userData'));
        if(!userData){
            return;
        }
        
        const loadedUser = new User(userData.email,userData.id,userData._token,new Date(userData._tokenExpirationDate));
        if (loadedUser.token){
            this.user.next(loadedUser);
            const expirationDuration = new Date(userData._tokenExpirationDate).getTime() - new Date().getTime();
            this.autoLogout(expirationDuration);
            console.log(expirationDuration);
        }

    }

    signup(email: string , password: string){
        return this.http.post<AuthResponseData>
        ('https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=AIzaSyA-UHgIedgItvnbQ_C3AtAGRS_jA52gbtk',
        {
            email: email,
            password: password,
            returnSecureToken: true
        } )
        .pipe(
            catchError(this.handleError),tap(resData => {
                this.handleAuthentication(
                    resData.email,
                    resData.localId,
                    resData.idToken,
                    +resData.expiresIn)
            })
            
        );
    }

    login(email: string , password: string){
        return this.http.post<AuthResponseData>('https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=AIzaSyA-UHgIedgItvnbQ_C3AtAGRS_jA52gbtk',
        {
            email: email,
            password: password,
            returnSecureToken: true
        })
        .pipe(
            catchError(this.handleError),tap(resData => {
                this.handleAuthentication(
                    resData.email,
                    resData.localId,
                    resData.idToken,
                    +resData.expiresIn)
            })
        );
    }

    private handleAuthentication(email:string, localId:string, idToken:string, expiresIn:number ){
        const expirationDate = new Date(new Date().getTime() + expiresIn *1000);
                const user = new User(                
                email,
                localId,
                idToken,
                expirationDate);

                this.user.next(user);
                this.autoLogout(expiresIn*1000);
                localStorage.setItem('userData', JSON.stringify(user));
    }

    private handleError(errorRes: HttpErrorResponse) {
        let errorMessage='An Unknown Error Occured';
                if(!errorRes.error || !errorRes.error.error)
                {
                    return throwError(errorMessage);
                }else{
                    switch (errorRes.error.error.message) {
                        case 'EMAIL_EXISTS':
                            errorMessage='Email id already Exists';
                            break;
                        case 'EMAIL_NOT_FOUND':
                            errorMessage='Invalid Email ID'
                            break;
                        case 'INVALID_PASSWORD':
                            errorMessage='Invalid password'
                    }
                    return throwError(errorMessage);
                }
    }

}