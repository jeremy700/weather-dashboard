import { Component } from '@angular/core';
import { Tab } from '../tab/tab';
import { Tabs } from '../tabs/tabs';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [Tabs, Tab],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard {

}
