import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from '@core/services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  registerForm: FormGroup;
  isLoginMode = true;
  loading = false;
  
  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.loginForm = this.fb.group({
      username: ['', [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
    
    this.registerForm = this.fb.group({
      username: ['', [Validators.required, Validators.pattern(/^[a-zA-Z0-9_]+$/)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
    }, { validator: this.passwordMatchValidator });
  }

  ngOnInit() {
    // If already logged in, redirect to dashboard
    if (this.authService.isLoggedIn) {
      this.router.navigate(['/dashboard']);
    }
  }

  passwordMatchValidator(group: FormGroup) {
    const password = group.get('password')?.value;
    const confirmPassword = group.get('confirmPassword')?.value;
    
    return password === confirmPassword ? null : { passwordMismatch: true };
  }

  toggleMode() {
    this.isLoginMode = !this.isLoginMode;
  }

  login() {
    if (this.loginForm.invalid) return;
    
    this.loading = true;
    const { username, password } = this.loginForm.value;
    
    this.authService.login(username, password).subscribe({
      next: () => {
        this.router.navigate(['/dashboard']);
      },
      error: (error) => {
        console.error('Login error', error);
        this.snackBar.open('Failed to login. Please check your credentials.', 'Close', { duration: 5000 });
        this.loading = false;
      }
    });
  }

  register() {
    if (this.registerForm.invalid) return;
    
    this.loading = true;
    const { username, email, password } = this.registerForm.value;
    
    this.authService.register({ username, email, password }).subscribe({
      next: () => {
        this.router.navigate(['/dashboard']);
        this.snackBar.open('Registration successful! Welcome to NocoStudio.', 'Close', { duration: 5000 });
      },
      error: (error) => {
        console.error('Registration error', error);
        this.snackBar.open('Failed to register. Please try again.', 'Close', { duration: 5000 });
        this.loading = false;
      }
    });
  }
}
