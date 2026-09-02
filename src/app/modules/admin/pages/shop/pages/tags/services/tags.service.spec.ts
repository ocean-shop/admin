import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { API_URL } from '@core/constants/api.constant';
import { CreateTagPayload } from '../models/tag-payload.model';
import { TagsService } from './tags.service';

describe('TagsService', () => {
  let service: TagsService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });

    service = TestBed.inject(TagsService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('gets tags with optional name param', () => {
    service.getTags({ page: 1, limit: 20, shopId: 'shop-1', name: 'new' }).subscribe();

    const req = httpMock.expectOne(
      `${API_URL}/catalog/tags?page=1&limit=20&shopId=shop-1&name=new`,
    );
    expect(req.request.method).toBe('GET');
    expect(req.request.withCredentials).toBe(true);
    req.flush({ items: [], total: 0, page: 1, limit: 20, totalPages: 1 });
  });

  it('gets tags without name param when not provided', () => {
    service.getTags({ page: 2, limit: 10, shopId: 'shop-2' }).subscribe();

    const req = httpMock.expectOne((request) => {
      return (
        request.url === `${API_URL}/catalog/tags` &&
        request.params.get('page') === '2' &&
        request.params.get('limit') === '10' &&
        request.params.get('shopId') === 'shop-2' &&
        !request.params.has('name')
      );
    });

    expect(req.request.method).toBe('GET');
    expect(req.request.withCredentials).toBe(true);
    req.flush({ items: [], total: 0, page: 2, limit: 10, totalPages: 1 });
  });

  it('creates tag with payload', () => {
    const payload: CreateTagPayload = { shopId: 'shop-1', name: 'New' };

    service.createTag(payload).subscribe();

    const req = httpMock.expectOne(`${API_URL}/catalog/tags`);
    expect(req.request.method).toBe('POST');
    expect(req.request.withCredentials).toBe(true);
    expect(req.request.body).toEqual(payload);
    req.flush({ id: 'tag-1' });
  });

  it('deletes tag by id', () => {
    service.deleteTag('tag-1').subscribe();

    const req = httpMock.expectOne(`${API_URL}/catalog/tags/tag-1`);
    expect(req.request.method).toBe('DELETE');
    expect(req.request.withCredentials).toBe(true);
    req.flush({});
  });
});
