// app.component.ts
import { Component, OnInit, computed, signal, effect, WritableSignal } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms'
import { HttpClient, HttpClientModule } from '@angular/common/http'
import { FormFieldComponent } from './form-field/form-field.component'
import { FormField, TemplateDefinition } from './models/from-field.model'

@Component({
    selector: 'app-root',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, HttpClientModule, FormFieldComponent],
    template: `
    <div class="container">
        <h1>{{title()}}</h1>
        
       @if (form()) {
            <div [formGroup]="form()!" class="form-container">
                @for (field of formFields(); track field.name) {
                    <app-form-field 
                        [field]="field" 
                        [form]="form()!"
                        [allFieldValues]="fieldValues"
                        [value]="fieldValues[field.name]">
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
    title = signal('')

    // Registry of field values - will be populated by child components
    fieldValues: { [key: string]: any } = {};
    formValues: WritableSignal<{ [key: string]: any }> = signal({});

    constructor(
        private fb: FormBuilder,
        private http: HttpClient
    ) {
        effect(() => {
            const currentForm = this.form()
            if (currentForm) {
                this.formValues.set(currentForm.value)
                const subscription = currentForm.valueChanges.subscribe(values => {
                    this.formValues.set(values)
                })
                return () => subscription.unsubscribe()
            }
            return () => { }
        })

    }

    ngOnInit() {
        this.loadFormConfig()
    }

    loadFormConfig() {
        this.http.get<TemplateDefinition>('assets/form-config.json')
            .subscribe({
                next: (template) => {
                    console.log('Loaded fields:', template)
                    this.formFields.set(template.fields)
                    this.title.set(template.name)
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
            this.fieldValues[field.name] = signal(field.defaultValue || '')
        })

        this.form.set(this.fb.group(formControls))
    }
}