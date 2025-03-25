// form-field/form-field.component.ts
import { Component, Input, OnInit, Signal, WritableSignal, computed, signal, DestroyRef, inject } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FormGroup, ReactiveFormsModule } from '@angular/forms'
import { Condition, FormField, NestedCondition } from '../models/from-field.model'
import { takeUntilDestroyed } from '@angular/core/rxjs-interop'

@Component({
  selector: 'app-form-field',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
        @if (isVisible()) {
            <div class="field-container" [formGroup]="form">
                @switch (field.type) {
                    @case ('text') {
                        <label [for]="field.name">{{field.label}}</label>
                        <input 
                            type="text"
                            [id]="field.name" 
                            [formControlName]="field.name">
                    }
                    @case ('select') {
                        <label [for]="field.name">{{field.label}}</label>
                        <select 
                            [id]="field.name" 
                            [formControlName]="field.name">
                            <option value="">Select...</option>
                            @for (option of field.options || []; track option.value) {
                                <option [value]="option.value">{{option.label}}</option>
                            }
                        </select>
                    }
                    @case ('checkbox') {
                        <div class="checkbox-container">
                            <input 
                                type="checkbox" 
                                [id]="field.name" 
                                [formControlName]="field.name">
                            <label [for]="field.name">{{field.label}}</label>
                        </div>
                    }
                    @case ('image') {
                        <label [for]="field.name">{{field.label}}</label>
                        <img 
                            [src]="getImage()" 
                            [alt]="field.label"
                            class="display-image">
                    }
                    @default {
                        <label [for]="field.name">{{field.label}}</label>
                        <input 
                            type="text" 
                            [id]="field.name" 
                            [formControlName]="field.name">
                    }
                }
            </div>
        }
    `,
  styles: [`
    .checkbox-container {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .checkbox-container input[type="checkbox"] {
      margin: 0;
    }

    .field-container {
        display: flex;
        flex-direction: column;
        margin-bottom: 10px;
    }
    
    label {
        margin-bottom: 5px;
        font-weight: bold;
    }
    
    input, select {
        padding: 8px;
        border: 1px solid #ccc;
        border-radius: 4px;
    }

    .display-image {
        max-width: 100%;
        height: auto;
        border-radius: 4px;
        margin-top: 8px;
    }
`]
})
export class FormFieldComponent implements OnInit {
  @Input() field!: FormField
  @Input() form!: FormGroup
  @Input() allFieldValues!: { [key: string]: any }
  @Input() value!: WritableSignal<any>

  // Computed signal for visibility
  isVisible: Signal<boolean> = signal(true)
  getImage: Signal<string> = signal('')

  // Inject DestroyRef for takeUntilDestroyed
  private destroyRef = inject(DestroyRef);

  ngOnInit() {
    const control = this.form.get(this.field.name)
    if (!control) return

    // Connect form control to signal
    control.valueChanges.pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(newValue => {
      this.value.set(newValue)
    })

    const evaluateCondition = (condition: Condition): boolean => {

      const dependencySignal = 'fieldName' in condition ? this.allFieldValues[condition.fieldName] : undefined
      switch (condition.operator) {
        case 'true':
          return dependencySignal()
        case 'false':
          return !dependencySignal()
        case 'in':
          return condition.values.includes(dependencySignal())
        case 'notIn':
          return !condition.values.includes(dependencySignal())
        case 'and':
          return condition.conditions.every(evaluateCondition)
        case 'or':
          return condition.conditions.some(evaluateCondition)
        case 'not':
          return !evaluateCondition(condition.condition)
        default:
          return true
      }
    }

    // Set up visibility rules if applicable
    if (this.field.visibility) {
      // Create computed signal that depends on the referenced field
      this.isVisible = computed(() => evaluateCondition(this.field.visibility!))
    }

    if (this.field.image) {
      this.getImage = computed(() => {
        const imageDefinition = this.field.image!
        if (imageDefinition.valueMap) {
          const imageValue = this.allFieldValues[imageDefinition.fieldName]()
          return `/assets/${imageDefinition.valueMap[imageValue] || imageDefinition.defaultImage}`
        }

        return imageDefinition.defaultImage
      })
    }
  }
}