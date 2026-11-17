import { Component, computed, inject, signal, OnInit, OnDestroy } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Subscription } from 'rxjs';
import { Product, ShopService } from '../../services/shop';
import { RecentlyViewed } from '../recently-viewed/recently-viewed';

@Component({
  selector: 'app-shop',
  imports: [RecentlyViewed],
  templateUrl: './shop.html',
  styleUrl: './shop.css'
})
export class Shop implements OnInit, OnDestroy {
  service = inject(ShopService);

  products: Product[] = [
    { id: 1, name: 'Laptop', price: 2500 },
    { id: 2, name: 'Phone', price: 1200 },
    { id: 3, name: 'Headphones', price: 150 },
    { id: 4, name: 'Keyboard', price: 200 }
  ];

  cartOpen = signal(false);
  showViewed = signal(true);
  paying = signal(false);
  toast = signal('');
  online = signal(navigator.onLine);

  cart = toSignal(this.service.cart$, { requireSync: true });

  count = computed(() => this.cart().length);

  total = computed(() =>
    this.cart().reduce((sum, p) => sum + p.price, 0)
  );

  subscription = new Subscription();
  toastTimer: ReturnType<typeof setTimeout> | undefined;

  ngOnInit() {
    this.subscription.add(
      this.service.notify$.subscribe(message => {
        this.showToast(message);
      })
    );

    this.subscription.add(
      this.service.cart$.subscribe(cart => {
        localStorage.setItem('cart', JSON.stringify(cart));
      })
    );

    window.addEventListener('online', this.updateOnline);
    window.addEventListener('offline', this.updateOnline);
  }

  updateOnline = () => {
    this.online.set(navigator.onLine);
  };

  showToast(message: string) {
    this.toast.set(message);

    clearTimeout(this.toastTimer);

    this.toastTimer = setTimeout(() => {
      this.toast.set('');
    }, 2000);
  }

  add(product: Product) {
    this.service.add(product);
  }

  view(product: Product) {
    this.service.view(product);
    this.showToast(`${product.name} ნახულია`);
  }

  remove(index: number) {
    this.service.remove(index);
  }

  checkout() {
    if (this.count() === 0 || this.paying()) return;

    this.paying.set(true);

    this.subscription.add(
      this.service.checkout().subscribe(order => {
        this.paying.set(false);
        this.cartOpen.set(false);
        this.showToast(`შეკვეთა მიღებულია: ${order}`);
      })
    );
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
    clearTimeout(this.toastTimer);
    window.removeEventListener('online', this.updateOnline);
    window.removeEventListener('offline', this.updateOnline);
  }
}
