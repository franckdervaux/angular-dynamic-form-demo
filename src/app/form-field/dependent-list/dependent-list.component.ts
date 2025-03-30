import { Component, Input, Signal } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FormGroup, ReactiveFormsModule } from '@angular/forms'
import { FormField } from '../../models/from-field.model'

@Component({
    selector: 'app-dependent-list',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule],
    template: `
    <div [formGroup]="form">
      <select [formControlName]="field.name">
        <option value="">Select...</option>
        @for (option of getOptions(); track option.value) {
          <option [value]="option.value">{{option.label}}</option>
        }
      </select>
    </div>
  `
})
export class DependentListComponent {
    @Input() field!: FormField
    @Input() form!: FormGroup
    @Input() required!: boolean
    @Input() allFieldValues!: { [key: string]: Signal<any> }

    getOptions() {
        const dependentValue = this.allFieldValues[this.field.dependentOptions!.fieldName]()
        return this.field.dependentOptions!.listMap[dependentValue] || []
    }
}