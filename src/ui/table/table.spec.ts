import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { vi } from 'vitest';
import { Table } from './table';
import { TableColumn, TableRowData } from './models/table-column.model';

describe('Table', () => {
  let fixture: ComponentFixture<Table>;
  let component: Table;

  const columns: TableColumn[] = [
    { key: 'name', header: 'Name' },
    { key: 'orders', header: 'Orders', align: 'center' },
    { key: 'active', header: 'Active', align: 'right' },
    { key: 'note', header: 'Note', fallback: 'N/A' },
  ];

  const rows: TableRowData[] = [
    { id: 'shop-1', name: 'Ocean One', orders: 12, active: true, note: '' },
    { id: 99, name: 'Ocean Two', orders: 0, active: false, note: null },
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Table],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();

    fixture = TestBed.createComponent(Table);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('columns', columns);
    fixture.componentRef.setInput('rows', rows);
    await fixture.whenStable();
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render loading state', () => {
    fixture.componentRef.setInput('loading', true);
    fixture.componentRef.setInput('loadingText', 'Loading shops...');
    fixture.detectChanges();

    const state = fixture.debugElement.query(By.css('.table-state')).nativeElement as HTMLElement;
    const table = fixture.debugElement.query(By.css('.table-content'));

    expect(state.textContent).toContain('Loading shops...');
    expect(table).toBeNull();
  });

  it('should render empty state when rows are empty', () => {
    fixture.componentRef.setInput('rows', []);
    fixture.componentRef.setInput('emptyText', 'No shops yet');
    fixture.detectChanges();

    const state = fixture.debugElement.query(By.css('.table-state')).nativeElement as HTMLElement;
    const table = fixture.debugElement.query(By.css('.table-content'));

    expect(state.textContent).toContain('No shops yet');
    expect(table).toBeNull();
  });

  it('should render table headers and rows when data exists', () => {
    const headCells = fixture.debugElement.queryAll(By.css('th.table-head-cell'));
    const rowElements = fixture.debugElement.queryAll(By.css('tr.table-row'));

    expect(headCells.length).toBe(4);
    expect(headCells[0].nativeElement.textContent).toContain('Name');
    expect(headCells[1].nativeElement.textContent).toContain('Orders');
    expect(rowElements.length).toBe(2);
  });

  it('should render values and fallbacks for different cell value types', () => {
    const bodyRows = fixture.debugElement.queryAll(By.css('tr.table-row'));
    const firstRowCells = bodyRows[0].queryAll(By.css('td.table-cell'));
    const secondRowCells = bodyRows[1].queryAll(By.css('td.table-cell'));

    expect(firstRowCells[0].nativeElement.textContent).toContain('Ocean One');
    expect(firstRowCells[1].nativeElement.textContent).toContain('12');
    expect(firstRowCells[2].nativeElement.textContent).toContain('true');
    expect(firstRowCells[3].nativeElement.textContent).toContain('N/A');

    expect(secondRowCells[1].nativeElement.textContent).toContain('0');
    expect(secondRowCells[2].nativeElement.textContent).toContain('false');
    expect(secondRowCells[3].nativeElement.textContent).toContain('N/A');
  });

  it('should apply alignment classes based on column align', () => {
    const headCells = fixture.debugElement.queryAll(By.css('th.table-head-cell'));
    const firstRowCells = fixture.debugElement
      .queryAll(By.css('tr.table-row'))[0]
      .queryAll(By.css('td.table-cell'));

    expect(headCells[1].nativeElement.classList).toContain('table-cell-center');
    expect(headCells[2].nativeElement.classList).toContain('table-cell-right');
    expect(firstRowCells[1].nativeElement.classList).toContain('table-cell-center');
    expect(firstRowCells[2].nativeElement.classList).toContain('table-cell-right');
  });

  it('should render delete column and emit deleteRow when delete button is clicked', () => {
    fixture.componentRef.setInput('deleteEnabled', true);
    fixture.componentRef.setInput('deleteLabel', 'Remove');
    fixture.detectChanges();

    const emitSpy = vi.spyOn(component.deleteRow, 'emit');
    const actionHead = fixture.debugElement.query(By.css('.table-actions-head'));
    const deleteButtons = fixture.debugElement.queryAll(By.css('.table-delete-button'));

    expect(actionHead.nativeElement.textContent).toContain('Remove');
    expect(deleteButtons.length).toBe(2);

    deleteButtons[0].nativeElement.click();

    expect(emitSpy).toHaveBeenCalledWith(rows[0]);
  });

  it('should resolve row keys and alignment defaults', () => {
    expect((component as any).resolveRowKey({ id: 'shop-x' }, 0)).toBe('shop-x');
    expect((component as any).resolveRowKey({ id: 11 }, 1)).toBe('11');
    expect((component as any).resolveRowKey({ id: '' }, 2)).toBe('row-2');
    expect((component as any).resolveRowKey({}, 3)).toBe('row-3');
    expect((component as any).resolveAlignment()).toBe('left');
  });
});
