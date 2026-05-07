import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonList, IonItem, IonLabel, IonButton, IonButtons, IonBackButton } from '@ionic/angular/standalone';
import { NgFor } from '@angular/common';
import { Api } from '../../services/api';

@Component({
  selector: 'app-friends',
  templateUrl: './friends.page.html',
  styleUrls: ['./friends.page.scss'],
  standalone: true,
  imports: [IonButtons, IonButton, IonHeader, IonToolbar, IonTitle, IonContent, IonList, IonItem, IonLabel, NgFor, IonBackButton]
})
export class FriendsPage implements OnInit {

  friends: any[] = [];
  pending: any[] = [];

  constructor(private api: Api) {}

  ngOnInit() {
    this.load();
  }

  load() {
    this.api.getFriends().subscribe(res => this.friends = res);
    this.api.getPendingFriendRequests().subscribe(res => this.pending = res);
  }

  accept(req: any) {
    this.api.acceptFriendship(req.id).subscribe(_ => this.load());
  }

}
