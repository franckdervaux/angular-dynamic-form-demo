// form-field/form-field.component.ts
import { Component, Input, OnInit, Signal, WritableSignal, computed, signal, DestroyRef, inject } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FormGroup, ReactiveFormsModule } from '@angular/forms'
import { AllFieldsValue, Condition, FormField } from '../models/from-field.model'
import { takeUntilDestroyed } from '@angular/core/rxjs-interop'
import { FormImageComponent } from './form-image/form-image.component'
import { DependentListComponent } from './dependent-list/dependent-list.component'

@Component({
  selector: 'app-form-field',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormImageComponent, DependentListComponent],
  template: `
    @if (isVisible()) {
      <div class="field-container" [formGroup]="form">
        @switch (field.type) {
          @case ('text') {
            <label [for]="field.name">{{field.label}}{{required ? ' *' : ''}}</label>
            <input 
              type="text"
              [id]="field.name" 
              [required]="required"
              [formControlName]="field.name">
          }
          @case ('select') {
            <label [for]="field.name">{{field.label}}{{required ? ' *' : ''}}</label>
            <select 
              [id]="field.name"
              [required]="required" 
              [formControlName]="field.name">
              <option value="">Select...</option>
              @for (option of field.options || []; track option.value) {
                <option [value]="option.value">{{option.label}}</option>
              }
            </select>
          }
          @case ('dependentList') {
             <app-dependent-list
              [field]="field"
              [required]="required"
              [form]="form"
              [allFieldValues]="allFieldValues">
            </app-dependent-list>
          }
          @case ('checkbox') {
            <div class="checkbox-container">
              <input 
                type="checkbox" 
                [id]="field.name"
                [required]="required" 
                [formControlName]="field.name">
              <label [for]="field.name">{{field.label}}{{required ? ' *' : ''}}</label>
            </div>
          }
          @case ('image') {
            <label [for]="field.name">{{field.label}}{{required ? ' *' : ''}}</label>
            <app-form-image
              [field]="field"
              [allFieldValues]="allFieldValues">
            </app-form-image>
          }
          @default {
            <label [for]="field.name">{{field.label}}{{required ? ' *' : ''}}</label>
            <input 
              type="text" 
              [id]="field.name"
              [required]="required" 
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

    label.required::after {
      content: ' *';
      color: red;
    }
`]
})
export class FormFieldComponent implements OnInit {
  @Input() field!: FormField
  @Input() form!: FormGroup
  @Input() allFieldValues!: AllFieldsValue
  @Input() value!: WritableSignal<any>

  isVisible: Signal<boolean> = signal(true);
  required: boolean = false;

  private destroyRef = inject(DestroyRef);

  ngOnInit() {
    const control = this.form.get(this.field.name)
    if (!control) return

    this.required = this.field.required ?? false

    control.valueChanges.pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(newValue => {
      this.value.set(newValue)
    })

    if (this.field.visibility !== undefined) {
      this.isVisible = computed(() => this.evaluateCondition(this.field.visibility!))
    }
  }

  private evaluateCondition(condition: Condition): boolean {
    const dependencySignal = 'fieldName' in condition ? this.allFieldValues[condition.fieldName] : undefined
    switch (condition.operator) {
      case 'true':
        return dependencySignal!()
      case 'false':
        return !dependencySignal!()
      case 'in':
        return condition.values.includes(dependencySignal!())
      case 'notIn':
        return !condition.values.includes(dependencySignal!())
      case 'and':
        return condition.conditions.every(this.evaluateCondition.bind(this))
      case 'or':
        return condition.conditions.some(this.evaluateCondition.bind(this))
      case 'not':
        return !this.evaluateCondition(condition.condition)
      default:
        return true
    }
  }
}