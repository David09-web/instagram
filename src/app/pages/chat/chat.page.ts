import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import {
  IonContent, IonHeader, IonToolbar, IonTitle, IonButtons, IonBackButton,
  IonFooter, IonItem, IonInput, IonButton, IonIcon, IonAvatar, IonLabel,
  IonSpinner
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { sendOutline, personCircleOutline } from 'ionicons/icons';
import { Api } from '../../services/api';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.page.html',
  styleUrls: ['./chat.page.scss'],
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    IonContent, IonHeader, IonToolbar, IonTitle, IonButtons, IonBackButton,
    IonFooter, IonItem, IonInput, IonButton, IonIcon, IonAvatar, IonLabel,
    IonSpinner
  ]
})
export class ChatPage implements OnInit, OnDestroy {

  @ViewChild(IonContent) content!: IonContent;

  userId!: number;
  partner: any = null;
  messages: any[] = [];
  newMessage = '';
  loading = true;
  sending = false;
  currentUserId: number | null = null;
  private pollInterval: any;

  base = 'http://192.168.56.1:8000/storage/';

  constructor(private route: ActivatedRoute, private api: Api) {
    addIcons({ sendOutline, personCircleOutline });
  }

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    this.userId = parseInt(id || '0');

    // Cargar perfil del partner
    this.api.getUserProfile(this.userId).subscribe(res => {
      this.partner = res;
    });

    // Resolver el id del usuario actual desde el token
    this.loadMessages();

    // Polling cada 3 segundos para simular tiempo real
    this.pollInterval = setInterval(() => this.loadMessages(false), 3000);
  }

  ngOnDestroy() {
    clearInterval(this.pollInterval);
  }

  loadMessages(showLoading = true) {
    if (showLoading) this.loading = true;
    this.api.getMessages(this.userId).subscribe({
      next: (res) => {
        this.messages = res;
        this.loading = false;
        setTimeout(() => this.content?.scrollToBottom(300), 100);
      },
      error: () => { this.loading = false; }
    });
  }

  send() {
    const body = this.newMessage.trim();
    if (!body || this.sending) return;
    this.sending = true;
    this.api.sendMessage(this.userId, body).subscribe({
      next: (msg) => {
        this.messages.push(msg);
        this.newMessage = '';
        this.sending = false;
        setTimeout(() => this.content?.scrollToBottom(300), 100);
      },
      error: () => { this.sending = false; }
    });
  }

  isMine(msg: any): boolean {
    // El mensaje es mío si el sender NO es el partner
    return msg.sender_id !== this.userId;
  }

  avatarUrl(user: any): string {
    return user?.profile?.avatar || `https://i.pravatar.cc/150?u=${user?.id}`;
  }

  onEnter(ev: any) {
    if (ev.key === 'Enter') this.send();
  }
}
