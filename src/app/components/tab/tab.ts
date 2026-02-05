import { Component, input, signal, TemplateRef, viewChild } from '@angular/core';

@Component({
  selector: 'app-tab',
  standalone: true,
  imports: [],
  templateUrl: './tab.html',
  styleUrl: './tab.css',
})
export class Tab {

  title = input.required<string>();
  content = viewChild<TemplateRef<any>>(TemplateRef);
  active = signal(false);

}
