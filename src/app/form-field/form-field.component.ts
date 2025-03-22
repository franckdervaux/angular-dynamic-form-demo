// form-field/form-field.component.ts
import { Component, Input, OnInit, Signal, WritableSignal, computed, signal, DestroyRef, inject } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FormGroup, ReactiveFormsModule } from '@angular/forms'
import { FormField } from '../models/from-field.model'
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

    // Initialize the signal with the current value
    this.value.set(control.value)

    // Register this field's value signal in the parent's registry
    this.allFieldValues[this.field.name] = this.value

    // Connect form control to signal
    control.valueChanges.pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(newValue => {
      this.value.set(newValue)
    })

    // Set up visibility rules if applicable
    if (this.field.visibility) {
      const { fieldName, values, operator } = this.field.visibility

      // Create computed signal that depends on the referenced field
      this.isVisible = computed(() => {
        // Get the signal for the dependency field
        const dependencySignal = this.allFieldValues[fieldName]
        if (!dependencySignal) return true

        if (operator === 'in') {
          // Compare the dependency field's value to the list of values
          return values.includes(dependencySignal())
        }

        if (operator === 'notIn') {
          // Compare the dependency field's value to the list of values
          return !values.includes(dependencySignal())
        }

        return true
      })
    }
  }
}