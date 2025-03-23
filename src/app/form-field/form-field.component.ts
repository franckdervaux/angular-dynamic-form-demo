// form-field/form-field.component.ts
import { Component, Input, OnInit, Signal, WritableSignal, computed, signal, DestroyRef, inject } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FormGroup, ReactiveFormsModule } from '@angular/forms'
import { Condition, FormField } from '../models/from-field.model'
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
`]
})
export class FormFieldComponent implements OnInit {
  @Input() field!: FormField
  @Input() form!: FormGroup
  @Input() allFieldValues!: { [key: string]: any }
  @Input() value!: WritableSignal<any>

  // Computed signal for visibility
  isVisible: Signal<boolean> = signal(true);

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

    const evaluateCondition = (condition: Condition) => {

      // Boolean Conditions
      if (condition.operator === 'true') {
        const dependencySignal = this.allFieldValues[condition.fieldName]
        if (!dependencySignal) return true
        // Check if the dependency field is true
        return dependencySignal()
      }

      if (condition.operator === 'false') {
        const dependencySignal = this.allFieldValues[condition.fieldName]
        if (!dependencySignal) return true
        // Check if the dependency field is false
        return !dependencySignal()
      }

      // Simple Conditions
      if (condition.operator === 'in') {
        const dependencySignal = this.allFieldValues[condition.fieldName]
        if (!dependencySignal) return true
        // Compare the dependency field's value to the list of values
        return condition.values.includes(dependencySignal())
      }

      if (condition.operator === 'notIn') {
        const dependencySignal = this.allFieldValues[condition.fieldName]
        if (!dependencySignal) return true
        // Compare the dependency field's value to the list of values
        return !condition.values.includes(dependencySignal())
      }

      // Nested Conditions
      if (condition.operator === 'and') {
        return condition.conditions.every(evaluateCondition)
      }

      if (condition.operator === 'or') {
        return condition.conditions.some(evaluateCondition)
      }

      return true
    }

    // Set up visibility rules if applicable
    if (this.field.visibility) {
      // Create computed signal that depends on the referenced field
      this.isVisible = computed(() => evaluateCondition(this.field.visibility!))
    }
  }
}