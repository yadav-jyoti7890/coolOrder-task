import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class CsvService {

  constructor() { }

   public convertToCSV(data: any[]): string {
      if (!data || !data.length) return '';
      console.log(data)
  
      const header = Object.keys(data[0]).join(',') + '\r\n';
      const rows = data.map(row => Object.values(row).join(',')).join('\r\n');
  
      return header + rows;
    }
  
    public exportCSV(data: any[], fileName: string) {
      const csvData = this.convertToCSV(data);
      const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
  
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName + '.csv');
      link.click();
    }
}
