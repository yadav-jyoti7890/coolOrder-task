import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CoolorderService } from '../../services/coolorder.service';
import { response } from 'express';
import { CommonModule } from '@angular/common';
import { flight, ProductItem } from '../../interfaces/form-interface';

@Component({
  selector: 'app-compare-list',
  imports: [CommonModule],
  templateUrl: './compare-list.component.html',
  styleUrl: './compare-list.component.css'
})
export class CompareListComponent implements OnInit {

  // @Input() compareId!:string

  // public compareId!: string | null
  public changeData: any[] = []

  constructor(private route: ActivatedRoute, private coolOrderService: CoolorderService) { }

  ngOnInit(): void {
    // this.compareId = this.route.snapshot.paramMap.get('id')
    // console.log(this.compareId)
    // this.compareData()
  }

  // private compareData() {
  //   // console.log(this.compareId)
  //   this.coolOrderService.getCompareDataWithId(this.compareId).subscribe({
  //     next: (response) => {
  //       // //console.log(response, "compare data")
  //       this.changeData = this.getChangedValueWithOldValue(response)
  //       // //console.log(this.changeData)
  //     }
  //   })
  // }

  private getChangedValueWithOldValue(cr: any): any {
    const preViousValue = cr.previousFormValue
    const CR = cr.CR
    const result = []
    //  //console.log(preViousValue, CR)
    for (const key in preViousValue) {
      if (key === 'productItems' || key === 'flight') continue;

      const preValue = preViousValue[key]
      // //console.log(preValue)

      // //console.log(preValue, oldValue)

      if (CR.hasOwnProperty(key)) {
        const newValue = CR[key]
        if (preValue != newValue) {
          result.push({
            field: key,
            preValue: preValue,
            newValue: newValue
          })
        }
      }
    }

    const previousFlight = preViousValue.flight || [];
    // console.log(previousFlight)
    const currentFlight = CR.flight || [];

    previousFlight.forEach((oldItem: any, index: number) => {
      // console.log(oldItem)
      const newItem = currentFlight[index] || {};
      console.log(newItem)

      for (const key in oldItem) {
        const oldVal = oldItem[key];
        const newVal = newItem[key];

        console.log(oldVal, newVal)
        // console.log()
        if (
          newItem.hasOwnProperty(key) &&
          newVal !== undefined &&
          oldVal !== newVal
        ) {
          result.push({
            field: key,
            preValue: oldVal,
            newValue: newVal
          });
        }
      }
    });

    const productItems = preViousValue.productItems || [];
    const current = CR.productItems || []
    // console.log(productItems, current)

    productItems.forEach((oldItem:any, index:number)=>{
      const newItem = current[index]
      console.log(newItem)

       for(const key in oldItem){
       const oldVal = oldItem[key];
       const newVal = newItem[key];

       // console.log()
        if (
          newItem.hasOwnProperty(key) &&
          newVal !== undefined &&
          oldVal !== newVal
        ) {
          result.push({
            field: key,
            preValue: oldVal,
            newValue: newVal
          });
        }
       }
    })

    return result
  }



}
