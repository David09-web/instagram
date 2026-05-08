import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonContent, IonHeader, IonToolbar, IonButtons, IonButton, IonIcon, ModalController } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { closeOutline } from 'ionicons/icons';

@Component({
  selector: 'app-story-viewer',
  templateUrl: './story-viewer.page.html',
  styleUrls: ['./story-viewer.page.scss'],
  standalone: true,
  imports: [CommonModule, IonContent, IonHeader, IonToolbar, IonButtons, IonButton, IonIcon]
})
export class StoryViewerPage {

  @Input() story: any;
  @Input() stories: any[] = [];
  @Input() startIndex: number = 0;

  currentIndex = 0;
  progress = 0;
  private timer: any;
  DURATION = 4000; // 4 segundos por historia

  base = 'http://192.168.56.1:8000/storage/';

  constructor(private modalCtrl: ModalController) {
    addIcons({ closeOutline });
  }

  ionViewDidEnter() {
    this.currentIndex = this.startIndex;
    this.startTimer();
  }

  ionViewWillLeave() {
    clearInterval(this.timer);
  }

  startTimer() {
    this.progress = 0;
    const step = 100 / (this.DURATION / 50);
    this.timer = setInterval(() => {
      this.progress += step;
      if (this.progress >= 100) {
        this.next();
      }
    }, 50);
  }

  next() {
    clearInterval(this.timer);
    if (this.currentIndex < this.stories.length - 1) {
      this.currentIndex++;
      this.startTimer();
    } else {
      this.close();
    }
  }

  prev() {
    clearInterval(this.timer);
    if (this.currentIndex > 0) {
      this.currentIndex--;
      this.startTimer();
    }
  }

  close() {
    clearInterval(this.timer);
    this.modalCtrl.dismiss();
  }

  imageUrl(path: string): string {
    if (!path) return 'https://i.pravatar.cc/600';
    if (path.startsWith('http')) return path;
    return this.base + path;
  }

  get currentStory() { return this.stories[this.currentIndex]; }
}
