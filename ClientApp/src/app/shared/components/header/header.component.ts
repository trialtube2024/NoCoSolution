import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { AuthService } from '@core/services/auth.service';
import { User } from '@core/models/schema.model';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {
  @Output() toggleSideNav = new EventEmitter<void>();
  currentUser: User | null = null;
  appTitle = 'NocoStudio';

  constructor(private authService: AuthService) {}

  ngOnInit() {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
    });
  }

  onToggleSideNav(): void {
    this.toggleSideNav.emit();
  }

  logout(): void {
    this.authService.logout();
  }
}
