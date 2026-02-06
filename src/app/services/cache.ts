import { Injectable } from '@angular/core';

interface CacheClima {
  value: any;
  expiracion: number;
}

@Injectable({
  providedIn: 'root',
})
export class Cache {

  private readonly totalTiempoCache_KEY = 'cache-ttl-ms';
  private readonly defaultTiempoCache = 1000 * 60 * 60 * 2; // 2 horas
  private readonly pestanasActivas_key = 'tabsActivas';

  getTiempoCache(): number {
    const stored = localStorage.getItem(this.totalTiempoCache_KEY);
    return stored ? Number(stored) : this.defaultTiempoCache;
  }

  setTiempoCache(ttlMs: number): void {
    localStorage.setItem(this.totalTiempoCache_KEY, String(ttlMs));
  }

  getTabsActivasCache(): string[] {
    const raw = localStorage.getItem(this.pestanasActivas_key);
    return raw ? JSON.parse(raw) : [];
  }

  setTabsActivaCache(zipCode: string): void {
    const tabsActivas = this.getTabsActivasCache();

    if (!tabsActivas.includes(zipCode)) {
      tabsActivas.push(zipCode);
      localStorage.setItem(this.pestanasActivas_key, JSON.stringify(tabsActivas));
    }
  }

  removeTabActiva(zip: string): void {
    const tabs = this.getTabsActivasCache().filter(z => z !== zip);
    localStorage.setItem(this.pestanasActivas_key, JSON.stringify(tabs));
  }


  get(key: string): any | null {
    const climaGuardado = localStorage.getItem(key);
    if (!climaGuardado) return null;

    try {
      const weather: CacheClima = JSON.parse(climaGuardado);
      if (Date.now() > weather.expiracion) {
        localStorage.removeItem(key);
        return null;
      }

      return weather.value;
    } catch {
      localStorage.removeItem(key);
      return null;
    }
  }

  set(key: string, value: any, tiempoExpiracion: number = this.defaultTiempoCache): void {
    const clima: CacheClima = {
      value,
      expiracion: Date.now() + tiempoExpiracion,
    };

    localStorage.setItem(key, JSON.stringify(clima));
  }

  clear(key: string): void {
    localStorage.removeItem(key);
  }

}
