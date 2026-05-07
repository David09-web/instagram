import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonButtons, IonBackButton, IonAvatar, IonGrid, IonRow, IonCol, IonLabel, IonItem } from '@ionic/angular/standalone';
import { ActivatedRoute } from '@angular/router';
import { Api } from '../../services/api';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, IonButtons, IonBackButton, IonAvatar, IonGrid, IonRow, IonCol, IonLabel, IonItem, CommonModule, FormsModule]
})
export class ProfilePage implements OnInit {

  user: any = null;
  base = 'http://192.168.56.1:8000/storage/';

  constructor(private route: ActivatedRoute, private api: Api) { }

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.api.getUserProfile(parseInt(id)).subscribe(res => {
        this.user = res;
      });
    }
  }

  imgUrl(path: string) { 
    if (path?.startsWith('http')) return path;
    return this.base + path; 
  }

}
