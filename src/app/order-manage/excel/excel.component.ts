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
  public sortType!: string;
  public uploadFiles: string[] = []

  constructor(private CoolOrderService: CoolorderService, private ExcelService: ExcelService, private csvService: CsvService) { }

  orderForm = new FormGroup({
    orders: new FormArray<FormGroup>([])
  })

  public onFileChange(event: any) {
    // console.log("click onFileChange")
    const file = event.target.files[0];
    const fileName = file.name.toLowerCase()
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
      }
      else if (fileName.endsWith('.xls') || fileName.endsWith('.xlsx')) {
        const workbook = XLSX.read(result, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        jsonData = XLSX.utils.sheet_to_json(worksheet);
        // jsonData.forEach((order: any) => {
        //   order.leaseStart = this.excelDateToJSDate(order.leaseStart);
        //   order.leaseEnd = this.excelDateToJSDate(order.leaseEnd);
        //   order.create_at = this.excelDateToJSDate(order.create_at);
        // });
      }
      else {
        alert('Unsupported file format.');
        return;
      }
      const formArray = this.orderForm.controls['orders'] as FormArray<FormGroup>;
      const existingEntries = formArray.controls.map(ctrl => ctrl.value);
      let i = 0;

      jsonData.forEach((newData) => {

        const isDuplicate = existingEntries.some((exits) => {
          console.log(exits, newData)
          console.log(typeof exits.leaseStart , typeof newData.leaseStart, exits.leaseStart === newData.leaseStart, 
            i++,  exits.leaseStart , newData.leaseStart)
          console.log(typeof exits.leaseEnd , typeof newData.leaseEnd, exits.leaseStart === newData.leaseStart,
            i++,  exits.leaseStart , newData.leaseStart)
          console.log(typeof exits.create_at , typeof newData.create_at, exits.leaseStart === newData.leaseStart,
            i++, exits.leaseStart,newData.leaseStart)
            console.log(typeof exits.productCode , typeof newData.productCode, exits.productCode === newData.productCode,
              exits.productCode, newData.productCode
            )

          return (
            exits.org === newData.org,
            exits.des === newData.des,
            exits.pickUpPort === newData.pickUpPort,
            exits.leaseStart === newData.leaseStart,
            exits.leaseEnd === newData.leaseEnd,
            exits.rentalDays === newData.rentalDays,
            exits.create_at === newData.create_at,
            exits.productCode == newData.productCode
          );
        });

        if (!isDuplicate) {
          formArray.push(this.newOrder(newData));
        }
      });

    }
    reader.readAsArrayBuffer(file)
  }

  public formatDate(date: any): string {
  const d = new Date(date);
  return isNaN(d.getTime()) ? '' : d.toISOString().split('T')[0]; // 'YYYY-MM-DD'
}


  public excelDateToJSDate(value: any): string {
    if (typeof value === 'number') {

      const excelEpoch = new Date(1899, 11, 30);
      const jsDate = new Date(excelEpoch.getTime() + value * 86400000);
      return jsDate.toISOString().substring(0, 10);
    }

    const jsDate = new Date(value);
    if (!isNaN(jsDate.getTime())) {
      return jsDate.toISOString().substring(0, 10);
    }

    return '';
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
      alert("save updated file")
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
