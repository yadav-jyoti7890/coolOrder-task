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
    console.log(this.excelData.length, "excelData")

    console.log("onFile change")
    const file = event.target.files[0];
    const reader = new FileReader();

    reader.onload = (e: any) => {
      const binaryData = e.target.result;
      const workbook = XLSX.read(binaryData, { type: 'binary' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const newExcelData = XLSX.utils.sheet_to_json(worksheet);

      const formArray = this.orderForm.controls['orders'] as FormArray<FormGroup>;
      while (formArray.length > 0) {
        formArray.removeAt(0);
      }

      newExcelData.forEach((order: any) => {
        formArray.push(this.newOrder(order))
      })
    }

    reader.readAsArrayBuffer(file)
  }

  // private excelDateToJSDate(excelSerialDate: number): string {
  //   const utc_days = Math.floor(excelSerialDate - 25569);
  //   const date = new Date(utc_days * 86400 * 1000);
  //   const iso = date.toISOString().split('T')[0];
  //   return iso;
  // }

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
    console.log(exportData)
    this.ExcelService.exportAsExcelFile(exportData, 'Updated Data')
  }

  public CSV() {
    const exportCvData: any = this.orderForm.value.orders
    this.csvService.convertToCSV(exportCvData)
    this.csvService.exportCSV(exportCvData, 'Updated Csv')
  }

}
