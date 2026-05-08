import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonHeader, IonToolbar, IonTitle, IonContent,
  IonList, IonItem, IonAvatar, IonLabel, IonButton, IonButtons, IonInput, IonIcon,
  ModalController
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { cameraOutline, exitOutline, personAdd, add, search, chatbubbleOutline, homeOutline, personOutline, addCircleOutline, peopleOutline } from 'ionicons/icons';
import { Router } from '@angular/router';
import { Api } from '../../services/api';
import { Auth } from '../../services/auth';
import { StoryViewerPage } from '../story-viewer/story-viewer.page';

@Component({
  selector: 'app-feed',
  templateUrl: './feed.page.html',
  styleUrls: ['./feed.page.scss'],
  standalone: true,
  imports: [
    IonInput, IonHeader, IonToolbar, IonTitle, IonContent,
    IonList, IonItem, IonAvatar, IonLabel, IonButton, IonButtons,
    FormsModule, CommonModule, IonIcon
  ]
})
export class FeedPage implements OnInit {

  posts: any[] = [];
  stories: any[] = [];
  friends: any[] = [];
  base = 'http://192.168.56.1:8000/storage/';

  selectedPost: any = null;
  newComment = '';
  comments: any[] = [];
  showComments = false;
  friendId: number | null = null;
  searchTerm = '';
  searchResults: any[] = [];

  constructor(
    private api: Api,
    private router: Router,
    private auth: Auth,
    private modalCtrl: ModalController,
  ) {
    addIcons({ cameraOutline, personAdd, exitOutline, add, search, chatbubbleOutline, homeOutline, personOutline, addCircleOutline, peopleOutline });
  }

  ngOnInit() {
    this.load();
    this.loadStories();
    this.loadFriends();
  }

  load() {
    this.api.getFeed().subscribe(res => this.posts = res.data ?? res);
  }

  loadStories() {
    this.api.getStories().subscribe(res => this.stories = res);
  }

  loadFriends() {
    this.api.getFriends().subscribe(res => this.friends = res);
  }

  goProfile(userId: number) {
    this.router.navigate(['/profile', userId]);
  }

  like(p: any) {
    this.api.likePost(p.id).subscribe(() => this.load());
  }

  goNewPost()     { this.router.navigateByUrl('/new-post'); }
  goFriends()     { this.router.navigateByUrl('/friends'); }
  goConversations(){ this.router.navigateByUrl('/conversations'); }

  imgUrl(path: string) {
    if (path?.startsWith('http')) return path;
    return this.base + path;
  }

  openComments(p: any) {
    this.selectedPost = p;
    this.showComments = true;
    this.api.getComments(p.id).subscribe(res => this.comments = res);
  }

  sendComment() {
    if (!this.selectedPost || !this.newComment.trim()) return;
    this.api.commentPost(this.selectedPost.id, this.newComment).subscribe(res => {
      this.comments.unshift(res);
      this.newComment = '';
    });
  }

  addFriend(userId?: number) {
    const id = userId || this.friendId;
    if (!id) return;
    this.api.sendFriendRequest(id).subscribe(_ => {
      this.friendId = null;
      this.searchTerm = '';
      this.searchResults = [];
    });
  }

  onSearch() {
    if (this.searchTerm.length < 2) {
      this.searchResults = [];
      return;
    }
    this.api.searchUsers(this.searchTerm).subscribe(res => {
      this.searchResults = res;
    });
  }

  closeComments() {
    this.showComments = false;
    this.selectedPost = null;
    this.comments = [];
    this.newComment = '';
  }

  logout() {
    this.auth.logoutRemote()?.subscribe({
      next: () => {
        this.auth.logout();
        this.router.navigateByUrl('/login', { replaceUrl: true });
      },
      error: () => {
        this.auth.logout();
        this.router.navigateByUrl('/login', { replaceUrl: true });
      }
    });
  }

  async openStory(index: number) {
    if (!this.stories.length) return;
    const modal = await this.modalCtrl.create({
      component: StoryViewerPage,
      componentProps: {
        stories: this.stories,
        startIndex: index,
      },
      cssClass: 'story-modal',
    });
    await modal.present();
  }
}
