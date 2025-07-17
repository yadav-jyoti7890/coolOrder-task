import { Component } from '@angular/core';
import * as XLSX from 'xlsx';
import { order } from '../../interfaces/form-interface';
import { CoolorderComponent } from '../coolorder/coolorder.component';
import { CoolorderService } from '../../services/coolorder.service';
import { RouterLink } from '@angular/router';
import { ConfirmBoxComponent } from '../../confirmation-dialog-box/confirm-box/confirm-box.component';
import { CommonModule } from '@angular/common';
import { MatDialogModule } from '@angular/material/dialog';
import { FormArray, FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ExcelService } from '../../services/excel.service';
import { CsvService } from '../../services/csv.service';


@Component({
  selector: 'app-excel',
  imports: [CommonModule, RouterLink, ConfirmBoxComponent, MatDialogModule, ReactiveFormsModule],
  templateUrl: './excel.component.html',
  styleUrl: './excel.component.css'
})
export class ExcelComponent {

  public excelData: order[] = []
  public sortedFiled!: string;
  public sortType!: string

  constructor(private CoolOrderService: CoolorderService, private ExcelService: ExcelService, private csvService: CsvService) { }

  orderForm = new FormGroup({
    orders: new FormArray<FormGroup>([])
  })

  public onFileChange(event: any) {
    const file = event.target.files[0];
    const fileName = file.name.toLowerCase();

    const reader = new FileReader();
    reader.onload = (e: any) => {
      const result = e.target.result;
      let jsonData: any[] = [];

      if (fileName.endsWith('.csv')) {
        const workbook = XLSX.read(result, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        jsonData = XLSX.utils.sheet_to_json(worksheet);
        jsonData.forEach((order: any) => {
          order.leaseStart = this.excelDateToJSDate(order.leaseStart);
          order.leaseEnd = this.excelDateToJSDate(order.leaseEnd);
          order.create_at = this.excelDateToJSDate(order.create_at);
        });
    } else if (fileName.endsWith('.xls') || fileName.endsWith('.xlsx')) {
      const workbook = XLSX.read(result, { type: 'binary' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      jsonData = XLSX.utils.sheet_to_json(worksheet);
    }
    else {
      alert('Unsupported file format.');
      return;
    }

    const formArray = this.orderForm.controls['orders'] as FormArray<FormGroup>;
    while (formArray.length > 0) {
      formArray.removeAt(0);
    }

    jsonData.forEach((order: any) => {
      console.log(order)
      formArray.push(this.newOrder(order))
    })
  }

    reader.readAsArrayBuffer(file)
}

  // Converts Excel serial date (like 45123) or string date to 'YYYY-MM-DD'
  public excelDateToJSDate(value: any): string {
  if (typeof value === 'number') {
    // Excel stores dates as serial numbers starting from Jan 1, 1900
    const excelEpoch = new Date(1899, 11, 30); // Excel base date
    const jsDate = new Date(excelEpoch.getTime() + value * 86400000); // 86400000 = 1 day in ms
    return jsDate.toISOString().substring(0, 10); // return YYYY-MM-DD
  }

  const jsDate = new Date(value); // If it's a valid string date
  if (!isNaN(jsDate.getTime())) {
    return jsDate.toISOString().substring(0, 10);
  }

  return ''; // Invalid date
}


  private newOrder(order: any): FormGroup {
  return new FormGroup({
    id: new FormControl(order.orderId || ''),
    org: new FormControl(order.org || ''),
    des: new FormControl(order.des || ''),
    pickUpPort: new FormControl(order.pickUpPort || ''),
    leaseStart: new FormControl(order.leaseStart || ''),
    leaseEnd: new FormControl(order.leaseEnd || ''),
    rentalDays: new FormControl(order.rentalDays || ''),
    productCode: new FormControl(order.productCode || ''),
    create_at: new FormControl(order.create_at || '')
  })
}

  public deleteRow(i: number) {
  const Row = this.orderForm.controls.orders.removeAt(i)
  console.log(Row)
}

  public exportToExcel() {
  const exportData: any = this.orderForm.value.orders
  console.log(exportData.length)
  if (exportData.length > 0) {
    this.ExcelService.exportAsExcelFile(exportData, 'Updated Data')
  }
  else {
    alert("First Select Excel File")
  }
}

  public CSV() {
  const exportCvData: any = this.orderForm.value.orders
  if (exportCvData.length > 0) {
    this.csvService.convertToCSV(exportCvData)
    this.csvService.exportCSV(exportCvData, 'Updated Csv')
  }
  else {
    alert("First Choose CSV File")
  }
}

}
