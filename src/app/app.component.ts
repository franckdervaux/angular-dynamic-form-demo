// app.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { FormFieldComponent } from './form-field/form-field.component';
import { FormField, FormFieldVisibility } from './models/from-field.model'

@Component({
    selector: 'app-root',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, HttpClientModule, FormFieldComponent],
    template: `
    <div class="container">
        <h1>Dynamic Form Fields Demo</h1>
        
        <div>Debug Info:</div>
        <div>Form Fields: {{formFields.length}}</div>
        <div>Form Valid: {{form?.valid}}</div>
        
        @if (form) {
            <div [formGroup]="form" class="form-container">
                @for (field of formFields; track field.name) {
                    @if (isFieldVisible(field)) {
                        <app-form-field 
                            [field]="field" 
                            [form]="form">
                        </app-form-field>
                    }
                }
            </div>
            
            <div class="form-values">
                <h3>Current Form Values:</h3>
                <pre>{{ form.value | json }}</pre>
            </div>
        }
    </div>
    `,
    styles: [`
    .container {
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
      font-family: Arial, sans-serif;
    }
    
    .form-container {
      display: flex;
      flex-direction: column;
      gap: 20px;
      margin-top: 20px;
    }
    
    .form-values {
      margin-top: 30px;
      padding: 15px;
      background-color: #f5f5f5;
      border-radius: 5px;
    }
    
    pre {
      white-space: pre-wrap;
      word-break: break-all;
    }
  `]
})
export class AppComponent implements OnInit {
    form!: FormGroup;
    formFields: FormField[] = [];

    constructor(
        private fb: FormBuilder,
        private http: HttpClient
    ) { }

    ngOnInit() {
        this.loadFormConfig();
    }

    loadFormConfig() {
        this.http.get<FormField[]>('assets/form-config.json')
            .subscribe({
                next: (fields) => {
                    console.log('Loaded fields:', fields);
                    this.formFields = fields;
                    this.buildForm();
                },
                error: (error) => {
                    console.error('Error loading form config:', error);
                }
            });
    }

    buildForm() {
        const formControls: { [key: string]: any } = {};

        this.formFields.forEach(field => {
            // Initialize with default value if provided, otherwise empty string
            formControls[field.name] = [field.defaultValue || ''];
        });

        this.form = this.fb.group(formControls);

        // Subscribe to value changes to handle visibility rules
        this.form.valueChanges.subscribe(() => {
            // This will trigger change detection when form values change
        });
    }

    isFieldVisible(field: FormField): boolean {
        if (!field.visibility) {
            return true;
        }

        const refFieldValue = this.form.get(field.visibility.fieldName)?.value;
        return refFieldValue === field.visibility.value;
    }
}