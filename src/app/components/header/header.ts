import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../auth/auth-service';

@Component({
  selector: 'app-header',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './header.html',
  styleUrl: './header.css'
})
export class Header {
  protected readonly auth = inject(AuthService);

  get initiales(): string {
    const nombre = this.auth.getNombre();
    if (!nombre) return '';
    return nombre
      .split(' ')
      .filter((n: string) => n.length > 0)
      .slice(0, 2)
      .map((n: string) => n[0].toUpperCase())
      .join('');
  }
}
