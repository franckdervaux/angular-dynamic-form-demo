// app.component.ts
import { Component, OnInit, computed, signal } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms'
import { HttpClient, HttpClientModule } from '@angular/common/http'
import { FormFieldComponent } from './form-field/form-field.component'
import { FormField } from './models/from-field.model'

@Component({
    selector: 'app-root',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, HttpClientModule, FormFieldComponent],
    template: `
    <div class="container">
        <h1>Dynamic Form Fields Demo</h1>
        
       @if (form()) {
            <div [formGroup]="form()!" class="form-container">
                @for (field of formFields(); track field.name) {
                    <app-form-field 
                        [field]="field" 
                        [form]="form()!"
                        [allFieldValues]="fieldValues">
                    </app-form-field>
                }
            </div>
            
            <div class="form-values">
                <h3>Current Form Values:</h3>
                <pre>{{ formValues() | json }}</pre>
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
    // Main form signals
    formFields = signal<FormField[]>([]);
    form = signal<FormGroup | null>(null);

    // Computed value to safely access the form values for display
    formValues = computed(() => {
        const currentForm = this.form()
        if (!currentForm) return {}
        return { ...currentForm.value }
    });

    // Registry of field values - will be populated by child components
    fieldValues: { [key: string]: any } = {};

    constructor(
        private fb: FormBuilder,
        private http: HttpClient
    ) { }

    ngOnInit() {
        this.loadFormConfig()
    }

    loadFormConfig() {
        this.http.get<FormField[]>('assets/form-config.json')
            .subscribe({
                next: (fields) => {
                    console.log('Loaded fields:', fields)
                    this.formFields.set(fields)
                    this.buildForm()
                },
                error: (error) => {
                    console.error('Error loading form config:', error)
                }
            })
    }

    buildForm() {
        const formControls: { [key: string]: any } = {}

        this.formFields().forEach(field => {
            // Initialize with default value if provided, otherwise empty string
            formControls[field.name] = [field.defaultValue || '']
        })

        this.form.set(this.fb.group(formControls))
    }
}