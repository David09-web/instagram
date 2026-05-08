import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import {
  IonContent, IonHeader, IonToolbar, IonTitle, IonButtons, IonBackButton,
  IonList, IonItem, IonAvatar, IonLabel, IonBadge, IonNote, IonSkeletonText,
  IonIcon
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { chatbubbleOutline } from 'ionicons/icons';
import { Api } from '../../services/api';

@Component({
  selector: 'app-conversations',
  templateUrl: './conversations.page.html',
  styleUrls: ['./conversations.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonContent, IonHeader, IonToolbar, IonTitle, IonButtons, IonBackButton,
    IonList, IonItem, IonAvatar, IonLabel, IonBadge, IonNote, IonSkeletonText,
    IonIcon
  ]
})
export class ConversationsPage implements OnInit {

  conversations: any[] = [];
  loading = true;

  constructor(private api: Api, private router: Router) {
    addIcons({ chatbubbleOutline });
  }

  ngOnInit() { this.load(); }

  load() {
    this.api.getConversations().subscribe({
      next: (res) => { this.conversations = res; this.loading = false; },
      error: () => { this.loading = false; }
    });
  }

  openChat(userId: number) {
    this.router.navigate(['/chat', userId]);
  }

  avatarUrl(user: any): string {
    return user?.profile?.avatar || `https://i.pravatar.cc/150?u=${user?.id}`;
  }

  formatTime(dateStr: string): string {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    const now = new Date();
    const diffH = (now.getTime() - d.getTime()) / 3600000;
    if (diffH < 24) return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    return d.toLocaleDateString();
  }
}
