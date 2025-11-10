import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { Header } from './components/header/header';
import { toSignal } from '@angular/core/rxjs-interop';
import { filter, map, startWith } from 'rxjs';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Header],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
    protected readonly title = signal('UTNutri');
  private router = inject(Router);
  private ar = inject(ActivatedRoute);

  hideHeader = toSignal(
    this.router.events.pipe(
      filter((e): e is NavigationEnd => e instanceof NavigationEnd),
      map(() => {
        let r = this.ar;
        while (r.firstChild) r = r.firstChild;
        return r.snapshot.data['hideHeader'] === true;
      }),
      startWith(false),
    ),
    { initialValue: false }
  );
}
