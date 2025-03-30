import { Component, Input, Signal, computed } from '@angular/core'
import { CommonModule } from '@angular/common'
import { AllFieldsValue, FormField } from '../../models/from-field.model'

@Component({
    selector: 'app-form-image',
    standalone: true,
    imports: [CommonModule],
    template: `
    <img 
      [src]="getImage()" 
      [alt]="field.label"
      class="display-image">
  `,
    styles: [`
    .display-image {
      max-width: 100%;
      height: auto;
      border-radius: 4px;
      margin-top: 8px;
    }
  `]
})
export class FormImageComponent {
    @Input() field!: FormField
    @Input() allFieldValues!: AllFieldsValue

    getImage: Signal<string> = computed(() => {
        let imageValue = this.field.image!.defaultImage
        if (this.field.image!.valueMap) {
            imageValue = this.field.image!.valueMap[this.allFieldValues[this.field.image!.fieldName]()] || this.field.image!.defaultImage
        }
        return `/assets/${imageValue}`
    });
}