// form-field.component.ts
import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { FormField } from '../models/from-field.model';

@Component({
    selector: 'app-form-field',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule],
    template: `
    <div class="field-container" [formGroup]="form">
      <label [for]="field.name">{{ field.label }}</label>
      
      @if (field.type === 'text') {
        <input 
          [id]="field.name"
          [formControlName]="field.name"
          type="text" 
          class="form-input"
        />
      }
      
      @if (field.type === 'select') {
        <select 
          [id]="field.name"
          [formControlName]="field.name"
          class="form-select"
        >
          <option value="">-- Select an option --</option>
          @for (option of field.options; track option.value) {
            <option [value]="option.value">
              {{ option.label }}
            </option>
          }
        </select>
      }
    </div>
  `,
    styles: [`
    .field-container {
      display: flex;
      flex-direction: column;
      margin-bottom: 15px;
    }
    
    label {
      margin-bottom: 5px;
      font-weight: bold;
    }
    
    .form-input, .form-select {
      padding: 8px;
      border: 1px solid #ccc;
      border-radius: 4px;
      font-size: 16px;
    }
    
    .form-select {
      height: 40px;
    }
  `]
})
export class FormFieldComponent {
    @Input() field!: FormField;
    @Input() form!: FormGroup;
}
