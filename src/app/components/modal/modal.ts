import { Component, effect, ElementRef, input, output, ViewChild } from '@angular/core';

@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [],
  templateUrl: './modal.html',
  styleUrl: './modal.css',
})
export class Modal {
  open = input(false);
  title = input('');
  message = input('');
  type = input<'confirm' | 'success' | 'error'>('confirm');

  confirm = output<void>();
  cancel = output<void>();

  @ViewChild('dialog', { static: false }) dialog!: ElementRef<HTMLDivElement>;

  constructor() {
    effect(() => {
      if (this.open()) {
        queueMicrotask(() => this.dialog?.nativeElement.focus());
      }
    });
  }

  onConfirm() {
    this.confirm.emit();
  }

  onCancel() {
    this.cancel.emit();
  }
}
