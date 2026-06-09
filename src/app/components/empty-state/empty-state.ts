import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-empty-state',
  standalone: true,
  imports: [],
  templateUrl: './empty-state.html',
  styleUrl: './empty-state.css'
})
export class AppEmptyStateComponent {
  @Input() icon = '📋';
  @Input() title = '';
  @Input() description = '';
  @Input() actionLabel = '';
  @Output() action = new EventEmitter<void>();
}
