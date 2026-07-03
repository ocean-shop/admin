import { Component, computed, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Button } from '@ui/button/button';
import { UserCard } from '@ui/user-card/user-card';
import { Admin, AdminApiItem, AdminsApiResponse } from './models/admin.model';
import { AdminsService } from './services/admins.service';
import {
  ADMINS_CREATE_ICON,
  ADMINS_CREATE_LABEL,
  ADMINS_DEFAULT_EMAIL,
  ADMINS_DEFAULT_NAME,
  ADMINS_DEFAULT_PHONE,
  ADMINS_DEFAULT_ROLE,
  ADMINS_EMPTY_STATE,
  ADMINS_PAGE_TITLE,
} from './constants/admins.constants';

@Component({
  selector: 'app-admins',
  imports: [Button, UserCard],
  templateUrl: './admins.html',
  styleUrl: './admins.scss',
})
export class Admins implements OnInit {
  private readonly adminsService = inject(AdminsService);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly title = ADMINS_PAGE_TITLE;
  protected readonly createAdminLabel = ADMINS_CREATE_LABEL;
  protected readonly createAdminIcon = ADMINS_CREATE_ICON;
  protected readonly emptyState = ADMINS_EMPTY_STATE;

  protected readonly isLoading = signal(true);
  protected readonly hasError = signal(false);
  protected readonly admins = signal<Admin[]>([]);
  protected readonly lastAction = signal<string | null>(null);
  protected readonly hasAdmins = computed(() => this.admins().length > 0);

  ngOnInit(): void {
    this.loadAdmins();
  }

  protected onCreateAdmin(): void {
    this.lastAction.set('create');
  }

  protected onEditAdmin(admin: Admin): void {
    this.lastAction.set(`edit:${admin.id}`);
  }

  protected onDeleteAdmin(admin: Admin): void {
    this.lastAction.set(`delete:${admin.id}`);
  }

  private loadAdmins(): void {
    this.adminsService
      .getAdmins()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          this.admins.set(this.mapAdminsResponse(response));
        },
      });
  }

  private mapAdminsResponse(response: AdminsApiResponse | AdminApiItem[]): Admin[] {
    const admins = Array.isArray(response)
      ? response
      : (response.items ?? response.admins ?? response.data ?? []);
    return admins.map((admin) => this.mapAdmin(admin));
  }

  private mapAdmin(admin: AdminApiItem): Admin {
    const mergedName = [admin.firstName, admin.lastName].filter(Boolean).join(' ').trim();
    const resolvedName = admin.fullName ?? admin.name ?? mergedName;
    const resolvedPhone = admin.phone ?? admin.mobileNumber;
    const resolvedRole = typeof admin.role === 'string' ? admin.role : admin.role?.name;

    return {
      id: String(admin.id ?? crypto.randomUUID()),
      name: resolvedName || ADMINS_DEFAULT_NAME,
      email: admin.email || ADMINS_DEFAULT_EMAIL,
      phone: resolvedPhone || ADMINS_DEFAULT_PHONE,
      role: resolvedRole || ADMINS_DEFAULT_ROLE,
    };
  }
}
