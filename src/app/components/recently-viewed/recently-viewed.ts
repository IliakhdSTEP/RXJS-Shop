import { Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { scan } from 'rxjs';
import { Product, ShopService } from '../../services/shop';

@Component({
  selector: 'app-recently-viewed',
  imports: [],
  templateUrl: './recently-viewed.html',
  styleUrl: './recently-viewed.css'
})
export class RecentlyViewed {
  items = toSignal(
    inject(ShopService).viewed$.pipe(
      scan((all, p) => [...all, p].slice(-3), [] as Product[])
    ),
    { initialValue: [] as Product[] }
  );
}
